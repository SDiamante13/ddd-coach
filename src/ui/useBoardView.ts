import { useMemo } from "react";
import { boardOf } from "../domain/boardFromReplies.ts";
import type { Exchange } from "../domain/exchange.ts";
import { latestQuestionOf } from "../domain/latestQuestion.ts";
import { lineOfCard, type LineMatch } from "../domain/sourceLine.ts";
import type { RestoreNames } from "./ReplyView.tsx";
import { useBoardSelection } from "./useBoardSelection.ts";

export function useBoardView(exchanges: readonly Exchange[], restoreNames: RestoreNames) {
  const board = useMemo(() => boardOf(exchanges), [exchanges]);
  const { selected, toggle } = useBoardSelection();
  const selectedCard = board.cards.find((card) => card.id === selected);
  const highlight = selectedCard ? lineOfCard(selectedCard, exchanges) : null;
  return {
    board,
    selected: selectedCard?.id ?? null,
    toggle,
    highlight,
    highlightedLine: highlight && lineTextOf(highlight, exchanges),
    question: latestQuestionOf(exchanges, (text) => restoreNames(text).text),
  };
}

function lineTextOf({ exchangeId, start, end }: LineMatch, exchanges: readonly Exchange[]): string | null {
  return exchanges.find((exchange) => exchange.id === exchangeId)?.prompt.slice(start, end) ?? null;
}
