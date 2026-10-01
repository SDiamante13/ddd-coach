import type { WhoIsWhoEntry } from "../domain/whosWho.ts";
import { stringField } from "../shared/json.ts";

const KEY = "ddd-coach.whos-who.v1";

export function keepWhosWho(entries: readonly WhoIsWhoEntry[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    return;
  }
}

export function forgetWhosWho(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    return;
  }
}

export function keptWhosWho(): WhoIsWhoEntry[] {
  try {
    const kept: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(kept) && kept.every(isEntry) ? kept : [];
  } catch {
    return [];
  }
}

const isEntry = (value: unknown): value is WhoIsWhoEntry => Boolean(stringField(value, "speaker")) && Boolean(stringField(value, "team"));
