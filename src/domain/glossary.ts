import { shortDate } from "./dates.ts";
import { entityId, type EntityId } from "./entityId.ts";
import { applySwaps, type SwapList } from "./swaps.ts";
import type { ReplyBlock, Source, WordRow } from "./replyBlocks.ts";

export type KeptGlossaryRow = {
  readonly word: string;
  readonly holder: string;
  readonly meaning: string;
  readonly source: Source;
  readonly keptOn: string;
  readonly from: string;
};

export type KeptRow = KeptGlossaryRow & { readonly id: EntityId; readonly termId: EntityId };
export type Glossary = readonly KeptRow[];

export function keptRowsOf(blocks: readonly ReplyBlock[], keptOn: string, from: string): KeptRow[] {
  return blocks.flatMap((block) => (block.kind === "words" ? block.rows.flatMap((row) => rowsOfWord(row, keptOn, from)) : []));
}

function rowsOfWord({ word, meanings }: WordRow, keptOn: string, from: string): KeptRow[] {
  return meanings.map(({ holder, meaning, source }) => ({
    id: entityId("meaning", `${word}|${holder}`),
    termId: entityId("term", word),
    ...{ word, holder, meaning, source, keptOn, from },
  }));
}

const CASE_NUMBER = /\b(load|order|invoice|shipment) #?(\d+)\b/i;
const CUSTOMER = /\bCustomer [A-Z]\b/;

export function sourceLabelOf(question: string | undefined, today: Date): string {
  const numbered = CASE_NUMBER.exec(question ?? "");
  if (numbered) return `${numbered[1]!.toLowerCase()} ${numbered[2]}`;
  return CUSTOMER.exec(question ?? "")?.[0] ?? `thread of ${shortDate(today)}`;
}

export const MAX_KEPT_ROWS = 200;
export const MAX_SENT_ROWS = 60;

export type KeepResult = { ok: true; glossary: Glossary; added: number; updated: number } | { ok: false; reason: "full" };

export function keep(glossary: Glossary, rows: readonly KeptRow[]): KeepResult {
  const incoming = new Map(rows.map((row) => [row.id, row]));
  const kept = new Set(glossary.map((row) => row.id));
  const changed = glossary.filter((row) => incoming.has(row.id) && !sameMeaning(row, incoming.get(row.id)!));
  const added = rows.filter((row) => !kept.has(row.id));
  if (glossary.length + added.length > MAX_KEPT_ROWS) return { ok: false, reason: "full" };
  const updated = glossary.map((row) => (changed.includes(row) ? incoming.get(row.id)! : row));
  return { ok: true, glossary: [...updated, ...added], added: added.length, updated: changed.length };
}

const sameMeaning = (kept: KeptRow, now: KeptRow): boolean => kept.meaning === now.meaning && kept.source === now.source;

const rowsCount = (count: number): string => `${count} ${count === 1 ? "row" : "rows"}`;

export function keepMessage(result: KeepResult, from: string): string {
  if (!result.ok) return `Your glossary is full (${MAX_KEPT_ROWS} rows). Remove some to keep more.`;
  const { added, updated } = result;
  if (added === 0 && updated === 0) return "Already kept.";
  if (updated === 0) return `Kept ${rowsCount(added)} from ${from}.`;
  if (added === 0) return `Updated ${rowsCount(updated)} from ${from}.`;
  return `Updated ${rowsCount(updated)} and kept ${added} new ${added === 1 ? "row" : "rows"} from ${from}.`;
}

export type WordGroup = { word: string; rows: KeptRow[] };

export function byWord(glossary: Glossary): WordGroup[] {
  const groups = new Map<string, KeptRow[]>();
  for (const row of glossary) groups.set(row.termId, [...(groups.get(row.termId) ?? []), row]);
  return [...groups.values()].map((rows) => ({ word: rows[0]!.word, rows }));
}

export function keptLabel({ keptOn, from }: KeptGlossaryRow): string {
  const [year, month, day] = keptOn.split("-").map(Number);
  return `${shortDate(new Date(year!, month! - 1, day))} from ${from}`;
}

export const removeRow = (glossary: Glossary, id: EntityId): Glossary => glossary.filter((row) => row.id !== id);

export type OutgoingGlossary = { sent: KeptGlossaryRow[]; left: KeptRow[] };

export function outgoingGlossary(glossary: Glossary, swaps: SwapList): OutgoingGlossary {
  const chosen = new Set(newestFirst(glossary).slice(0, MAX_SENT_ROWS));
  const swapped = (text: string) => applySwaps(swaps, text).text;
  const sent = glossary.filter((row) => chosen.has(row)).map(({ word, holder, meaning, source, keptOn, from }) => ({
    ...{ word: swapped(word), holder: swapped(holder), meaning: swapped(meaning) },
    ...{ source, keptOn, from: swapped(from) },
  }));
  return { sent, left: glossary.filter((row) => !chosen.has(row)) };
}

function newestFirst(glossary: Glossary): KeptRow[] {
  const byAge = glossary.map((row, index) => ({ row, index }));
  byAge.sort((a, b) => b.row.keptOn.localeCompare(a.row.keptOn) || b.index - a.index);
  return byAge.map(({ row }) => row);
}
