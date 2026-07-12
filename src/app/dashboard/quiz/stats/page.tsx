import Link from "next/link";
import { Award, ChevronLeft, Flame, Target, Trophy, Zap } from "lucide-react";
import { getCourse } from "@/lib/courses";
import { getQuizStats } from "@/features/quiz/actions";
import { AccuracyByCourseChart } from "@/features/quiz/components/stats-charts";

export const metadata = {
  title: "Thống kê ôn tập",
};

const MODE_LABEL: Record<string, string> = {
  practice: "Luyện tập",
  exam: "Thi thử",
  review: "Ôn câu sai",
};

function computeBadges(stats: Awaited<ReturnType<typeof getQuizStats>>) {
  const badges: { label: string; hit: boolean }[] = [
    { label: "Bắt đầu hành trình", hit: stats.totalAttempts >= 1 },
    { label: "100 câu đúng", hit: stats.totalCorrect >= 100 },
    { label: "Chuỗi 7 ngày", hit: stats.longestStreak >= 7 },
    {
      label: "Xạ thủ (≥90%)",
      hit: stats.accuracy >= 90 && stats.totalAnswered >= 50,
    },
    { label: "Chăm chỉ (20 lượt)", hit: stats.totalAttempts >= 20 },
  ];
  return badges;
}

export default async function QuizStatsPage() {
  const stats = await getQuizStats();
  const chartData = stats.perCourse.map((c) => ({
    label: getCourse(c.courseCode)?.short ?? c.courseCode,
    accuracy: c.accuracy,
    attempts: c.attempts,
  }));
  const badges = computeBadges(stats);

  const tiles = [
    { icon: Zap, label: "XP", value: stats.xp, tone: "text-amber-500" },
    { icon: Flame, label: "Chuỗi hiện tại", value: `${stats.currentStreak} ngày`, tone: "text-orange-500" },
    { icon: Target, label: "Độ chính xác", value: `${stats.accuracy}%`, tone: "text-emerald-500" },
    { icon: Trophy, label: "Lượt làm bài", value: stats.totalAttempts, tone: "text-primary" },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-4xl p-6">
        <Link
          href="/dashboard/quiz"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" /> Ôn tập
        </Link>

        <h1 className="mb-1 text-2xl font-semibold text-foreground">Thống kê ôn tập</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Tiến bộ của bạn qua các lần luyện tập và thi thử.
        </p>

        {/* summary tiles */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tiles.map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.label} className="rounded-xl border bg-card p-4">
                <Icon className={`mb-2 size-5 ${t.tone}`} />
                <p className="text-xl font-bold text-foreground">{t.value}</p>
                <p className="text-xs text-muted-foreground">{t.label}</p>
              </div>
            );
          })}
        </div>

        {/* accuracy chart */}
        <div className="mt-6 rounded-xl border bg-card p-5">
          <p className="mb-3 text-sm font-semibold text-foreground">Độ chính xác theo môn</p>
          <AccuracyByCourseChart data={chartData} />
        </div>

        {/* badges */}
        <div className="mt-6 rounded-xl border bg-card p-5">
          <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Award className="size-4 text-primary" /> Huy hiệu
          </p>
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <span
                key={b.label}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  b.hit
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border bg-muted/40 text-muted-foreground/60"
                }`}
              >
                {b.hit ? "🏅 " : "🔒 "}
                {b.label}
              </span>
            ))}
          </div>
        </div>

        {/* recent attempts */}
        <div className="mt-6 rounded-xl border bg-card p-5">
          <p className="mb-3 text-sm font-semibold text-foreground">Lịch sử gần đây</p>
          {stats.recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có lượt làm bài nào.</p>
          ) : (
            <div className="divide-y">
              {stats.recent.map((r, i) => (
                <div key={i} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <span className="font-medium text-foreground">
                      {getCourse(r.courseCode)?.short ?? r.courseCode}
                    </span>
                    <span className="text-muted-foreground"> · {MODE_LABEL[r.mode] ?? r.mode}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">
                      {r.correct}/{r.total}
                    </span>
                    <span
                      className={`font-semibold tabular-nums ${
                        r.score >= 80 ? "text-emerald-500" : r.score >= 50 ? "text-amber-500" : "text-red-500"
                      }`}
                    >
                      {r.score}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
