import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getCourse } from "@/lib/courses";
import { getBank } from "@/features/quiz/data";
import { getReviewQuestionIds } from "@/features/quiz/actions";
import { QuizPageClient } from "@/features/quiz/components/quiz-page-client";

interface PageProps {
  params: Promise<{ course: string }>;
}

export default async function CourseQuizPage({ params }: PageProps) {
  const { course } = await params;
  const courseCode = course.toUpperCase();
  const courseMeta = getCourse(courseCode);
  const bankSize = getBank(courseCode).length;

  if (!courseMeta || bankSize === 0) {
    notFound();
  }

  const reviewIds = await getReviewQuestionIds(courseCode);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-2xl p-6">
        <Link
          href="/dashboard/quiz"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" /> Tất cả môn
        </Link>
        <QuizPageClient
          courseCode={courseCode}
          bankSize={bankSize}
          reviewIds={reviewIds}
        />
      </div>
    </div>
  );
}
