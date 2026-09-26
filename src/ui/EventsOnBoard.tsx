import { BOARD_LANE_ID } from "./EventBoard.tsx";

export function EventsOnBoard({ events, added }: { events: number; added: number }) {
  const focusBoard = () => document.getElementById(BOARD_LANE_ID)?.focus();
  const already = Math.max(events - added, 0);
  return (
    <button type="button" className="board-chip" onClick={focusBoard}>
      ← {added} new on the board{already > 0 && ` · ${already} already there`}
    </button>
  );
}
