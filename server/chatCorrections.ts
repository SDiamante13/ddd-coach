import type { SentCorrection } from "../src/domain/board.ts";
import { MAX_CORRECTION_CHARS, MAX_CORRECTIONS } from "../src/shared/chatContract.ts";
import { CORRECTIONS_ENABLED } from "../src/shared/features.ts";
import { field, stringField } from "../src/shared/json.ts";

const isLong = (item: unknown): boolean =>
  (["was", "now"] as const).some((key) => (stringField(item, key)?.length ?? 0) > MAX_CORRECTION_CHARS);

export function hasTooManyCorrections(body: unknown): boolean {
  const corrections = field(body, "corrections");
  return Array.isArray(corrections) && (corrections.length > MAX_CORRECTIONS || corrections.some(isLong));
}

export function readCorrections(body: unknown): SentCorrection[] | null {
  const corrections = field(body, "corrections");
  if (!CORRECTIONS_ENABLED || corrections === undefined) return [];
  if (!Array.isArray(corrections)) return null;
  const read = corrections.map(readCorrection);
  return read.every((item) => item !== null) ? read : null;
}

function readCorrection(item: unknown): SentCorrection | null {
  const was = stringField(item, "was")?.trim();
  const now = stringField(item, "now")?.trim();
  return was && now ? { was, now } : null;
}
