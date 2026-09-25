import type { Source } from "../domain/replyBlocks.ts";

export function SourceChip({ source }: { source: Source }) {
  return <span className={source === "Guess" ? "chip guess" : "chip"}>{source}</span>;
}
