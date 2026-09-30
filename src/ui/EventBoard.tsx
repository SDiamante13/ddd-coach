import { type Board, boardSummary, type Link } from "../domain/board.ts";
import "../styles/board.css";
import type { EntityId } from "../domain/entityId.ts";
import { BoardFlow } from "./BoardFlow.tsx";
import type { RestoreNames } from "./ReplyView.tsx";

export { BOARD_LANE_ID } from "./BoardFlow.tsx";

export type BoardView = {
  board: Board;
  selected: EntityId | null;
  toggle: (id: EntityId) => void;
  correct: (id: EntityId, text: string) => void;
  connect: (from: EntityId, to: EntityId) => void;
  justDrawn: Link | null;
  undo: () => void;
  undoable: EntityId | null;
  highlightedLine: string | null;
};
type EventBoardProps = { view: BoardView; thinking: boolean; restoreNames: RestoreNames };

export function EventBoard({ view, thinking, restoreNames }: EventBoardProps) {
  const empty = view.board.cards.length === 0 && !thinking;
  return (
    <section className="event-board" aria-label="Event board">
      {empty ? (
        <p className="board-empty">Events from your paste land here, left to right, in order.</p>
      ) : (
        <>
          <p className="board-header">
            <span className="board-label">Timeline · Events</span> <span>{boardSummary(view.board)}</span>
          </p>
          <BoardFlow view={view} thinking={thinking} restoreNames={restoreNames} />
        </>
      )}
    </section>
  );
}
