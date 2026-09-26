import { BOARD_LANE_ID } from "./EventBoard.tsx";

export function EventsOnBoard({ count }: { count: number }) {
  const focusBoard = () => document.getElementById(BOARD_LANE_ID)?.focus();
  return (
    <button type="button" className="board-chip" onClick={focusBoard}>
      ← {count} {count === 1 ? "event" : "events"} on the board
    </button>
  );
}
