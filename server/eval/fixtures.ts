import { readFileSync } from "node:fs";
import { EXAMPLE_THREAD } from "../../src/shared/exampleThread.ts";
import type { Fixture, FixtureKey } from "./replyChecks.ts";

export const FIXTURE_NAMES = [
  "booking-split",
  "rebook-notes",
  "carrier-status",
  "example-thread",
  "greeting",
  "ddd-question",
  "one-line-note",
] as const;

const FIXTURES = new URL("./fixtures/", import.meta.url);
const SHARED_THREADS: Partial<Record<string, string>> = { "example-thread": EXAMPLE_THREAD };

export function loadFixture(name: string): Fixture {
  const read = (file: string) => readFileSync(new URL(file, FIXTURES), "utf8");
  const thread = SHARED_THREADS[name] ?? read(`${name}.txt`);
  return { thread, key: JSON.parse(read(`${name}.key.json`)) as FixtureKey };
}

export function firstTurnOf({ thread, key }: Fixture, nonce: string): string {
  return key.expect.nonThread ? thread.trim() : `Nonce ${nonce}.\n${thread.trim()}`;
}
