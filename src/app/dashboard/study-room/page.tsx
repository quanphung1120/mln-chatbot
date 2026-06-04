import { StudyRoomGame } from "@/features/study-room/components/study-room-game";
import { getGameState } from "@/features/study-room/actions";

export const metadata = {
  title: "Study Room",
};

export default async function StudyRoomPage() {
  const initialState = await getGameState();

  return (
    <div className="flex-1 min-h-0">
      <StudyRoomGame initialState={initialState} />
    </div>
  );
}
