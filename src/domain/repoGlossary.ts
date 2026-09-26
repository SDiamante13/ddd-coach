import { entityId } from "./entityId.ts";
import type { Source, WordRow } from "./replyBlocks.ts";
import type { RfcDocument, RfcQuestion } from "./rfcExport.ts";

export type RowStatus = { kind: "settled" } | { kind: "guess" } | { kind: "unsettled"; question: number };
export type ContextRow = { context: string; meaning: string; source: Source; status: RowStatus };
export type RepoTerm = { word: string; avoid: string[]; rows: ContextRow[] };
export type RepoGlossary = { origin: string; terms: RepoTerm[]; questions: RfcQuestion[] };

const REPLY_ORIGIN = "from one coach reply to a pasted thread";
const UNNAMED_CONTEXT = "Team unclear";

export const replyGlossary = (document: RfcDocument): RepoGlossary => ({
  origin: REPLY_ORIGIN,
  terms: document.words.map((word) => termOf(word, document.questions)),
  questions: document.questions,
});

export const isOpen = ({ status }: ContextRow): boolean => status.kind !== "settled";

export const unsettledTerms = ({ terms }: RepoGlossary): number => terms.filter(({ rows }) => rows.some(isOpen)).length;

const termOf = (term: WordRow, questions: RfcQuestion[]): RepoTerm => ({
  word: term.word,
  avoid: sameMeaningWords(term),
  rows: term.meanings.map(({ holder, meaning, source }) => ({
    ...{ context: holder || UNNAMED_CONTEXT, meaning, source },
    status: statusOf(term.word, source, questions),
  })),
});

const QUOTED = /["“]([^"”]+)["”]/g;

const quotedIn = (text: string): string[] => [...text.matchAll(QUOTED)].map((match) => match[1]!);

const sameWord = (a: string, b: string): boolean => a.toLowerCase() === b.toLowerCase();

function sameMeaningWords({ word, meanings }: WordRow): string[] {
  const fromThread = meanings.filter(({ source }) => source === "From thread");
  const pairs = fromThread.map(({ meaning }) => quotedIn(meaning)).filter((quoted) => quoted.some((each) => sameWord(each, word)));
  return [...new Set(pairs.flat().filter((each) => !sameWord(each, word)))];
}

function statusOf(word: string, source: Source, questions: RfcQuestion[]): RowStatus {
  if (source === "Guess") return { kind: "guess" };
  const asked = questions.findIndex(({ text }) => mentions(text, word));
  return asked < 0 ? { kind: "settled" } : { kind: "unsettled", question: asked + 1 };
}

const tokens = (text: string): string[] =>
  entityId("term", text)
    .slice("term:".length)
    .split(/[^\p{L}\p{N}_']+/u)
    .filter(Boolean);

const sameToken = (said: string | undefined, term: string): boolean => said === term || said === `${term}s`;

function mentions(text: string, word: string): boolean {
  const [said, term] = [tokens(text), tokens(word)];
  return said.some((_, start) => term.every((token, offset) => sameToken(said[start + offset], token)));
}
