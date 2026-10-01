import type { Board } from "./board.ts";
import type { EntityId } from "./entityId.ts";
import type { Exchange } from "./exchange.ts";
import type { LatestQuestion } from "./latestQuestion.ts";
import { closestLine, type LineMatch, lineOfCard } from "./sourceLine.ts";

const MAX_LINKS = 2;

export type QuestionTies = { links: EntityId[]; unplaced: string[] };

export function questionTiesOf(question: LatestQuestion, board: Board, exchanges: readonly Exchange[]): QuestionTies {
  const asked = exchanges.findIndex((exchange) => exchange.id === question.exchangeId);
  const prompts = exchanges.slice(0, asked + 1).reverse().map(({ id, prompt }) => ({ exchangeId: id, text: prompt }));
  const cardLines = board.cards.map((card) => ({ id: card.id, line: lineOfCard(card, exchanges) }));
  const tied = question.sources.map((source) => {
    const line = closestLine(source, prompts);
    return { source, cards: cardLines.filter((card) => line !== null && sameLine(card.line, line)).map((card) => card.id) };
  });
  const links = [...new Set(tied.flatMap(({ cards }) => cards))].slice(0, MAX_LINKS);
  return { links, unplaced: tied.filter(({ cards }) => cards.length === 0).map(({ source }) => source) };
}

export const questionLinksOf = (question: LatestQuestion, board: Board, exchanges: readonly Exchange[]): EntityId[] => questionTiesOf(question, board, exchanges).links;

const sameLine = (a: LineMatch | null, b: LineMatch): boolean => a !== null && a.exchangeId === b.exchangeId && a.start === b.start;
