import { CITATION } from "../src/shared/replyLayout.ts";
import { DDD_REFERENCE } from "./knowledge/dddReference.ts";
import { referenceTitles } from "./knowledge/sections.ts";

export type VettedReply = { reply: string; dropped: string[] };

const SOURCE_LINE = /^Source:/;

export function dropUnknownCitations(reply: string, titles: readonly string[]): VettedReply {
  const lines = reply.split("\n");
  const unknown = (line: string) => SOURCE_LINE.test(line.trim()) && !titles.includes(CITATION.exec(line.trim())?.[1] ?? "");
  return { reply: lines.filter((line) => !unknown(line)).join("\n"), dropped: lines.filter(unknown) };
}

const REFERENCE_TITLES = referenceTitles(DDD_REFERENCE);

export function vetCitations(log: (dropped: string[]) => void): (reply: string) => string {
  return (reply) => {
    const vetted = dropUnknownCitations(reply, REFERENCE_TITLES);
    if (vetted.dropped.length > 0) log(vetted.dropped);
    return vetted.reply;
  };
}
