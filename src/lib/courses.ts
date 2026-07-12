// ---------------------------------------------------------------------------
// Single source of truth for the Marxist-Leninist courses this portal covers.
// Used by the quiz feature, the study-room HUD, the landing page and metadata
// so a course code / title is never hardcoded in more than one place.
// ---------------------------------------------------------------------------

export interface Course {
  /** Official FPT course code, also used as the quiz-bank key. */
  code: string;
  /** Full Vietnamese title. */
  title: string;
  /** English title, for the bilingual UI. */
  titleEn: string;
  /** Friendly short label students use ("MLN1", "MLN2"...). */
  short: string;
  /** One-line description for cards / tooltips. */
  blurb: string;
}

export const COURSES: Course[] = [
  {
    code: "MLN111",
    title: "Triết học Mác – Lênin",
    titleEn: "Marxist-Leninist Philosophy",
    short: "MLN1",
    blurb: "Thế giới quan và phương pháp luận triết học Mác – Lênin.",
  },
  {
    code: "MLN122",
    title: "Kinh tế chính trị Mác – Lênin",
    titleEn: "Marxist-Leninist Political Economy",
    short: "MLN2",
    blurb: "Học thuyết giá trị, giá trị thặng dư và kinh tế thị trường.",
  },
  {
    code: "MLN131",
    title: "Chủ nghĩa xã hội khoa học",
    titleEn: "Scientific Socialism",
    short: "MLN3",
    blurb: "Sứ mệnh lịch sử của giai cấp công nhân và con đường lên CNXH.",
  },
];

export const COURSE_BY_CODE: Record<string, Course> = Object.fromEntries(
  COURSES.map((c) => [c.code, c]),
);

export function getCourse(code: string): Course | undefined {
  return COURSE_BY_CODE[code];
}

/** Course codes joined for prose, e.g. "MLN111, MLN122 and MLN131". */
export const COURSE_CODES = COURSES.map((c) => c.code);
