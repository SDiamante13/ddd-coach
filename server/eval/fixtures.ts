import { readFileSync } from "node:fs";
import type { Fixture, FixtureKey } from "./replyChecks.ts";

export const FIXTURE_NAMES = ["booking-split", "rebook-notes", "carrier-status"] as const;

const FIXTURES = new URL("./fixtures/", import.meta.url);

export function loadFixture(name: string): Fixture {
  const read = (file: string) => readFileSync(new URL(file, FIXTURES), "utf8");
  return { thread: read(`${name}.txt`), key: JSON.parse(read(`${name}.key.json`)) as FixtureKey };
}
