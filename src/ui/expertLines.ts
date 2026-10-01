import type { EntityId } from "../domain/entityId.ts";
import type { RowCheck } from "../domain/rowChecks.ts";
import type { WordsLane } from "../domain/words.ts";
import type { Hotspot } from "./hotspot.ts";
import type { RestoreNames } from "./ReplyView.tsx";

export type ExpertLine = { term: EntityId; text: string };
export type ExpertLines = { who: string; rows: ReadonlySet<EntityId>; lines: ExpertLine[]; answered: number; total: number };
type ShownRow = { id: EntityId; holder: string };

const ANSWERED: readonly (RowCheck["verdict"] | undefined)[] = ["holds", "wrong"];

export function expertLinesOf(hotspot: Hotspot | null, roles: string | undefined, words: WordsLane, checks: ReadonlyMap<EntityId, RowCheck>, restoreNames: RestoreNames): ExpertLines | null {
  if (hotspot === null || roles === undefined) return null;
  const tied = new Set(hotspot.rows.map(({ term }) => term));
  const shown = (text: string) => restoreNames(text).text;
  const terms = words.terms.filter(({ id }) => tied.has(id)).map((term) => ({ id: term.id, word: shown(term.word), rows: term.rows.map((row) => ({ id: row.id, holder: shown(row.holder) })) }));
  const rows = terms.flatMap((term) => term.rows);
  if (rows.length === 0) return null;
  const verdictOf = (row: ShownRow) => checks.get(row.id)?.verdict;
  const lines = terms.flatMap(({ id, word, rows: termRows }) => termLine(id, word, termRows, verdictOf));
  const answered = rows.filter((row) => ANSWERED.includes(verdictOf(row))).length;
  return { who: roles.split(", at ")[0]!, rows: new Set(rows.map(({ id }) => id)), lines, answered, total: rows.length };
}

function termLine(term: EntityId, word: string, rows: ShownRow[], verdictOf: (row: ShownRow) => RowCheck["verdict"] | undefined): ExpertLine[] {
  const desks = (wanted: (verdict: RowCheck["verdict"] | undefined) => boolean) => rows.filter((row) => wanted(verdictOf(row))).map(({ holder }) => holder).join(", ");
  const open = desks((verdict) => verdict === undefined);
  const unsure = desks((verdict) => verdict === "unknown");
  const asks = [...(open ? [`still current for ${open}?`] : []), ...(unsure ? [`${open ? "Where" : "where"} is it written down for ${unsure}?`] : [])];
  return asks.length === 0 ? [] : [{ term, text: `“${word}”: ${asks.join(" ")}` }];
}

const updatedInThreePlaces = (who: string): string => `Updated in 3 places: the row, the question card and the lines for ${who}.`;

export const updatedLineOf = (verdict: RowCheck["verdict"], who: string): string =>
  ANSWERED.includes(verdict) ? updatedInThreePlaces(who) : `Updated: the row and the lines for ${who}.`;
