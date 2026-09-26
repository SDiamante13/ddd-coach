import { type Board, boardSummary, changeOf, type EventCard, PROVENANCE_LABEL } from "../domain/board.ts";
import "../styles/board.css";
import type { EntityId } from "../domain/entityId.ts";
import { useEffect, useRef } from "react";
import { CardNote } from "./CardNote.tsx";
import { prefersReducedMotion } from "./motion.ts";
import type { RestoreNames } from "./ReplyView.tsx";

export const BOARD_LANE_ID = "event-board-lane";

export type BoardView = { board: Board; selected: EntityId | null; toggle: (id: EntityId) => void; highlightedLine: string | null };
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
          <Lane view={view} thinking={thinking} restoreNames={restoreNames} />
        </>
      )}
    </section>
  );
}

const GHOST_SLOTS = [1, 2, 3];

function Lane({ view, thinking, restoreNames }: EventBoardProps) {
  const lane = useRef<HTMLOListElement>(null);
  useEffect(() => panToChanges(lane.current), [view.board.latest]);
  return (
    <ol ref={lane} id={BOARD_LANE_ID} className="board-lane" aria-label="Events on the board" tabIndex={0}>
      {view.board.cards.map((card) => (
        <Card key={card.id} card={card} view={view} title={restoreNames(card.text).text} />
      ))}
      {thinking && GHOST_SLOTS.map((slot) => <li key={`ghost-${slot}`} className="board-ghost" aria-hidden="true" />)}
    </ol>
  );
}

function panToChanges(lane: HTMLOListElement | null): void {
  const marked = lane?.querySelector<HTMLElement>("[data-change]");
  if (!lane || !marked) return;
  lane.scrollTo?.({ left: marked.offsetLeft - lane.offsetLeft, behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

const CHANGE_TAG = { added: "JUST ADDED", updated: "UPDATED" } as const;

function ChangeMark({ change }: { change: keyof typeof CHANGE_TAG }) {
  return (
    <>
      <span className="card-ring" aria-hidden="true" />
      <span className="card-tag">{CHANGE_TAG[change]}</span>
    </>
  );
}

function Card({ card, view, title }: { card: EventCard; view: BoardView; title: string }) {
  const change = changeOf(view.board, card);
  const pressed = view.selected === card.id;
  const noteId = `note-${card.id}`;
  return (
    <li data-card-id={card.id} data-source={card.provenance} data-change={change ?? undefined}>
      <button type="button" className="card" aria-pressed={pressed} aria-describedby={pressed ? noteId : undefined} onClick={() => view.toggle(card.id)}>
        <span className="card-kind">EVENT</span>
        <span className="card-source">{PROVENANCE_LABEL[card.provenance]}</span>
        <span className="card-title">{title}</span>
        {change && <ChangeMark key={`${change}-${view.board.latest}`} change={change} />}
      </button>
      {pressed && <CardNote id={noteId} provenance={card.provenance} line={view.highlightedLine} />}
    </li>
  );
}
