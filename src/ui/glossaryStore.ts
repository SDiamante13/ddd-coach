import { MAX_KEPT_ROWS, type Glossary, type KeptRow } from "../domain/glossary.ts";
import { stringField } from "../shared/json.ts";

const KEY = "ddd-coach.glossary.v1";
const VERSION = 1;

export function keepGlossary(rows: Glossary): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ version: VERSION, rows }));
  } catch {
    return;
  }
}

export function keptGlossary(): Glossary {
  try {
    const kept = JSON.parse(localStorage.getItem(KEY) ?? "{}") as { version?: unknown; rows?: Glossary };
    return kept.version === VERSION && Array.isArray(kept.rows) ? kept.rows.filter(isKeptRow).slice(0, MAX_KEPT_ROWS) : [];
  } catch {
    return [];
  }
}

const TEXT_FIELDS = ["id", "termId", "word", "holder", "meaning", "from"] as const;
const SOURCES: readonly unknown[] = ["From thread", "Guess"];
const DAY = /^\d{4}-\d{2}-\d{2}$/;

function isKeptRow(value: unknown): value is KeptRow {
  const texts = TEXT_FIELDS.every((field) => Boolean(stringField(value, field)));
  return texts && SOURCES.includes(stringField(value, "source")) && DAY.test(stringField(value, "keptOn") ?? "");
}
