// Registry mapping course code -> its question bank. Add a new course by
// importing its array and adding one entry here (plus a Course in lib/courses).

import type { QuizQuestion } from "../types";
import { MLN111_QUESTIONS } from "./mln111";
import { MLN122_QUESTIONS } from "./mln122";

export const QUIZ_BANKS: Record<string, QuizQuestion[]> = {
  MLN111: MLN111_QUESTIONS,
  MLN122: MLN122_QUESTIONS,
  // MLN131 chưa có ngân hàng câu hỏi — thêm bank + entry ở đây khi có.
  MLN131: [],
};

/** Questions for a course code, or an empty array if none are loaded yet. */
export function getBank(courseCode: string): QuizQuestion[] {
  return QUIZ_BANKS[courseCode] ?? [];
}

/** Course codes that currently have at least one question loaded. */
export function coursesWithQuestions(): string[] {
  return Object.keys(QUIZ_BANKS).filter((code) => QUIZ_BANKS[code].length > 0);
}
