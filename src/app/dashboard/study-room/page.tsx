import Link from "next/link";
import { DoorOpen, Gamepad2 } from "lucide-react";
import { getCourse } from "@/lib/courses";
import { ROOM_THEMES } from "@/features/study-room/themes";

export const metadata = {
  title: "Phòng học",
};

export default function StudyRoomPickerPage() {
  const rooms = Object.values(ROOM_THEMES);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-4xl p-6">
        <div className="mb-6 flex items-center gap-2">
          <Gamepad2 className="size-6 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Phòng học 3D</h1>
            <p className="text-sm text-muted-foreground">
              Mỗi môn một phòng riêng — học kiếm xu và trang trí. Xu dùng chung mọi phòng.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {rooms.map((theme) => {
            const course = getCourse(theme.courseCode);
            return (
              <Link
                key={theme.courseCode}
                href={`/dashboard/study-room/${theme.courseCode}`}
                className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-colors hover:border-primary"
              >
                {/* theme preview strip */}
                <div
                  className="flex h-24 items-end p-3"
                  style={{
                    background: `linear-gradient(135deg, ${theme.bg} 0%, ${theme.wallBack} 100%)`,
                  }}
                >
                  <div className="flex gap-1.5">
                    {[theme.floorLight, theme.floorDark, theme.accent, theme.poster].map((c, i) => (
                      <span
                        key={i}
                        className="size-5 rounded-full border border-black/10"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {course?.short ?? theme.courseCode}
                    </p>
                    <p className="text-base font-semibold text-foreground">{theme.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {course?.title ?? theme.courseCode}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    <DoorOpen className="size-4" /> Vào phòng
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
