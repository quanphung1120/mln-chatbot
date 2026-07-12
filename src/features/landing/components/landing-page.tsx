import { BookOpenCheck, Gamepad2, Search, Trophy, type LucideIcon } from "lucide-react";
import HeaderAuth from "./header-auth";
import HeroAuth from "./hero-auth";
import CtaAuth from "./cta-auth";
import FaqSection from "./faq-section";
import { COURSES } from "@/lib/courses";

interface Feature {
  icon: LucideIcon;
  title: string;
  body: string;
  tone: string;
}

const FEATURES: Feature[] = [
  {
    icon: Search,
    title: "Tra cứu tức thì",
    body: "Tìm khái niệm, định nghĩa trong tích tắc — mỗi câu trả lời kèm trích dẫn slide đúng theo giáo trình FPT.",
    tone: "bg-foreground/5 text-foreground",
  },
  {
    icon: BookOpenCheck,
    title: "Ôn tập cùng AI",
    body: "Hàng trăm câu hỏi trắc nghiệm theo từng môn, có AI giải thích chi tiết ngay khi bạn trả lời sai.",
    tone: "bg-foreground/5 text-foreground",
  },
  {
    icon: Trophy,
    title: "Bảng xếp hạng & streak",
    body: "Tích lũy XP, giữ chuỗi ngày học liên tục và cạnh tranh vị trí trên bảng xếp hạng với bạn học cùng trường.",
    tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    icon: Gamepad2,
    title: "Phòng học 3D",
    body: "Mỗi môn một không gian học riêng — trang trí phòng bằng xu kiếm được từ luyện tập.",
    tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
];

const SYLLABUS_TOPICS: Record<string, string[]> = {
  MLN111: [
    "Khái niệm vật chất & nguồn gốc ý thức",
    "2 nguyên lý & 3 quy luật cơ bản của phép biện chứng",
    "6 cặp phạm trù cơ bản của phép biện chứng",
    "Hình thái kinh tế - xã hội & duy vật lịch sử",
  ],
  MLN122: [
    "Hàng hoá, tiền tệ & quy luật thị trường",
    "Học thuyết giá trị thặng dư (M – C – M')",
    "Tích luỹ tư bản & cạnh tranh độc quyền",
    "Kinh tế thị trường định hướng xã hội chủ nghĩa",
  ],
  MLN131: [
    "Sứ mệnh lịch sử của giai cấp công nhân",
    "Thời kỳ quá độ lên chủ nghĩa xã hội",
    "Cơ cấu xã hội - giai cấp & liên minh giai cấp",
    "Vấn đề dân tộc, tôn giáo & gia đình",
  ],
};

const SEMESTER_BY_CODE: Record<string, string> = {
  MLN111: "Học kỳ 8",
  MLN122: "Học kỳ 8",
  MLN131: "Học kỳ 9",
};

export default function LandingPage() {
  return (
    <div className="relative">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <a href="#" className="text-base font-semibold tracking-tight text-foreground">
            MLN <span className="font-normal text-muted-foreground">Portal</span>
          </a>

          <nav className="flex items-center gap-6">
            <a
              href="#features-section"
              className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
            >
              Tính năng
            </a>
            <a
              href="#syllabus-section"
              className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
            >
              Môn học
            </a>
            <a
              href="#faq-section"
              className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
            >
              Câu hỏi
            </a>
            <HeaderAuth />
          </nav>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pb-24 pt-20 sm:pb-32 sm:pt-28">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-15%] size-[560px] -translate-x-1/2 rounded-full bg-foreground/5 blur-3xl motion-safe:animate-[float-slow_18s_ease-in-out_infinite]" />
          <div className="absolute right-[-10%] top-[15%] size-[420px] rounded-full bg-amber-500/10 blur-3xl motion-safe:animate-[float-slow_22s_ease-in-out_infinite_reverse]" />
        </div>

        <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
          <span className="inline-flex items-center rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground">
            Đại học FPT · Hệ thống tra cứu &amp; ôn tập Mác – Lênin
          </span>

          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
            Tra cứu chuẩn giáo trình.
            <br />
            <span className="text-amber-600 dark:text-amber-400">Ôn tập lên hạng mỗi ngày.</span>
          </h1>

          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
            Tìm khái niệm, trích dẫn đúng slide, luyện trắc nghiệm có AI giải thích và leo bảng
            xếp hạng — tất cả trong một cổng học tập cho MLN111, MLN122 và MLN131.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <HeroAuth />
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section
        id="features-section"
        className="border-t border-border bg-muted/30 px-6 py-24 sm:py-32"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 max-w-xl">
            <span className="mb-4 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Tính năng
            </span>
            <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
              Công cụ học tập chuẩn xác
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6"
              >
                <span
                  className={`flex size-10 items-center justify-center rounded-lg ${feature.tone}`}
                >
                  <feature.icon className="size-5" />
                </span>
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Syllabus ───────────────────────────────────────── */}
      <section
        id="syllabus-section"
        className="border-t border-border bg-background px-6 py-24 sm:py-32"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <span className="mb-4 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              3 môn học
            </span>
            <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
              Phạm vi kiến thức MLN
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {COURSES.map((course) => (
              <div
                key={course.code}
                className="grid gap-6 rounded-xl border border-border bg-card p-6 sm:grid-cols-2 sm:p-8"
              >
                <div>
                  <div className="mb-3 flex items-center gap-3">
                    <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      {SEMESTER_BY_CODE[course.code]}
                    </span>
                    <span className="h-3.5 w-px bg-border" />
                    <span className="text-xs font-semibold uppercase tracking-widest text-foreground">
                      {course.code}
                    </span>
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-foreground sm:text-2xl">
                    {course.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{course.blurb}</p>
                </div>

                <div>
                  <span className="mb-4 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Nội dung trọng tâm
                  </span>
                  <ul className="flex flex-col gap-3">
                    {(SYLLABUS_TOPICS[course.code] ?? []).map((topic) => (
                      <li
                        key={topic}
                        className="flex items-start gap-2 text-sm leading-relaxed text-foreground/80"
                      >
                        <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonial ────────────────────────────────────── */}
      <section className="border-t border-border bg-muted/30 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <blockquote className="text-xl font-medium leading-relaxed text-foreground sm:text-2xl">
            &ldquo;Nhờ tính năng tra cứu bám sát slide MLN111, mình hiểu nhanh các khái niệm trừu
            tượng như vật chất, ý thức hay quy luật biện chứng. Phần ôn trắc nghiệm có AI giải
            thích cũng giúp mình nhớ bài lâu hơn hẳn.&rdquo;
          </blockquote>
          <div className="mt-6 flex flex-col items-center gap-1">
            <span className="text-sm font-semibold text-foreground">Hoàng Nam Khánh</span>
            <span className="text-xs text-muted-foreground">
              K18 Kỹ thuật phần mềm · FPT Hòa Lạc
            </span>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <FaqSection />

      {/* ── Final CTA ──────────────────────────────────────── */}
      <section className="border-t border-border bg-background px-6 py-24 sm:py-32">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 rounded-2xl border border-border bg-card px-6 py-16 text-center sm:px-16">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Tra cứu chính xác · Ôn tập hiệu quả
          </span>
          <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
            Bắt đầu hành trình chinh phục MLN
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Tra cứu, ôn tập và xếp hạng — tất cả trong một cổng học tập chuẩn giáo trình Đại học
            FPT.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <CtaAuth />
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-border bg-background px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <span className="text-xs text-muted-foreground">
            MLN FPT Study Portal © 2026 · Dành cho sinh viên Đại học FPT
          </span>
          <div className="flex gap-6">
            {["Điều khoản", "Bảo mật", "Liên hệ"].map((label) => (
              <span
                key={label}
                className="cursor-pointer text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -24px) scale(1.05); }
        }
      `}</style>
    </div>
  );
}
