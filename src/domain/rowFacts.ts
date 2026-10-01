import type { Verdict } from "./boardFromReplies.ts";
import { shortDate } from "./dates.ts";
import type { EntityId } from "./entityId.ts";
import type { RowCheck } from "./rowChecks.ts";
import type { RowFact, RowFacts } from "./rfcExport.ts";
import type { TermRow, WordsLane } from "./words.ts";

const VERDICT_TEXT: Record<Verdict, string> = { holds: "checked by you", wrong: "marked wrong by you", unknown: "couldn't tell" };

type Shown = (text: string) => string;

export function rowFactsOf(lane: WordsLane, checks: ReadonlyMap<EntityId, RowCheck>, shown: Shown, settleBy?: string): RowFacts {
  const facts = new Map(lane.terms.flatMap(({ word, rows }) => rows.map((row) => [`${shown(word)}|${shown(row.holder)}`, factOf(row, checks.get(row.id), shown)] as const)));
  return { ...(settleBy !== undefined && { settleBy }), rowOf: (word, holder) => facts.get(`${word}|${holder}`) };
}

function factOf({ meaning, correctedFrom }: TermRow, check: RowCheck | undefined, shown: Shown): RowFact | undefined {
  if (check === undefined && correctedFrom === undefined) return undefined;
  return { ...(check && { status: statusOf(check, shown) }), ...(correctedFrom !== undefined && { meaning: shown(meaning) }) };
}

function statusOf({ verdict, at, where }: RowCheck, shown: Shown): string {
  const [year, month, day] = at.split("-").map(Number);
  return [VERDICT_TEXT[verdict], shortDate(new Date(year!, month! - 1, day!)), ...(where ? [shown(where)] : [])].join(", ");
}
