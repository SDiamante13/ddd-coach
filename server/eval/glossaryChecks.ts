export type GlossaryExpect = { drift?: string[]; keptFrom?: string[]; settled?: string[][] };

const DRIFT_WORD = /^- ["“](.+?)["”]:/;

const driftWordOf = (line: string): string | undefined => DRIFT_WORD.exec(line)?.[1]?.toLowerCase();

export function driftNamed(driftLines: readonly string[], { drift = [], keptFrom = [] }: GlossaryExpect): boolean {
  return drift.every((word) =>
    driftLines.some((line) => driftWordOf(line) === word.toLowerCase() && keptFrom.some((from) => line.includes(from))),
  );
}

export function noFalseDrift(driftLines: readonly string[], { drift = [] }: GlossaryExpect): boolean {
  const expected = drift.map((word) => word.toLowerCase());
  return driftLines.every((line) => {
    const word = driftWordOf(line);
    return word !== undefined && expected.includes(word);
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
