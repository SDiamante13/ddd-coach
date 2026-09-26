import { useMemo } from "react";
import { type Board, cardsPlacedBy, struckWordsOf } from "../domain/board.ts";
import { boardOf, type Correction } from "../domain/boardFromReplies.ts";
import type { EntityId } from "../domain/entityId.ts";
import type { Exchange, ExchangeId } from "../domain/exchange.ts";
import { latestQuestionOf } from "../domain/latestQuestion.ts";
import { lineOfCard, type LineMatch } from "../domain/sourceLine.ts";
import type { RestoreNames } from "./ReplyView.tsx";
import { useBoardSelection } from "./useBoardSelection.ts";
import { useCorrections } from "./useCorrections.ts";

export function useBoardView(exchanges: readonly Exchange[], restoreNames: RestoreNames, outgoing: (text: string) => string) {
  const fixes = useCorrections(outgoing);
  const board = useMemo(() => boardOf(exchanges, fixes.corrections), [exchanges, fixes.corrections]);
  const { selected, toggle } = useBoardSelection();
  const selectedCard = board.cards.find((card) => card.id === selected);
  const highlight = selectedCard ? lineOfCard(selectedCard, exchanges) : null;
  return {
    board,
    newCardsOf: (id: ExchangeId) => cardsPlacedBy(board, id),
    selected: selectedCard?.id ?? null,
    toggle,
    correct: (id: EntityId, text: string) => board.latest && fixes.correct(id, text, board.latest),
    undo: fixes.undo,
    undoable: undoableOf(board, fixes.corrections.at(-1)),
    highlight,
    highlightedLine: highlight && restoredLine(lineTextOf(highlight, exchanges), restoreNames),
    question: latestQuestionOf(exchanges, (text) => restoreNames(text).text),
  };
}

function undoableOf(board: Board, last: Correction | undefined): EntityId | null {
  const card = board.cards.find(({ id }) => id === last?.id);
  return card && struckWordsOf(board, card) !== null ? card.id : null;
}

function lineTextOf({ exchangeId, start, end }: LineMatch, exchanges: readonly Exchange[]): string | null {
  return exchanges.find((exchange) => exchange.id === exchangeId)?.prompt.slice(start, end) ?? null;
}

const restoredLine = (line: string | null, restoreNames: RestoreNames): string | null => line && restoreNames(line).text;
