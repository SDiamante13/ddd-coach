import { createHash } from "node:crypto";
import type { FixtureKey } from "./replyChecks.ts";

export type KeyShas = Record<string, string>;

export function keyChanges(recorded: KeyShas, current: KeyShas): string[] {
  return Object.keys(recorded).filter((fixture) => recorded[fixture] !== current[fixture]);
}

export function keyShaOf(key: FixtureKey): string {
  return createHash("sha256").update(JSON.stringify(key)).digest("hex");
}
