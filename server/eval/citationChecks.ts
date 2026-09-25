import { CITATION } from "../../src/shared/replyLayout.ts";
import { DDD_REFERENCE } from "../knowledge/dddReference.ts";
import { referenceTitles } from "../knowledge/sections.ts";

const TITLES = new Set(referenceTitles(DDD_REFERENCE));
const SOURCE_LINE = /^Source:/;

export function citesVerbatim(lines: readonly string[]): boolean {
  return lines.filter((line) => SOURCE_LINE.test(line)).every((line) => TITLES.has(CITATION.exec(line)?.[1] ?? ""));
}

export function citesOneOf(lines: readonly string[], expected: readonly string[] | undefined): boolean {
  if (expected === undefined) return true;
  return lines.some((line) => expected.includes(CITATION.exec(line)?.[1] ?? ""));
}

const NOT_COVERED = /\b(?:the )?sources I have don['’]t cover\b|\bthe reference doesn['’]t cover\b/i;

export function admitsNotCovered(text: string, notCovered: boolean | undefined): boolean {
  if (!notCovered) return true;
  return NOT_COVERED.test(text) && !text.split("\n").some((line) => SOURCE_LINE.test(line));
}
