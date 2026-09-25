export const EVENTS_HEADING = "Events, in order";
export const WORDS_HEADING = "Words that don't match";
export const QUESTION = /^Question for [^:]+: .+\?$/;

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
};

export function parseLayout(reply: string): ReplyLayout {
  const lines = reply.split("\n").map((line) => line.trim());
  const positions = [lines.indexOf(EVENTS_HEADING), lines.indexOf(WORDS_HEADING), lines.findIndex(isQuestion)];
  const [events = -1, words = -1, question = -1] = positions;
  const eventLines = between(lines, events, words);
  const wordLines = between(lines, words, question);
  return {
    lines,
    inOrder: isAscending(positions),
    eventLines,
    eventClaims: eventLines.map((line) => line.replace(NUMBERED, "")),
    meaningClaims: wordLines.filter((line) => MEANING.test(line)).map((line) => line.replace(MEANING, "")),
    quotedWords: wordLines.flatMap((line) => QUOTED_WORD.exec(line)?.[1] ?? []),
  };
}

export const isQuestion = (line: string): boolean => QUESTION.test(line);
export const isNumbered = (line: string): boolean => NUMBERED.test(line);
export const hasSourceLabel = (claim: string): boolean => SOURCE_LABEL.test(claim);
export const withoutSourceLabel = (claim: string): string => claim.replace(SOURCE_LABEL, "");

function isAscending(positions: number[]): boolean {
  return positions.every((at, i) => at >= 0 && (i === 0 || at > (positions[i - 1] ?? 0)));
}

function between(lines: string[], start: number, end: number): string[] {
  if (start < 0) return [];
  return lines.slice(start + 1, end < 0 ? undefined : end).filter((line) => line !== "");
}
