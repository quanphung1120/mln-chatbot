"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import type { QuizMode } from "./types";
import { getBank } from "./data";

// ---------------------------------------------------------------------------
// Persistence + gamification for the quiz feature. Scoped on the Clerk userId
// (string), mirroring how the study-room game state is stored.
// ---------------------------------------------------------------------------

// Only the user's *choice* is trusted from the client; correctness is derived
// server-side from the authoritative question bank (never trust client scoring).
const answerSchema = z.object({
  questionId: z.number().int(),
  chosen: z.number().int().nullable(),
});

const attemptSchema = z.object({
  courseCode: z.string().min(2).max(16),
  mode: z.enum(["practice", "exam", "review"]),
  durationSec: z.number().int().min(0).max(1_000_000),
  answers: z.array(answerSchema).min(1).max(2000),
});

export interface RecordAttemptInput {
  courseCode: string;
  mode: QuizMode;
  durationSec: number;
  answers: { questionId: number; chosen: number | null }[];
}

export interface AttemptResult {
  ok: boolean;
  score?: number;
  correct?: number;
  total?: number;
  xpEarned?: number;
  currentStreak?: number;
}

// Calendar-day index in Asia/Ho_Chi_Minh (UTC+7, no DST), so streaks follow the
// student's local day regardless of where the server runs.
function dayIndexVN(d: Date): number {
  return Math.floor((d.getTime() + 7 * 3_600_000) / 86_400_000);
}

/** Record a finished quiz run: attempt row + per-question SR stats + streak/xp. */
export async function recordAttempt(input: RecordAttemptInput): Promise<AttemptResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false };

  const parsed = attemptSchema.safeParse(input);
  if (!parsed.success) {
    console.error("[recordAttempt] invalid payload:", parsed.error.flatten());
    return { ok: false };
  }

  const { courseCode, mode, durationSec, answers } = parsed.data;

  // Grade against the real bank; drop unknown ids AND dedupe by questionId so a
  // forged payload (same known-correct question repeated) can't inflate xp/score.
  const answerKey = new Map(getBank(courseCode).map((q) => [q.id, q.answer]));
  const seen = new Set<number>();
  const graded: { questionId: number; correct: boolean }[] = [];
  for (const a of answers) {
    if (!answerKey.has(a.questionId) || seen.has(a.questionId)) continue;
    seen.add(a.questionId);
    graded.push({ questionId: a.questionId, correct: a.chosen === answerKey.get(a.questionId) });
  }

  if (graded.length === 0) return { ok: false };

  const total = graded.length;
  const correct = graded.filter((a) => a.correct).length;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  // XP: 10 per correct answer, plus an exam bonus scaled by score.
  const xpEarned = correct * 10 + (mode === "exam" ? Math.round(score / 5) : 0);

  try {
    // Load all existing SR rows in ONE query, then write in parallel — avoids a
    // per-question findUnique+upsert loop that could time out on a 573-q run.
    const existingRows = await prisma.questionStat.findMany({
      where: { userId, courseCode, questionId: { in: graded.map((g) => g.questionId) } },
    });
    const byId = new Map(existingRows.map((r) => [r.questionId, r]));

    await prisma.quizAttempt.create({
      data: { userId, courseCode, mode, total, correct, score, durationSec },
    });

    await Promise.all(
      graded.map((g) =>
        writeQuestionStat(userId, courseCode, g.questionId, g.correct, byId.get(g.questionId)),
      ),
    );

    const currentStreak = await bumpStreak(userId, xpEarned);

    return { ok: true, score, correct, total, xpEarned, currentStreak };
  } catch (error) {
    console.error("[recordAttempt] failed:", error);
    return { ok: false };
  }
}

// SM-2-ish spaced-repetition update for a single question. `existing` is the
// pre-fetched row (or undefined) so this does no extra read.
async function writeQuestionStat(
  userId: string,
  courseCode: string,
  questionId: number,
  correct: boolean,
  existing: { intervalDays: number; ease: number } | undefined,
) {
  const now = new Date();
  const prevInterval = existing?.intervalDays ?? 0;
  const prevEase = existing?.ease ?? 250;

  let intervalDays: number;
  let ease = prevEase;
  if (correct) {
    if (prevInterval <= 0) intervalDays = 1;
    else if (prevInterval === 1) intervalDays = 3;
    else intervalDays = Math.round((prevInterval * ease) / 100);
    ease = Math.min(320, ease + 5);
  } else {
    intervalDays = 0; // due again immediately
    ease = Math.max(130, ease - 20);
  }
  const dueAt = new Date(now.getTime() + intervalDays * 86_400_000);

  await prisma.questionStat.upsert({
    where: { userId_courseCode_questionId: { userId, courseCode, questionId } },
    create: {
      userId,
      courseCode,
      questionId,
      timesSeen: 1,
      timesCorrect: correct ? 1 : 0,
      lastCorrect: correct,
      dueAt,
      ease,
      intervalDays,
    },
    update: {
      timesSeen: { increment: 1 },
      timesCorrect: { increment: correct ? 1 : 0 },
      lastCorrect: correct,
      dueAt,
      ease,
      intervalDays,
    },
  });
}

