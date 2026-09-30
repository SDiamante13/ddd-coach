import { useState, type KeyboardEvent } from "react";
import { changeOf, type EventCard, labelOf, struckWordsOf } from "../domain/board.ts";
import { CardNote } from "./CardNote.tsx";
import type { BoardView } from "./EventBoard.tsx";
import type { RestoreNames } from "./ReplyView.tsx";

const CHANGE_TAG = { added: "JUST ADDED", updated: "UPDATED" } as const;

type BoardCardProps = { card: EventCard; view: BoardView; restoreNames: RestoreNames };
export type CardPlace = { index: number; total: number };

export function BoardCard({ card, view, restoreNames, place }: BoardCardProps & { place: CardPlace }) {
  const [editing, setEditing] = useState(false);
  const change = changeOf(view.board, card);
  const pressed = view.selected === card.id;
  const noteId = `note-${card.id}`;
  const title = restoreNames(card.text).text;
  const keep = (text: string) => {
    view.correct(card.id, text);
    setEditing(false);
  };
  return (
    <div className="board-card nopan nodrag" data-card-id={card.id} data-source={card.correctedFrom === undefined ? card.provenance : "you"} data-change={change ?? undefined}>
      {editing && <CardEditor initial={title} onKeep={keep} onCancel={() => setEditing(false)} />}
      <button type="button" className="card" aria-label={`Event ${place.index} of ${place.total}, ${labelOf(card)}: ${title}`} aria-hidden={editing || undefined} tabIndex={editing ? -1 : undefined} aria-pressed={pressed} aria-describedby={pressed ? noteId : undefined} onClick={() => view.toggle(card.id)} onDoubleClick={() => setEditing(true)}>
        <CardFace card={card} view={view} title={title} restoreNames={restoreNames} />
        {change && <ChangeMark key={`${change}-${view.board.latest}`} change={change} />}
      </button>
      {view.undoable === card.id && <UndoPill onUndo={view.undo} />}
      {pressed && !editing && <CardNote id={noteId} provenance={card.provenance} line={view.highlightedLine} onCorrect={() => setEditing(true)} />}
    </div>
  );
}

function CardFace({ card, view, title, restoreNames }: BoardCardProps & { title: string }) {
  const struck = struckWordsOf(view.board, card);
  return (
    <>
      <span className="card-kind">EVENT</span>
      <span className="card-source">{labelOf(card)}</span>
      <span className="card-title">{title}</span>
      {struck && <s className="card-was">{restoreNames(struck).text}</s>}
    </>
  );
}

function UndoPill({ onUndo }: { onUndo: () => void }) {
  return (
    <p className="card-undo">
      Corrected your sticky{" "}
      <button type="button" onClick={onUndo}>
        Undo
      </button>
    </p>
  );
}

function ChangeMark({ change }: { change: keyof typeof CHANGE_TAG }) {
  return (
    <>
      <span className="card-ring" aria-hidden="true" />
      <span className="card-tag">{CHANGE_TAG[change]}</span>
    </>
  );
}

type CardEditorProps = { initial: string; onKeep: (text: string) => void; onCancel: () => void };

function CardEditor({ initial, onKeep, onCancel }: CardEditorProps) {
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const text = event.currentTarget.value.trim();
    if (event.key === "Escape") onCancel();
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (text === "" || text === initial) onCancel();
    else onKeep(text);
  };
  return (
    <div className="card card-editing">
      <input className="card-input" aria-label="Correct this event" defaultValue={initial} autoFocus onKeyDown={onKeyDown} onBlur={onCancel} />
      <span className="card-hint">Enter keeps · Esc cancels</span>
    </div>
  );
}
