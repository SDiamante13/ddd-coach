import type { Provenance } from "./board.ts";
import { type EntityId, entityId } from "./entityId.ts";
import type { Exchange, ExchangeId } from "./exchange.ts";
import { type Meaning, parseReply, type Source, type WordRow } from "./replyBlocks.ts";
import { closestLine } from "./sourceLine.ts";

export type TermRow = { id: EntityId; holder: string; meaning: string; provenance: Provenance; line: string | null; placedBy: ExchangeId; changedBy: ExchangeId };
export type TermCard = { id: EntityId; word: string; rows: TermRow[]; placedBy: ExchangeId };
export type WordsLane = { terms: TermCard[]; latest: ExchangeId | null };

const PROVENANCE_OF: Record<Source, Provenance> = { "From thread": "thread", Guess: "guess" };

export function wordsOf(exchanges: readonly Exchange[]): WordsLane {
  return exchanges.reduce<WordsLane>((lane, exchange, index) => {
    if (exchange.status !== "replied") return lane;
    const rows = parseReply(exchange.reply).flatMap((block) => (block.kind === "words" ? block.rows : []));
    const lineOf = sourceLineIn(exchanges.slice(0, index + 1));
    return { terms: rows.reduce((terms, row) => withWord(terms, row, exchange.id, lineOf), lane.terms), latest: exchange.id };
  }, { terms: [], latest: null });
}

function withWord(terms: TermCard[], { word, meanings }: WordRow, by: ExchangeId, lineOf: (text: string) => string | null): TermCard[] {
  const id = entityId("term", word);
  const term = terms.find((each) => each.id === id) ?? { id, word, rows: [], placedBy: by };
  const rows = meanings.reduce((kept, meaning) => withMeaning(kept, word, meaning, by, lineOf), term.rows);
  const updated = { ...term, rows };
  return terms.some((each) => each.id === id) ? terms.map((each) => (each.id === id ? updated : each)) : [...terms, updated];
}

function withMeaning(rows: TermRow[], word: string, { source, holder, meaning }: Meaning, by: ExchangeId, lineOf: (text: string) => string | null): TermRow[] {
  const id = entityId("meaning", `${word}|${holder}`);
  const provenance = PROVENANCE_OF[source];
  const line = provenance === "guess" ? null : lineOf(`${holder} ${word} ${meaning}`);
  const kept = rows.find((row) => row.id === id);
  if (kept === undefined) return [...rows, { id, holder, meaning, provenance, line, placedBy: by, changedBy: by }];
  if (kept.meaning === meaning && kept.provenance === provenance) return rows;
  return rows.map((row) => (row.id === id ? { ...row, meaning, provenance, line, changedBy: by } : row));
}

const sourceLineIn = (upTo: readonly Exchange[]) => (text: string): string | null => {
  const prompts = [...upTo].reverse().map(({ id, prompt }) => ({ exchangeId: id, text: prompt }));
  const match = closestLine(text, prompts);
  return match && (upTo.find(({ id }) => id === match.exchangeId)?.prompt.slice(match.start, match.end) ?? null);
};
