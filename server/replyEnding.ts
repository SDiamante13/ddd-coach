import { CUT_SHORT_NOTE } from "../src/shared/chatContract.ts";

const SENTENCE_END = /(?<!^\d+)[.?!]["')\]]?(?=\s|$)/gm;

export function endOnCompleteLine(text: string): string {
  const complete = completePart(text);
  return complete === "" ? "" : `${complete}\n\n${CUT_SHORT_NOTE}`;
}

function completePart(text: string): string {
  const end = Math.max(text.lastIndexOf("\n"), lastSentenceEnd(text), 0);
  return text.slice(0, end).trim();
}

function lastSentenceEnd(text: string): number {
  const last = [...text.matchAll(SENTENCE_END)].at(-1);
  return last === undefined ? -1 : last.index + last[0].length;
}
