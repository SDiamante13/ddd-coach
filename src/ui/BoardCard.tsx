import { Handle, Position } from "@xyflow/react";
import { type KeyboardEvent, type RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import { changeOf, type EventCard, labelOf, struckWordsOf } from "../domain/board.ts";
import { CardNote } from "./CardNote.tsx";
import { onCardKey } from "./cardKeys.ts";
import { BOARD_KEYS_ID } from "./BoardHint.tsx";
import { lanePosition } from "./boardLayout.ts";
import type { Position as Place } from "../domain/cardMoves.ts";
import type { BoardView } from "./EventBoard.tsx";
import type { RestoreNames } from "./ReplyView.tsx";

const CHANGE_TAG = { added: "JUST ADDED", updated: "UPDATED" } as const;

type BoardCardProps = { card: EventCard; view: BoardView; restoreNames: RestoreNames };
export type CardPlace = { index: number; total: number };

export function BoardCard({ card, view, restoreNames, place }: BoardCardProps & { place: CardPlace }) {
  const { button, editing, open, close } = useCardEditing();
  const change = view.atRest ? null : changeOf(view.board, card);
  const pressed = view.selected === card.id;
  const at = view.positions.get(card.id) ?? lanePosition(place.index - 1);
  const nudge = (by: Place) => view.move(card.id, { x: at.x + by.x, y: at.y + by.y });
  const noteId = `note-${card.id}`;
  const title = restoreNames(card.text).text;
  const keep = (text: string) => {
    view.correct(card.id, text);
    close(true);
  };
  return (
    <div className="board-card nopan" data-card-id={card.id} data-source={card.correctedFrom === undefined ? card.provenance : "you"} data-change={change ?? undefined}>
      {editing && <CardEditor initial={title} onKeep={keep} onCancel={close} />}
      <button ref={button} type="button" className="card" aria-label={`Event ${place.index} of ${place.total}, ${labelOf(card)}: ${title}`} aria-hidden={editing || undefined} tabIndex={editing ? -1 : undefined} aria-pressed={pressed} aria-describedby={pressed ? `${noteId} ${BOARD_KEYS_ID}` : BOARD_KEYS_ID} onClick={() => view.toggle(card.id)} onDoubleClick={open} onKeyDown={(event) => onCardKey(event, { nudge, edit: open })}>
        <CardFace card={card} view={view} title={title} restoreNames={restoreNames} />
        {change && <ChangeMark key={`${change}-${view.board.latest}`} change={change} />}
      </button>
      <Handle id="link-out" type="source" position={Position.Bottom} className="link-handle" aria-label="Drag to link this card" />
      <Handle id="link-in" type="target" position={Position.Bottom} className="link-handle link-in" />
      {view.undoable === card.id && <UndoPill onUndo={view.undo} />}
      {pressed && !editing && (
        <CardNote
          id={noteId}
          provenance={card.provenance}
          line={view.highlightedLine}
          onCorrect={open}
          others={view.board.cards.filter(({ id }) => id !== card.id).map(({ id, text }) => ({ id, title: restoreNames(text).text }))}
          onLink={(to) => view.connect(card.id, to)}
        />
      )}
    </div>
  );
}

function CardFace({ card, view, title, restoreNames }: BoardCardProps & { title: string }) {
  const struck = struckWordsOf(view.board, card);
  const titleRef = useRef<HTMLSpanElement>(null);
  const overflowing = useOverflow(titleRef, title, view.selected === card.id);
  return (
    <>
      <span className="card-kind">EVENT</span>
      <span className="card-source">{labelOf(card)}</span>
      <span ref={titleRef} className="card-title">
        {title}
      </span>
      {struck && <WasLine words={restoreNames(struck).text} collapsed={overflowing} />}
    </>
  );
}

function WasLine({ words, collapsed }: { words: string; collapsed: boolean }) {
  return (
    <span className="card-was">
      was:{" "}
      {collapsed ? (
        <>
          <span aria-hidden="true">…</span>
          <s className="visually-hidden">{words}</s>
        </>
      ) : (
        <s>{words}</s>
      )}
    </span>
  );
}

function useOverflow(ref: RefObject<HTMLElement | null>, text: string, unclamped: boolean): boolean {
  const [overflowing, setOverflowing] = useState(false);
  useLayoutEffect(() => {
    const element = ref.current;
    setOverflowing(element !== null && element.scrollHeight > element.clientHeight + 1);
  }, [ref, text, unclamped]);
  return overflowing;
}

function UndoPill({ onUndo }: { onUndo: () => void }) {
  return (
    <p className="card-undo nodrag">
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

type CardEditorProps = { initial: string; onKeep: (text: string) => void; onCancel: (byKey: boolean) => void };

function CardEditor({ initial, onKeep, onCancel }: CardEditorProps) {
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const text = event.currentTarget.value.trim();
    if (event.key === "Escape") onCancel(true);
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (text === "" || text === initial) onCancel(true);
    else onKeep(text);
  };
  return (
    <div className="card card-editing nodrag">
      <input className="card-input" aria-label="Correct this event" defaultValue={initial} autoFocus onKeyDown={onKeyDown} onBlur={() => onCancel(false)} />
      <span className="card-hint">Enter keeps · Esc cancels</span>
    </div>
  );
}

function useCardEditing() {
  const button = useRef<HTMLButtonElement>(null);
  const [editing, setEditing] = useState(false);
  const refocus = useRef(false);
  useEffect(() => {
    if (editing || !refocus.current) return;
    refocus.current = false;
    button.current?.focus();
  }, [editing]);
  const close = (byKey: boolean) => {
    refocus.current ||= byKey;
    setEditing(false);
  };
  return { button, editing, open: () => setEditing(true), close };
}
