import { chipLabel, type ReplyCounts } from "../domain/replyChip.ts";
import { BOARD_LANE_ID } from "./EventBoard.tsx";

export function EventsOnBoard({ counts }: { counts: ReplyCounts }) {
  const focusBoard = () => document.getElementById(BOARD_LANE_ID)?.focus();
  return (
    <button type="button" className="board-chip" onClick={focusBoard}>
      {chipLabel(counts)}
    </button>
  );
}
