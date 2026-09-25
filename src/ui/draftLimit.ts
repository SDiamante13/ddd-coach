const countFormat = new Intl.NumberFormat("en-US");

export function formatCount(count: number): string {
  return countFormat.format(count);
}

export type DraftLimit = "ok" | "near" | "over";

const NEAR_SHARE = 0.8;

export function draftLimit(length: number, max: number): DraftLimit {
  if (length > max) return "over";
  return length >= NEAR_SHARE * max ? "near" : "ok";
}

export function restoredDraft(current: string, refused: string): string {
  return current.trim() === "" ? refused : current;
}
