import { existsSync, readFileSync } from "node:fs";
import type { KeptGlossaryRow } from "../../src/domain/glossary.ts";
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
  "ddd-bounded-context",
  "not-covered",
  "kept-drift",
  "kept-steady",
] as const;

const FIXTURES = new URL("./fixtures/", import.meta.url);
const SHARED_THREADS: Partial<Record<string, string>> = { "example-thread": EXAMPLE_THREAD };

export function loadFixture(name: string): Fixture {
  const read = (file: string) => readFileSync(new URL(file, FIXTURES), "utf8");
  const thread = SHARED_THREADS[name] ?? read(`${name}.txt`);
  const key = JSON.parse(read(`${name}.key.json`)) as FixtureKey;
  const glossaryFile = new URL(`${name}.glossary.json`, FIXTURES);
  if (!existsSync(glossaryFile)) return { thread, key };
  return { thread, key, glossary: JSON.parse(readFileSync(glossaryFile, "utf8")) as KeptGlossaryRow[] };
}
