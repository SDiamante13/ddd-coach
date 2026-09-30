import { useMemo } from "react";
import { type Board, struckWordsOf } from "../domain/board.ts";
import { boardOf, type Correction, replyCountsOf } from "../domain/boardFromReplies.ts";
import type { ReplyCounts } from "../domain/replyChip.ts";
import type { EntityId } from "../domain/entityId.ts";
import type { Exchange, ExchangeId } from "../domain/exchange.ts";
import { latestQuestionOf } from "../domain/latestQuestion.ts";
import { lineOfCard, type LineMatch } from "../domain/sourceLine.ts";
import type { RestoreNames } from "./ReplyView.tsx";
import type { CorrectionLine } from "./CorrectionLines.tsx";
import { useAnnouncedEdits } from "./useAnnouncedEdits.ts";
import { useBoardSelection } from "./useBoardSelection.ts";
import type { useCorrections } from "./useCorrections.ts";

export function useBoardView(exchanges: readonly Exchange[], restoreNames: RestoreNames, fixes: ReturnType<typeof useCorrections>) {
  const board = useMemo(() => boardOf(exchanges, fixes.corrections), [exchanges, fixes.corrections]);
  const counts = useMemo(() => replyCountsOf(exchanges, fixes.corrections), [exchanges, fixes.corrections]);
  const edits = useAnnouncedEdits(board, fixes, restoreNames);
  const { selected, toggle } = useBoardSelection();
  const selectedCard = board.cards.find((card) => card.id === selected);
  const highlight = selectedCard ? lineOfCard(selectedCard, exchanges) : null;
  return {
    board,
    countsOf: (id: ExchangeId): ReplyCounts => counts.get(id) ?? NO_EVENTS,
    selected: selectedCard?.id ?? null,
    toggle,
    ...edits,
    undoable: undoableOf(board, fixes.corrections.at(-1)),
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

function undoableOf(board: Board, last: Correction | undefined): EntityId | null {
  const card = board.cards.find(({ id }) => id === last?.id);
  return card && struckWordsOf(board, card) !== null ? card.id : null;
}

function lineTextOf({ exchangeId, start, end }: LineMatch, exchanges: readonly Exchange[]): string | null {
  return exchanges.find((exchange) => exchange.id === exchangeId)?.prompt.slice(start, end) ?? null;
}

const restoredLine = (line: string | null, restoreNames: RestoreNames): string | null => line && restoreNames(line).text;
