import { type Board, boardSummary, changeOf, type EventCard, PROVENANCE_LABEL } from "../domain/board.ts";
import type { RestoreNames } from "./ReplyView.tsx";

export const BOARD_LANE_ID = "event-board-lane";

type EventBoardProps = { board: Board; thinking: boolean; restoreNames: RestoreNames };

export function EventBoard({ board, thinking, restoreNames }: EventBoardProps) {
  const empty = board.cards.length === 0 && !thinking;
  return (
    <section className="event-board" aria-label="Event board">
      {empty ? (
        <p className="board-empty">Events from your paste land here, left to right, in order.</p>
      ) : (
        <>
          <p className="board-header">
            <span className="board-label">Timeline · Events</span> <span>{boardSummary(board)}</span>
          </p>
          <Lane board={board} thinking={thinking} restoreNames={restoreNames} />
        </>
      )}
    </section>
  );
}

const GHOST_SLOTS = [1, 2, 3];

function Lane({ board, thinking, restoreNames }: EventBoardProps) {
  return (
    <ol id={BOARD_LANE_ID} className="board-lane" aria-label="Events on the board" tabIndex={0}>
      {board.cards.map((card) => (
        <Card key={card.id} card={card} board={board} title={restoreNames(card.text).text} />
      ))}
      {thinking && GHOST_SLOTS.map((slot) => <li key={`ghost-${slot}`} className="board-ghost" aria-hidden="true" />)}
    </ol>
  );
}

const CHANGE_TAG = { added: "JUST ADDED", updated: "UPDATED" } as const;

function Card({ card, board, title }: { card: EventCard; board: Board; title: string }) {
  const change = changeOf(board, card);
  return (
    <li data-card-id={card.id} data-source={card.provenance} data-change={change ?? undefined}>
      <button type="button" className="card">
        <span className="card-kind">EVENT</span>
        <span className="card-source">{PROVENANCE_LABEL[card.provenance]}</span>
        <span className="card-title">{title}</span>
        {change && <span className="card-tag">{CHANGE_TAG[change]}</span>}
      </button>
    </li>
  );
}
