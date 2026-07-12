"use client";

import { useState } from "react";
import { QuizSetup, type QuizConfig } from "./quiz-setup";
import { QuizSession, type QuizSummary } from "./quiz-session";
import { QuizResult } from "./quiz-result";

interface QuizPageClientProps {
  courseCode: string;
  bankSize: number;
  reviewIds: number[];
}

type Phase =
  | { name: "setup" }
  | { name: "running"; config: QuizConfig; runId: number }
  | { name: "done"; summary: QuizSummary };

export function QuizPageClient({ courseCode, bankSize, reviewIds }: QuizPageClientProps) {
  const [phase, setPhase] = useState<Phase>({ name: "setup" });

  if (phase.name === "running") {
    return (
      <QuizSession
        key={phase.runId}
        courseCode={courseCode}
        mode={phase.config.mode}
        count={phase.config.count}
        reviewIds={reviewIds}
        onFinish={(summary) => setPhase({ name: "done", summary })}
        onExit={() => setPhase({ name: "setup" })}
      />
    );
  }

  if (phase.name === "done") {
    return (
      <QuizResult
        summary={phase.summary}
        onRetry={() => setPhase({ name: "setup" })}
      />
    );
  }

  return (
    <QuizSetup
      courseCode={courseCode}
      bankSize={bankSize}
      reviewCount={reviewIds.length}
      onStart={(config) =>
        setPhase({ name: "running", config, runId: Date.now() })
      }
    />
  );
}
