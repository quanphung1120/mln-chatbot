import Link from "next/link";
import { BarChart3, BookOpen, Trophy } from "lucide-react";
import { COURSES } from "@/lib/courses";
import { getBank } from "@/features/quiz/data";

export const metadata = {
  title: "Ôn tập & Thi thử",
};

export default function QuizHomePage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-4xl p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Ôn tập & Thi thử</h1>
            <p className="text-sm text-muted-foreground">
              Chọn môn để luyện tập, thi thử có hẹn giờ, hoặc ôn lại câu sai.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/dashboard/quiz/stats"
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              <BarChart3 className="size-4" /> Thống kê
            </Link>
            <Link
              href="/dashboard/leaderboard"
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              <Trophy className="size-4" /> Xếp hạng
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {COURSES.map((course) => {
            const count = getBank(course.code).length;
            const ready = count > 0;
            const inner = (
              <div
                className={`flex h-full flex-col rounded-xl border p-5 transition-colors ${
                  ready ? "bg-card hover:border-primary hover:bg-accent" : "bg-muted/40"
                }`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <BookOpen className="size-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {course.short} · {course.code}
                    </p>
                    <p className="text-base font-semibold text-foreground">{course.title}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{course.blurb}</p>
                <p className="mt-3 text-sm font-medium">
                  {ready ? (
                    <span className="text-primary">{count} câu hỏi →</span>
                  ) : (
                    <span className="text-muted-foreground">Sắp có câu hỏi</span>
                  )}
                </p>
              </div>
            );

            return ready ? (
              <Link key={course.code} href={`/dashboard/quiz/${course.code}`}>
                {inner}
              </Link>
            ) : (
              <div key={course.code} className="cursor-not-allowed opacity-60">
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
