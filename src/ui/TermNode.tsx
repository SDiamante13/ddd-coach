import { Handle, type Node, type NodeProps, Position as Side } from "@xyflow/react";
import type { KeyboardEvent } from "react";
import type { Position } from "../domain/cardMoves.ts";
import { nudgeOf } from "./cardKeys.ts";
import { RowStatus } from "./RowStatus.tsx";
import type { RowCheck } from "../domain/rowChecks.ts";
import type { Verdict } from "../domain/boardFromReplies.ts";
import { type Roving, rovingOf } from "./QuestionNode.tsx";
import type { TermCard, TermRow, WordsLane } from "../domain/words.ts";
import type { BoardView } from "./EventBoard.tsx";
import type { RestoreNames } from "./ReplyView.tsx";

const TERM_WIDTH = 240;
const TERM_STEP = 264;
const WORDS_Y = 420;
const HEADER_HEIGHT = 56;
const ROW_BASE = 104;
const LINE_HEIGHT = 17;
const CHARS_PER_LINE = 30;
const TAG = { thread: "FROM THREAD", guess: "GUESS" } as const;
const NO_LINE = { thread: "No line in your paste matches closely.", guess: "The coach's guess: no line in your paste says this." } as const;
const CHANGE_TAG = { added: "JUST ADDED", updated: "UPDATED" } as const;

type TermChange = keyof typeof CHANGE_TAG | null;
type RowChecks = { checks: ReadonlyMap<string, RowCheck>; onCheck: (row: TermRow["id"], verdict: Verdict, where: string) => void };
type TermData = { term: TermCard; change: TermChange; restoreNames: RestoreNames; nudge: (by: Position) => void; roving: Roving; rowChecks: RowChecks };
export type TermNodeType = Node<TermData, "term">;

export function TermNode({ data: { term, change, restoreNames, nudge, roving, rowChecks } }: NodeProps<TermNodeType>) {
  const shown = (text: string) => restoreNames(text).text;
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const by = nudgeOf(event);
    if (by === undefined) return;
    event.preventDefault();
    nudge(by);
  };
  return (
    <div className="term-card" role="group" aria-label={`Term “${shown(term.word)}”`} tabIndex={roving.tabIndex} onFocus={roving.onFocus} onKeyDown={onKeyDown} data-board-item data-lane="words">
      <span className="term-word">{`“${shown(term.word)}”`}</span>
      <ul className="term-rows" aria-label="Meanings">
        {term.rows.map((row) => (
          <TermRowItem key={row.id} row={row} shown={shown} rowChecks={rowChecks} />
        ))}
      </ul>
      {change && (
        <>
          <span className="card-ring" aria-hidden="true" />
          <span className="card-tag">{CHANGE_TAG[change]}</span>
        </>
      )}
    </div>
  );
}

function TermRowItem({ row, shown, rowChecks }: { row: TermRow; shown: (text: string) => string; rowChecks: RowChecks }) {
  return (
    <li className="term-row" data-source={row.provenance}>
      <Handle id={`${row.id}|left`} type="source" position={Side.Left} isConnectable={false} className="row-handle" />
      <Handle id={`${row.id}|right`} type="source" position={Side.Right} isConnectable={false} className="row-handle right" />
      <span className="term-holder">{shown(row.holder)}</span>
      <span className="term-source">{TAG[row.provenance]}</span>
      <p className="term-meaning">{shown(row.meaning)}</p>
      <p className="term-line">{row.line === null ? NO_LINE[row.provenance] : shown(row.line)}</p>
      <RowStatus check={rowChecks.checks.get(row.id)} shown={shown} onCheck={(verdict, where) => rowChecks.onCheck(row.id, verdict, where)} />
    </li>
  );
}

export function termNodesOf(view: BoardView, restoreNames: RestoreNames): TermNodeType[] {
  const { words } = view;
  return words.terms.map((term, index) => {
    const position = view.positions.get(term.id) ?? { x: index * TERM_STEP, y: view.board.cards.length === 0 ? 0 : WORDS_Y };
    const nudge = (by: Position) => view.move(term.id, { x: position.x + by.x, y: position.y + by.y });
    return termNodeOf(term, position, view, restoreNames, nudge);
  });
}

function termNodeOf(term: TermCard, position: Position, view: BoardView, restoreNames: RestoreNames, nudge: (by: Position) => void): TermNodeType {
  return {
    id: term.id,
    type: "term",
    position,
    width: TERM_WIDTH,
    height: HEADER_HEIGHT + term.rows.reduce((sum, row) => sum + rowHeightOf(row), 0),
    ariaRole: "listitem",
    ariaLabel: termNameOf(term, restoreNames),
    data: { term, change: view.atRest || view.quietRings ? null : changeOf(term, view.words), restoreNames, nudge, roving: rovingOf(view, term.id), rowChecks: { checks: view.checks, onCheck: view.check } },
  };
}

const rowHeightOf = ({ meaning }: TermRow): number => ROW_BASE + Math.ceil(meaning.length / CHARS_PER_LINE) * LINE_HEIGHT;

const termNameOf = ({ word, rows }: TermCard, restoreNames: RestoreNames): string =>
  `Term “${restoreNames(word).text}”, ${rows.length} ${rows.length === 1 ? "meaning" : "meanings"}: ${rows.map(({ holder }) => restoreNames(holder).text).join(", ")}`;

function changeOf(term: TermCard, { latest }: WordsLane): TermChange {
  if (term.placedBy === latest) return "added";
  return term.rows.some((row) => row.changedBy === latest) ? "updated" : null;
}

export function wordsSummaryOf({ terms }: WordsLane): string | null {
  if (terms.length === 0) return null;
  const rows = terms.reduce((sum, term) => sum + term.rows.length, 0);
  return `Words · ${terms.length} ${terms.length === 1 ? "term" : "terms"} · ${rows} ${rows === 1 ? "row" : "rows"}`;
}
