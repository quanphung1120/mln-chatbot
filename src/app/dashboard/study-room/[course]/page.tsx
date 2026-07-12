import { notFound } from "next/navigation";
import { StudyRoomGame } from "@/features/study-room/components/study-room-game";
import { getRoomState, getUnlockedItems } from "@/features/study-room/actions";
import { getTheme, hasRoom } from "@/features/study-room/themes";

interface PageProps {
  params: Promise<{ course: string }>;
}

export default async function CourseRoomPage({ params }: PageProps) {
  const { course } = await params;
  const courseCode = course.toUpperCase();

  if (!hasRoom(courseCode)) {
    notFound();
  }

  const [initialState, unlocked] = await Promise.all([
    getRoomState(courseCode),
    getUnlockedItems(),
  ]);

  return (
    <div className="flex-1 min-h-0">
      <StudyRoomGame
        courseCode={courseCode}
        initialState={initialState}
        theme={getTheme(courseCode)}
        unlocked={unlocked}
      />
    </div>
  );
}
