import type { EntityId } from "../domain/entityId.ts";
import type { RowCheck } from "../domain/rowChecks.ts";
import type { WordsLane } from "../domain/words.ts";
import type { Hotspot } from "./hotspot.ts";
import type { RestoreNames } from "./ReplyView.tsx";

export type ExpertLine = { row: EntityId; text: string };
export type ExpertLines = { who: string; rows: ReadonlySet<EntityId>; lines: ExpertLine[]; answered: number; total: number };

const ANSWERED: readonly (RowCheck["verdict"] | undefined)[] = ["holds", "wrong"];

export function expertLinesOf(hotspot: Hotspot | null, roles: string | undefined, words: WordsLane, checks: ReadonlyMap<EntityId, RowCheck>, restoreNames: RestoreNames): ExpertLines | null {
  if (hotspot === null || roles === undefined) return null;
  const tied = new Set(hotspot.rows.map(({ term }) => term));
  const shown = (text: string) => restoreNames(text).text;
  const rows = words.terms.filter(({ id }) => tied.has(id)).flatMap((term) => term.rows.map((row) => ({ ...row, word: shown(term.word), holder: shown(row.holder), meaning: shown(row.meaning) })));
  if (rows.length === 0) return null;
  const lines = rows.flatMap((row) => {
    const verdict = checks.get(row.id)?.verdict;
    if (verdict === "unknown") return [{ row: row.id, text: `${row.holder} on “${row.word}”: can you point me to where it's written down now?` }];
    return ANSWERED.includes(verdict) ? [] : [{ row: row.id, text: `Does ${row.holder}'s “${row.word}” still mean: ${asClause(row.meaning)}?` }];
  });
  const answered = rows.filter((row) => ANSWERED.includes(checks.get(row.id)?.verdict)).length;
  return { who: roles.split(", at ")[0]!, rows: new Set(rows.map(({ id }) => id)), lines, answered, total: rows.length };
}

const asClause = (meaning: string): string => meaning.replace(/[.\s]+$/, "");

export const updatedInThreePlaces = (who: string): string => `Updated in 3 places: the row, the question card and the lines for ${who}.`;
