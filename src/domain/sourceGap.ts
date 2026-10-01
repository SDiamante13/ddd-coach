import type { ExchangeId } from "./exchange.ts";
import type { WordsLane } from "./words.ts";

export type SourceGap = { rows: number; none: number; holders: string[] };

export function sourceGapOf(lane: WordsLane, by: ExchangeId): SourceGap {
  const placed = lane.terms.flatMap(({ rows }) => rows).filter((row) => row.placedBy === by);
  const thread = placed.filter((row) => row.provenance === "thread");
  return { rows: thread.length, none: thread.filter((row) => row.line === null).length, holders: [...new Set(placed.map(({ holder }) => holder))] };
}
