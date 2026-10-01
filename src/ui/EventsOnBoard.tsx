import { chipLabel, type ReplyCounts } from "../domain/replyChip.ts";
import { BOARD_LANE_ID } from "./EventBoard.tsx";

export function EventsOnBoard({ counts, revealOffScreen }: { counts: ReplyCounts; revealOffScreen?: (() => void) | undefined }) {
  const focusBoard = () => document.getElementById(BOARD_LANE_ID)?.focus();
  return (
    <button type="button" className="board-chip" onClick={revealOffScreen ?? focusBoard}>
      {chipLabel(counts, revealOffScreen !== undefined)}
    </button>
  );
}
