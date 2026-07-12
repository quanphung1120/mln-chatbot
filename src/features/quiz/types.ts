// Shared types for the quiz feature (used by all course banks + the runner).

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  /** index (0-based) of the correct option inside `options`. */
  answer: number;
  explain?: string;
  /** optional chapter / topic label, for filtering by chương later. */
  chapter?: string;
}

export type QuizMode = "practice" | "exam" | "review";