// Update the daily streak + xp, snapshotting the Clerk display name/avatar.
async function bumpStreak(userId: string, xpEarned: number): Promise<number> {
  const now = new Date();
  const stats = await prisma.userStats.findUnique({ where: { userId } });

  let currentStreak = 1;
  let longestStreak = 1;
  if (stats) {
    longestStreak = stats.longestStreak;
    if (stats.lastActiveDate) {
      const diffDays = dayIndexVN(now) - dayIndexVN(stats.lastActiveDate);
      if (diffDays <= 0) currentStreak = Math.max(1, stats.currentStreak);
      else if (diffDays === 1) currentStreak = stats.currentStreak + 1;
      else currentStreak = 1;
    }
    longestStreak = Math.max(longestStreak, currentStreak);
  }

  let displayName: string | undefined;
  let avatarUrl: string | undefined;
  try {
    const user = await currentUser();
    if (user) {
      displayName =
        user.fullName ??
        user.username ??
        user.primaryEmailAddress?.emailAddress ??
        undefined;
      avatarUrl = user.imageUrl ?? undefined;
    }
  } catch {
    // non-fatal: leaderboard just shows a fallback label
  }

  await prisma.userStats.upsert({
    where: { userId },
    create: {
      userId,
      displayName,
      avatarUrl,
      currentStreak,
      longestStreak,
      lastActiveDate: now,
      xp: xpEarned,
    },
    update: {
      displayName,
      avatarUrl,
      currentStreak,
      longestStreak,
      lastActiveDate: now,
      xp: { increment: xpEarned },
    },
  });

  return currentStreak;
}

/** Question ids the user should review: previously wrong OR due for repetition. */
export async function getReviewQuestionIds(courseCode: string): Promise<number[]> {
  const { userId } = await auth();
  if (!userId) return [];

  try {
    const rows = await prisma.questionStat.findMany({
      where: {
        userId,
        courseCode,
        OR: [{ lastCorrect: false }, { dueAt: { lte: new Date() } }],
      },
      select: { questionId: true },
      orderBy: { dueAt: "asc" },
      take: 200,
    });
    return rows.map((r) => r.questionId);
  } catch (error) {
    console.error("[getReviewQuestionIds] failed:", error);
    return [];
  }
}

export interface CourseStat {
  courseCode: string;
  attempts: number;
  avgScore: number;
  totalAnswered: number;
  totalCorrect: number;
  accuracy: number;
}

export interface RecentAttempt {
  courseCode: string;
  mode: string;
  score: number;
  correct: number;
  total: number;
  createdAt: string;
}

export interface QuizStatsDTO {
  totalAttempts: number;
  totalAnswered: number;
  totalCorrect: number;
  accuracy: number;
  xp: number;
  currentStreak: number;
  longestStreak: number;
  perCourse: CourseStat[];
  recent: RecentAttempt[];
}

const EMPTY_STATS: QuizStatsDTO = {
  totalAttempts: 0,
  totalAnswered: 0,
  totalCorrect: 0,
  accuracy: 0,
  xp: 0,
  currentStreak: 0,
  longestStreak: 0,
  perCourse: [],
  recent: [],
};

/** Aggregate quiz stats for the signed-in user (for the stats dashboard). */
export async function getQuizStats(): Promise<QuizStatsDTO> {
  const { userId } = await auth();
  if (!userId) return EMPTY_STATS;

  try {
    const [grouped, stats, recent] = await Promise.all([
      prisma.quizAttempt.groupBy({
        by: ["courseCode"],
        where: { userId },
        _count: { _all: true },
        _sum: { total: true, correct: true },
        _avg: { score: true },
      }),
      prisma.userStats.findUnique({ where: { userId } }),
      prisma.quizAttempt.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    const perCourse: CourseStat[] = grouped.map((g) => {
      const totalAnswered = g._sum.total ?? 0;
      const totalCorrect = g._sum.correct ?? 0;
      return {
        courseCode: g.courseCode,
        attempts: g._count._all,
        avgScore: Math.round(g._avg.score ?? 0),
        totalAnswered,
        totalCorrect,
        accuracy: totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0,
      };
    });

    const totalAnswered = perCourse.reduce((s, c) => s + c.totalAnswered, 0);
    const totalCorrect = perCourse.reduce((s, c) => s + c.totalCorrect, 0);

    return {
      totalAttempts: perCourse.reduce((s, c) => s + c.attempts, 0),
      totalAnswered,
      totalCorrect,
      accuracy: totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0,
      xp: stats?.xp ?? 0,
      currentStreak: stats?.currentStreak ?? 0,
      longestStreak: stats?.longestStreak ?? 0,
      perCourse,
      recent: recent.map((r) => ({
        courseCode: r.courseCode,
        mode: r.mode,
        score: r.score,
        correct: r.correct,
        total: r.total,
        createdAt: r.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("[getQuizStats] failed:", error);
    return EMPTY_STATS;
  }
}

export interface LeaderRow {
  rank: number;
  displayName: string;
  avatarUrl: string | null;
  xp: number;
  longestStreak: number;
  isMe: boolean;
}

/** Top users by XP, for the leaderboard page. */
export async function getLeaderboard(limit = 20): Promise<LeaderRow[]> {
  const { userId } = await auth();

  try {
    const rows = await prisma.userStats.findMany({
      orderBy: { xp: "desc" },
      take: Math.max(1, Math.min(limit, 100)),
    });
    return rows.map((r, i) => ({
      rank: i + 1,
      displayName: r.displayName ?? "Ẩn danh",
      avatarUrl: r.avatarUrl ?? null,
      xp: r.xp,
      longestStreak: r.longestStreak,
      isMe: r.userId === userId,
    }));
  } catch (error) {
    console.error("[getLeaderboard] failed:", error);
    return [];
  }
}
