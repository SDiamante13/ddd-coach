import type { Board } from "./board.ts";
import type { EntityId } from "./entityId.ts";
import type { Exchange } from "./exchange.ts";
import type { LatestQuestion } from "./latestQuestion.ts";
import { closestLine, type LineMatch, lineOfCard } from "./sourceLine.ts";
import { wordsOf } from "./words.ts";

const MAX_LINKS = 2;

export type RowTie = { term: EntityId; row: EntityId; word: string; holder: string };
export type QuestionTies = { links: EntityId[]; rows: RowTie[]; unplaced: string[] };

export function questionTiesOf(question: LatestQuestion, board: Board, exchanges: readonly Exchange[]): QuestionTies {
  const asked = exchanges.findIndex((exchange) => exchange.id === question.exchangeId);
  const upTo = exchanges.slice(0, asked + 1);
  const prompts = [...upTo].reverse().map(({ id, prompt }) => ({ exchangeId: id, text: prompt }));
  const cardLines = board.cards.map((card) => ({ id: card.id, line: lineOfCard(card, exchanges) }));
  const termRows = wordsOf(upTo).terms.flatMap((term) => term.rows.map((row) => ({ term: term.id, row: row.id, word: term.word, holder: row.holder, line: row.line })));
  const tied = question.sources.map((source) => {
    const line = closestLine(source, prompts);
    const text = line && textOf(line, upTo);
    return {
      source,
      cards: cardLines.filter((card) => line !== null && sameLine(card.line, line)).map((card) => card.id),
      rows: termRows.filter((row) => text !== null && row.line === text).map(({ line: _line, ...tie }) => tie),
    };
  });
  const links = [...new Set(tied.flatMap(({ cards }) => cards))].slice(0, MAX_LINKS);
  const rows = tied.flatMap((tie) => tie.rows).filter((tie, index, all) => all.findIndex(({ row }) => row === tie.row) === index);
  return { links, rows, unplaced: tied.filter((tie) => tie.cards.length === 0 && tie.rows.length === 0).map(({ source }) => source) };
}

const textOf = ({ exchangeId, start, end }: LineMatch, exchanges: readonly Exchange[]): string | null =>
  exchanges.find(({ id }) => id === exchangeId)?.prompt.slice(start, end) ?? null;

export const questionLinksOf = (question: LatestQuestion, board: Board, exchanges: readonly Exchange[]): EntityId[] => questionTiesOf(question, board, exchanges).links;

const sameLine = (a: LineMatch | null, b: LineMatch): boolean => a !== null && a.exchangeId === b.exchangeId && a.start === b.start;
