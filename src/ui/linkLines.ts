import type { Board, Link } from "../domain/board.ts";
import type { Connection, VisitorAction } from "../domain/boardFromReplies.ts";
import type { EntityId } from "../domain/entityId.ts";
import type { ExchangeId } from "../domain/exchange.ts";
import type { RestoreNames } from "./ReplyView.tsx";
import { lastEdit } from "../domain/cardMoves.ts";

export type LinkLine = { from: string; to: string; undoable: boolean; settled: boolean };

export const linkLineText = ({ from, to }: { from: string; to: string }): string => `You connected “${from}” → “${to}”`;

const LOGGED_TITLE_WORDS = 6;

export function clampWords(text: string, max = LOGGED_TITLE_WORDS): string {
  const words = text.split(/\s+/).filter(Boolean);
  return words.length <= max ? text : `${words.slice(0, max).join(" ")}…`;
}

export const titleOf = (board: Board, id: EntityId, restoreNames: RestoreNames): string =>
  restoreNames(board.cards.find((card) => card.id === id)?.text ?? "").text;

const onBoard = (board: Board, { from, to }: Connection | Link): boolean => board.links.some((link) => link.from === from && link.to === to);

export function justDrawnOf(board: Board, actions: readonly VisitorAction[]): Link | null {
  const last = lastEdit(actions);
  return last?.kind === "connect" && last.after === board.latest && onBoard(board, last) ? { from: last.from, to: last.to } : null;
}

export function linkLinesOf(board: Board, actions: readonly VisitorAction[], id: ExchangeId, restoreNames: RestoreNames, keptActions = 0): LinkLine[] {
  const last = lastEdit(actions);
  const settled = (link: Connection) => actions.indexOf(link) < keptActions;
  return actions
    .filter((action): action is Connection => action.kind === "connect" && action.after === id && onBoard(board, action))
    .map((link) => ({ from: titleOf(board, link.from, restoreNames), to: titleOf(board, link.to, restoreNames), undoable: link === last, settled: settled(link) }));
}
