// @vitest-environment node
import { describe, expect, it } from "vitest";
import type { SoftScores } from "./replyChecks.ts";
import { shipBar, type ScoredRun } from "./shipBar.ts";

const ALL_SOFT: SoftScores = {
  attribution: true,
  split: true,
  codeLine: true,
  noStaleMeaning: true,
  quotedWordsInThread: true,
  under400Words: true,
  questionSpansThread: true,
  jointRoles: true,
  forum: true,
  sameMeaningNamed: true,
};

function run(fixture: string, overrides: Partial<ScoredRun> = {}): ScoredRun {
  return { fixture, hardFailures: [], soft: ALL_SOFT, ...overrides };
}

function twoOf(fixture: string, soft: Partial<SoftScores>): ScoredRun[] {
  return [run(fixture, { soft: { ...ALL_SOFT, ...soft } }), run(fixture, { soft: { ...ALL_SOFT, ...soft } })];
}

const passingRuns = ["booking-split", "rebook-notes", "carrier-status"].flatMap((fixture) => [
  run(fixture),
  run(fixture),
  run(fixture),
]);

describe("shipBar", () => {
  it("ships when every hard check and every attribution passes", () => {
    expect(shipBar(passingRuns).ships).toBe(true);
  });


  it.each([
    ["the synonym check fails", run("booking-split", { hardFailures: ["same meaning not split"] })],
    ["no line names both same-meaning words", run("booking-split", { soft: { ...ALL_SOFT, sameMeaningNamed: false } })],
  ])("still ships when only a reported-only synonym result misses (#76): %s", (_case, changed) => {
    expect(shipBar([...passingRuns.slice(1), changed]).ships).toBe(true);
  });

  it.each([
    ["one hard check fails in one run", [run("carrier-status", { hardFailures: ["no names"] })]],
    ["a fixture shows the split in only 2 of 3 runs", [run("booking-split", { soft: { ...ALL_SOFT, split: false } })]],
    ["one run misattributes", [run("carrier-status", { soft: { ...ALL_SOFT, attribution: false } })]],
    ["a fixture shows the split in only 1 of 3 runs", twoOf("booking-split", { split: false })],
    ["a fixture has a Code line in only 1 of 3 runs", twoOf("booking-split", { codeLine: false })],
    ["a question spans the thread in only 1 of 3 runs", twoOf("booking-split", { questionSpansThread: false })],
  ])("does not ship when %s", (_case, changed) => {
    expect(shipBar([...passingRuns.slice(changed.length), ...changed]).ships).toBe(false);
  });
});
