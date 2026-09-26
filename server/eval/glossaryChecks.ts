import type { KeptGlossaryRow } from "../../src/domain/glossary.ts";

export type ContradictedRow = { word: string; holder: string };
export type GlossaryExpect = { drift?: ContradictedRow[]; keptFrom?: string[]; settled?: string[][] };

const DRIFT_WORD = /^- ["“](.+?)["”]:/;
const KEPT_QUOTE = /; you kept: ["“](.+?)["”]/;

const withoutEndStop = (text: string): string => text.trim().replace(/\.$/, "");

function keptRowOf(line: string, glossary: readonly KeptGlossaryRow[]): KeptGlossaryRow | undefined {
  const word = DRIFT_WORD.exec(line)?.[1]?.toLowerCase();
  const quote = KEPT_QUOTE.exec(line)?.[1];
  if (word === undefined || quote === undefined) return undefined;
  return glossary.find((row) => row.word.toLowerCase() === word && withoutEndStop(row.meaning) === withoutEndStop(quote));
}

const isRow = (row: KeptGlossaryRow | undefined, { word, holder }: ContradictedRow): boolean =>
  row?.word.toLowerCase() === word.toLowerCase() && row.holder === holder;

export function driftNamed(driftLines: readonly string[], { drift = [], keptFrom = [] }: GlossaryExpect, glossary: readonly KeptGlossaryRow[]): boolean {
  return drift.every((contradicted) =>
    driftLines.some((line) => isRow(keptRowOf(line, glossary), contradicted) && keptFrom.some((from) => line.includes(from))),
  );
}

export function noFalseDrift(driftLines: readonly string[], { drift = [] }: GlossaryExpect, glossary: readonly KeptGlossaryRow[]): boolean {
  return driftLines.every((line) => {
    const row = keptRowOf(line, glossary);
    return drift.some((contradicted) => isRow(row, contradicted));
  });
}

const escaped = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const mentions = (text: string, phrase: string): boolean => new RegExp(`(?<![\\p{L}\\p{N}_])${escaped(phrase)}(?![\\p{L}\\p{N}_])`, "iu").test(text);

export function settledNotReAsked(question: string, { settled = [] }: GlossaryExpect): boolean {
  return !settled.flat().some((phrase) => mentions(question, phrase));
}

export function settledNotRelisted(quotedWords: readonly string[], { settled = [] }: GlossaryExpect): boolean {
  const phrases = settled.flat().map((phrase) => phrase.toLowerCase());
  return !quotedWords.some((word) => phrases.includes(word.toLowerCase()));
}
