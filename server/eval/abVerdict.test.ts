// @vitest-environment node
import { describe, expect, it } from "vitest";
import { abVerdict, type Arm, type ArmRun } from "./abVerdict.ts";
import type { SoftScores } from "./replyChecks.ts";

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

const NON_THREAD = ["greeting", "ddd-question", "one-line-note"];

type Miss = { hardFailures?: string[]; soft?: Partial<SoftScores> };

function runsOf(arm: Arm, fixture: string, n: number, miss: Miss = {}, missing = 0): ArmRun[] {
  return Array.from({ length: n }, (_, index) => {
    const missed = index < missing;
    const hardFailures = missed ? (miss.hardFailures ?? []) : [];
    return { arm, fixture, hardFailures, soft: { ...ALL_SOFT, ...(missed ? miss.soft : {}) } };
  });
}

const boilerplate = { hardFailures: ["no boilerplate"] };
const nonThreadRuns = NON_THREAD.flatMap((fixture) => [...runsOf("live", fixture, 6, boilerplate, 6), ...runsOf("candidate", fixture, 6)]);

describe("abVerdict", () => {
  it("ships when the target goes from 0/18 to 18/18 and nothing drops", () => {
    expect(abVerdict(nonThreadRuns, NON_THREAD)?.ships).toBe(true);
  });

  it("does not ship when the target gains only one run", () => {
    const runs = [...runsOf("live", "greeting", 6, boilerplate, 2), ...runsOf("candidate", "greeting", 6, boilerplate, 1)];

    expect(abVerdict(runs, ["greeting"])?.ships).toBe(false);
  });

  it("does not ship when one gating check drops by two runs in one fixture", () => {
    const threads = [...runsOf("live", "booking-split", 6), ...runsOf("candidate", "booking-split", 6, { soft: { split: false } }, 2)];

    expect(abVerdict([...nonThreadRuns, ...threads], NON_THREAD)?.ships).toBe(false);
  });

  it("ships when one gating check drops by exactly one run, within noise", () => {
    const threads = [...runsOf("live", "booking-split", 6), ...runsOf("candidate", "booking-split", 6, { soft: { split: false } }, 1)];

    expect(abVerdict([...nonThreadRuns, ...threads], NON_THREAD)?.ships).toBe(true);
  });

  it.each([
    ["same meaning not split", { hardFailures: ["same meaning not split"] }],
    ["no merged split", { hardFailures: ["no merged split"] }],
    ["sourced or general practice, until v15 targets it (#99)", { hardFailures: ["sourced or general practice"] }],
    ["sameMeaningNamed", { soft: { sameMeaningNamed: false } }],
    ["jointRoles", { soft: { jointRoles: false } }],
  ])("ships when only the reported-only %s drops", (_check, miss) => {
    const threads = [...runsOf("live", "booking-split", 6), ...runsOf("candidate", "booking-split", 6, miss, 6)];

    expect(abVerdict([...nonThreadRuns, ...threads], NON_THREAD)?.ships).toBe(true);
  });

  it("tallies a fixture:check target on that check alone", () => {
    const runs = [
      ...runsOf("live", "booking-split", 2, { hardFailures: ["split labels", "holders"] }, 2),
      ...runsOf("live", "booking-split", 4, { hardFailures: ["holders"] }, 4),
      ...runsOf("candidate", "booking-split", 6, { hardFailures: ["holders"] }, 6),
    ];

    expect(abVerdict(runs, ["booking-split:split labels"])?.target).toEqual({
      live: { passed: 4, total: 6 },
      candidate: { passed: 6, total: 6 },
      gain: 2,
    });
  });

  it("refuses arms with a different number of runs for a fixture", () => {
    const runs = [...runsOf("live", "greeting", 6), ...runsOf("candidate", "greeting", 5)];

    expect(() => abVerdict(runs, ["greeting"])).toThrow("greeting has 6 live runs but 5 candidate runs");
  });

  it("gives no verdict without a target", () => {
    expect(abVerdict(nonThreadRuns, null)).toBeNull();
  });
});
