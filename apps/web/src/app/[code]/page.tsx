import { use } from "react";
import MeetsClientPage from "../clients/meets-client-page";

type MeetRoomPageProps = {
  params: Promise<{ code: string }>;
};

export default function MeetRoomPage({ params }: MeetRoomPageProps) {
  const { code } = use(params);
  const rawCode = typeof code === "string" ? code : "";
  const roomCode = decodeURIComponent(rawCode);
  const resolvedRoomCode =
    roomCode === "undefined" || roomCode === "null" ? "" : roomCode;
  const sanitizedRoomCode = resolvedRoomCode
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 4);
  return (
    <MeetsClientPage
      initialRoomId={sanitizedRoomCode}
      forceJoinOnly={true}
    />
  );
}
