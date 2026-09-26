export const EVENTS_HEADING = "Events, in order";
export const WORDS_HEADING = "Words that don't match";
export const DRIFT_HEADING = "Changed since you kept it";
export const QUESTION = /^Question for ([^:]+): (.+\?)$/;
export const SOURCE_QUOTE = /^From thread: ["“](.+)["”]$/;
export const CITATION = /^Source: Evans, Domain-Driven Design Reference \(2015\), ["“](.+?)["”]\.?$/;

const NUMBERED = /^\d+\. /;
const MEANING = /^- /;
const QUOTED_WORD = /^["“](.+)["”]$/;
const SOURCE_LABEL = /^(From thread|Guess): /;

export type ReplyLayout = {
  lines: string[];
  inOrder: boolean;
  eventLines: string[];
  eventClaims: string[];
  meaningClaims: string[];
  quotedWords: string[];
  wordLines: string[];
  driftLines: string[];
};

export type CoachReply = {
  events: string[];
  words: { word: string; meanings: string[] }[];
  question: { roles: string; text: string };
};

export function parseLayout(reply: string): ReplyLayout {
  const lines = reply.split("\n").map((line) => line.trim());
  const positions = [lines.indexOf(EVENTS_HEADING), lines.indexOf(WORDS_HEADING), lines.findIndex(isQuestion)];
  const [events = -1, words = -1, question = -1] = positions;
  const drift = lines.indexOf(DRIFT_HEADING);
  const boundaries = [...positions, drift];
  const eventLines = between(lines, events, sectionEnd(events, boundaries));
  const wordLines = between(lines, words, sectionEnd(words, boundaries));
  return {
    lines,
    inOrder: isAscending(positions) && (drift < 0 || (drift > words && drift < question)),
    eventLines,
    eventClaims: eventLines.map((line) => line.replace(NUMBERED, "")),
    meaningClaims: wordLines.filter((line) => MEANING.test(line)).map((line) => line.replace(MEANING, "")),
    quotedWords: wordLines.flatMap((line) => QUOTED_WORD.exec(line)?.[1] ?? []),
    wordLines,
    driftLines: between(lines, drift, sectionEnd(drift, boundaries)),
  };
}

export function parseCoachReply(reply: string): CoachReply | null {
  const layout = parseLayout(reply);
  const question = layout.lines.map((line) => QUESTION.exec(line)).find((match) => match !== null);
  if (!layout.inOrder || !question) return null;
  return { events: layout.eventClaims, words: wordsOf(layout.wordLines), question: { roles: question[1]!, text: question[2]! } };
}

function wordsOf(wordLines: string[]): CoachReply["words"] {
  const words: CoachReply["words"] = [];
  for (const line of wordLines) {
    const word = QUOTED_WORD.exec(line)?.[1];
    if (word !== undefined) words.push({ word, meanings: [] });
    else if (MEANING.test(line)) words.at(-1)?.meanings.push(line.replace(MEANING, ""));
  }
  return words;
}

export const isQuestion = (line: string): boolean => QUESTION.test(line);
export const isSourceQuote = (line: string): boolean => SOURCE_QUOTE.test(line);
export const isNumbered = (line: string): boolean => NUMBERED.test(line);
export const hasSourceLabel = (claim: string): boolean => SOURCE_LABEL.test(claim);
export const withoutSourceLabel = (claim: string): string => claim.replace(SOURCE_LABEL, "");

function sectionEnd(start: number, boundaries: number[]): number {
  const later = boundaries.filter((at) => at > start);
  return later.length === 0 ? -1 : Math.min(...later);
}

function isAscending(positions: number[]): boolean {
  return positions.every((at, i) => at >= 0 && (i === 0 || at > (positions[i - 1] ?? 0)));
}

function between(lines: string[], start: number, end: number): string[] {
  if (start < 0) return [];
  return lines.slice(start + 1, end < 0 ? undefined : end).filter((line) => line !== "");
}
