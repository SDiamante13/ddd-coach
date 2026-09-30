import { useMemo } from "react";
import { type Board, struckWordsOf } from "../domain/board.ts";
import { boardOf, replyCountsOf, type VisitorAction } from "../domain/boardFromReplies.ts";
import type { ReplyCounts } from "../domain/replyChip.ts";
import type { EntityId } from "../domain/entityId.ts";
import type { Exchange, ExchangeId } from "../domain/exchange.ts";
import { latestQuestionOf } from "../domain/latestQuestion.ts";
import { lineOfCard, type LineMatch } from "../domain/sourceLine.ts";
import type { RestoreNames } from "./ReplyView.tsx";
import type { CorrectionLine } from "./CorrectionLines.tsx";
import { useAnnouncedEdits } from "./useAnnouncedEdits.ts";
import { justDrawnOf, type LinkLine, linkLinesOf } from "./linkLines.ts";
import { useBoardSelection } from "./useBoardSelection.ts";
import type { useVisitorActions } from "./useVisitorActions.ts";

export function useBoardView(exchanges: readonly Exchange[], restoreNames: RestoreNames, edits: ReturnType<typeof useVisitorActions>) {
  const board = useMemo(() => boardOf(exchanges, edits.actions), [exchanges, edits.actions]);
  const counts = useMemo(() => replyCountsOf(exchanges, edits.actions), [exchanges, edits.actions]);
  const announced = useAnnouncedEdits(board, edits, restoreNames);
  const { selected, toggle } = useBoardSelection();
  const selectedCard = board.cards.find((card) => card.id === selected);
  const highlight = selectedCard ? lineOfCard(selectedCard, exchanges) : null;
  return {
    board,
    countsOf: (id: ExchangeId): ReplyCounts => counts.get(id) ?? NO_EVENTS,
    selected: selectedCard?.id ?? null,
    toggle,
    ...announced,
    linksOf: (id: ExchangeId): LinkLine[] => linkLinesOf(board, edits.actions, id, restoreNames),
    justDrawn: justDrawnOf(board, edits.actions),
    undoable: undoableOf(board, edits.actions.at(-1)),
    correctionsOf: (id: ExchangeId): CorrectionLine[] => correctionLinesOf(board, id, restoreNames),
    highlight,
    highlightedLine: highlight && restoredLine(lineTextOf(highlight, exchanges), restoreNames),
    question: latestQuestionOf(exchanges, (text) => restoreNames(text).text),
  };
}

function correctionLinesOf(board: Board, id: ExchangeId, restoreNames: RestoreNames): CorrectionLine[] {
  const restored = (text: string) => restoreNames(text).text;
  return board.cards.flatMap(({ correctedFrom, correctedAt, text }) =>
    correctedFrom !== undefined && correctedAt === id ? [{ was: restored(correctedFrom), now: restored(text) }] : [],
  );
}

const NO_EVENTS: ReplyCounts = { added: 0, updated: 0, already: 0 };

function undoableOf(board: Board, last: VisitorAction | undefined): EntityId | null {
  const corrected = last?.kind === "correct" ? last.id : undefined;
  const card = board.cards.find(({ id }) => id === corrected);
  return card && struckWordsOf(board, card) !== null ? card.id : null;
}

function lineTextOf({ exchangeId, start, end }: LineMatch, exchanges: readonly Exchange[]): string | null {
  return exchanges.find((exchange) => exchange.id === exchangeId)?.prompt.slice(start, end) ?? null;
}

const restoredLine = (line: string | null, restoreNames: RestoreNames): string | null => line && restoreNames(line).text;
