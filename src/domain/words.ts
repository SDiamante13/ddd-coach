import type { Provenance } from "./board.ts";
import { type EntityId, entityId } from "./entityId.ts";
import type { Exchange, ExchangeId } from "./exchange.ts";
import { type Meaning, parseReply, type Source, type WordRow } from "./replyBlocks.ts";
import { closestLine } from "./sourceLine.ts";
import { spokenLinesOf } from "./pasteSpeakers.ts";
import { teamOfHolder, type WhoIsWho } from "./whosWho.ts";
import type { Correction, VisitorAction } from "./boardFromReplies.ts";

export type TermRow = {
  id: EntityId;
  holder: string;
  meaning: string;
  provenance: Provenance;
  line: string | null;
  placedBy: ExchangeId;
  changedBy: ExchangeId;
  correctedFrom?: string;
};
export type TermCard = { id: EntityId; word: string; rows: TermRow[]; placedBy: ExchangeId };
export type WordsLane = { terms: TermCard[]; latest: ExchangeId | null };

const PROVENANCE_OF: Record<Source, Provenance> = { "From thread": "thread", Guess: "guess" };

export function wordsOf(exchanges: readonly Exchange[], edits: readonly VisitorAction[] = [], whoIsWho: WhoIsWho = new Map()): WordsLane {
  return exchanges.reduce<WordsLane>((lane, exchange, index) => {
    if (exchange.status !== "replied") return lane;
    const rows = parseReply(exchange.reply).flatMap((block) => (block.kind === "words" ? block.rows : []));
    const lineOf = sourceLineIn(exchanges.slice(0, index + 1), whoIsWho);
    const terms = rows.reduce((kept, row) => withWord(kept, row, exchange.id, lineOf), lane.terms);
    return { terms: correctionsAfter(exchange.id, edits).reduce(withCorrection, terms), latest: exchange.id };
  }, { terms: [], latest: null });
}

const correctionsAfter = (by: ExchangeId, edits: readonly VisitorAction[]): Correction[] =>
  edits.filter((edit): edit is Correction => edit.kind === "correct" && edit.after === by);

const withCorrection = (terms: TermCard[], { id, text }: Correction): TermCard[] =>
  terms.map((term) => ({ ...term, rows: term.rows.map((row) => (row.id === id ? { ...row, meaning: text, correctedFrom: row.correctedFrom ?? row.meaning } : row)) }));

type LineOf = (holder: string, text: string) => string | null;

function withWord(terms: TermCard[], { word, meanings }: WordRow, by: ExchangeId, lineOf: LineOf): TermCard[] {
  const id = entityId("term", word);
  const term = terms.find((each) => each.id === id) ?? { id, word, rows: [], placedBy: by };
  const rows = meanings.reduce((kept, meaning) => withMeaning(kept, word, meaning, by, lineOf), term.rows);
  const updated = { ...term, rows };
  return terms.some((each) => each.id === id) ? terms.map((each) => (each.id === id ? updated : each)) : [...terms, updated];
}

function withMeaning(rows: TermRow[], word: string, { source, holder, meaning }: Meaning, by: ExchangeId, lineOf: LineOf): TermRow[] {
  const id = entityId("meaning", `${word}|${holder}`);
  const provenance = PROVENANCE_OF[source];
  const line = provenance === "guess" ? null : lineOf(holder, `${word} ${meaning}`);
  const kept = rows.find((row) => row.id === id);
  if (kept === undefined) return [...rows, { id, holder, meaning, provenance, line, placedBy: by, changedBy: by }];
  if (kept.correctedFrom !== undefined) return rows;
  if (kept.meaning === meaning && kept.provenance === provenance) return rows;
  return rows.map((row) => (row.id === id ? { ...row, meaning, provenance, line, changedBy: by } : row));
}

const sourceLineIn =
  (upTo: readonly Exchange[], whoIsWho: WhoIsWho): LineOf =>
  (holder, text) => {
    const prompts = [...upTo].reverse().map(({ id, prompt }) => ({ exchangeId: id, text: ownLinesOf(prompt, holder, whoIsWho) }));
    const match = closestLine(text, prompts);
    return match && (upTo.find(({ id }) => id === match.exchangeId)?.prompt.slice(match.start, match.end) ?? null);
  };

const wordsOfText = (text: string): string[] => text.toLowerCase().match(/[a-z0-9]+/g) ?? [];

function speaksFor(speaker: string, holder: string, team: string | null, whoIsWho: WhoIsWho): boolean {
  const own = new Set(wordsOfText(speaker));
  return wordsOfText(holder).every((token) => own.has(token)) || (team !== null && whoIsWho.get(speaker.toLowerCase()) === team);
}

function ownLinesOf(prompt: string, holder: string, whoIsWho: WhoIsWho): string {
  const team = teamOfHolder(holder, [...new Set(whoIsWho.values())]);
  const masked = prompt.replace(/[^\n]/g, " ").split("");
  for (const { start, end } of spokenLinesOf(prompt).filter(({ speaker }) => speaksFor(speaker, holder, team, whoIsWho))) masked.splice(start, end - start, ...prompt.slice(start, end).split(""));
  return masked.join("");
}
