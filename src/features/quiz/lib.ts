// Pure, client-safe helpers shared by the study-room modal and the quiz page.

import { getBank } from "./data";
import type { QuizQuestion } from "./types";

// Fisher–Yates shuffle of the indices 0..len-1.
export function shuffledOrder(len: number): number[] {
  const order = Array.from({ length: len }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/**
 * Pick `count` random questions for a course. If `restrictIds` is given (e.g.
 * review mode), only questions whose id is in that set are eligible. `count <= 0`
 * means "all eligible questions".
 */
export function sampleQuestions(
  courseCode: string,
  count: number,
  restrictIds?: number[],
): QuizQuestion[] {
  let bank = getBank(courseCode);
  // `restrictIds` defined (even empty) means "restrict to these" — an empty
  // review set must yield 0 questions, not fall back to the whole bank.
  if (restrictIds !== undefined) {
    const set = new Set(restrictIds);
    bank = bank.filter((q) => set.has(q.id));
  }
  const order = shuffledOrder(bank.length);
  const n = count > 0 ? Math.min(count, bank.length) : bank.length;
  return order.slice(0, n).map((i) => bank[i]);
}

export function scorePercent(correct: number, total: number): number {
  return total > 0 ? Math.round((correct / total) * 100) : 0;
}
