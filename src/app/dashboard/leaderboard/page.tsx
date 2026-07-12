import Link from "next/link";
import { ChevronLeft, Flame, Medal, Zap } from "lucide-react";
import { getLeaderboard } from "@/features/quiz/actions";

export const metadata = {
  title: "Bảng xếp hạng",
};

const RANK_TONE = ["text-amber-400", "text-slate-400", "text-orange-400"];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default async function LeaderboardPage() {
  const rows = await getLeaderboard(50);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-2xl p-6">
        <Link
          href="/dashboard/quiz"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" /> Ôn tập
        </Link>

        <h1 className="mb-1 text-2xl font-semibold text-foreground">Bảng xếp hạng</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Xếp theo tổng XP tích lũy từ luyện tập và thi thử.
        </p>

        {rows.length === 0 ? (
          <p className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
            Chưa có ai trên bảng xếp hạng. Hãy là người đầu tiên!
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-card">
            {rows.map((r) => (
              <div
                key={r.rank}
                className={`flex items-center gap-3 border-b px-4 py-3 last:border-b-0 ${
                  r.isMe ? "bg-primary/5" : ""
                }`}
              >
                <span
                  className={`w-6 shrink-0 text-center text-sm font-bold tabular-nums ${
                    RANK_TONE[r.rank - 1] ?? "text-muted-foreground"
                  }`}
                >
                  {r.rank <= 3 ? <Medal className="mx-auto size-4" /> : r.rank}
                </span>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                  {initials(r.displayName)}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                  {r.displayName}
                  {r.isMe && <span className="ml-1.5 text-xs text-primary">(bạn)</span>}
                </span>
                {r.longestStreak > 0 && (
                  <span className="flex items-center gap-1 text-xs text-orange-500">
                    <Flame className="size-3.5" /> {r.longestStreak}
                  </span>
                )}
                <span className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                  <Zap className="size-3.5" /> {r.xp}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
