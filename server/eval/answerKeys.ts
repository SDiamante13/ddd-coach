import { createHash } from "node:crypto";
import type { Fixture, FixtureKey } from "./replyChecks.ts";

export type KeyShas = Record<string, string>;

export function keyChanges(recorded: KeyShas, current: KeyShas): string[] {
  return Object.keys(recorded).filter((fixture) => recorded[fixture] !== current[fixture]);
}

export function keyShaOf(key: FixtureKey): string {
  return createHash("sha256").update(JSON.stringify(key)).digest("hex");
}

export function fixtureShaOf({ key, glossary }: Pick<Fixture, "key" | "glossary">): string {
  if (glossary === undefined) return keyShaOf(key);
  return createHash("sha256").update(JSON.stringify({ key, glossary })).digest("hex");
}
