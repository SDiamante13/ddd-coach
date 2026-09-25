// @vitest-environment node
import { describe, expect, it } from "vitest";
import { abSummary, type AbReport, type SummaryArmRun } from "./abSummary.ts";
import type { Arm } from "./abVerdict.ts";
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

type Miss = { hardFailures?: string[]; soft?: Partial<SoftScores> };

function runsOf(arm: Arm, fixture: string, missing = 0, miss: Miss = {}): SummaryArmRun[] {
  return Array.from({ length: 6 }, (_, index) => {
    const missed = index < missing;
    const soft = { ...ALL_SOFT, ...(missed ? miss.soft : {}) };
    return { arm, fixture, hardFailures: missed ? (miss.hardFailures ?? []) : [], soft, ms: 1_000 * (index + 1), cost: 0.01 };
  });
}

const boilerplate = { hardFailures: ["no boilerplate"] };
const shipping = [...runsOf("live", "greeting", 6, boilerplate), ...runsOf("candidate", "greeting")];
const regressed = [...shipping, ...runsOf("live", "booking-split"), ...runsOf("candidate", "booking-split", 2, { soft: { split: false } })];

function reportOf(runs: SummaryArmRun[], overrides: Partial<AbReport> = {}): AbReport {
  return { model: "openai/gpt-5.6-terra", reasoningEffort: "none", liveVersion: 6, candidateVersion: 8, n: 6, target: ["greeting"], aborted: null, runs, ...overrides };
}

describe("abSummary", () => {
  it("heads the summary with the run and a ship verdict with the target's gain", () => {
    expect(abSummary(reportOf(shipping)).split("\n").slice(0, 3)).toEqual([
      "# A/B: candidate v8 against live v6, openai/gpt-5.6-terra, effort none, n=6 per arm",
      "",
      "**Ship: yes.** Target (greeting) live 0/6 → candidate 6/6 (+6, needs +2); no gating check dropped by more than one run.",
    ]);
  });

  it("names every gating check that dropped by two or more runs when it doesn't ship", () => {
    expect(abSummary(reportOf(regressed)).split("\n")[2]).toBe(
      "**Ship: no.** Target (greeting) live 0/6 → candidate 6/6 (+6, needs +2); dropped by two or more runs: booking-split split 6/6 → 4/6.",
    );
  });

  it("tables every gating check either arm missed as x/n with its change, and sums the drops", () => {
    expect(abSummary(reportOf(regressed))).toContain(
      [
        "| Fixture | Check | Live | Candidate | Δ | Flag |",
        "|---|---|---|---|---|---|",
        "| greeting | no boilerplate | 0/6 | 6/6 | +6 |  |",
        "| booking-split | split | 6/6 | 4/6 | -2 | dropped 2+ |",
        "",
        "All other gating checks 6/6 in both arms. Total drop across fixtures: 2 runs.",
      ].join("\n"),
    );
  });

  it("shows the reported-only checks either arm missed in their own table", () => {
    const synonymRuns = [
      ...shipping,
      ...runsOf("live", "booking-split", 1, { hardFailures: ["same meaning not split"] }),
      ...runsOf("candidate", "booking-split", 3, { soft: { sameMeaningNamed: false } }),
    ];

    expect(abSummary(reportOf(synonymRuns))).toContain(
      [
        "Reported only, never gates:",
        "",
        "| Fixture | Check | Live | Candidate | Δ | Flag |",
        "|---|---|---|---|---|---|",
        "| booking-split | same meaning not split | 5/6 | 6/6 | +1 | (reported only) |",
        "| booking-split | sameMeaningNamed | 6/6 | 3/6 | -3 | (reported only) |",
      ].join("\n"),
    );
  });

  it("ends with the budget: cost per arm, total, calls and latency", () => {
    expect(abSummary(reportOf(shipping))).toContain(
      "Budget: live $0.0600, candidate $0.0600, total $0.1200 over 12 calls; median 3500 ms, max 6000 ms.",
    );
  });

  it("says no calls finished instead of a budget when a run aborts on its first call", () => {
    expect(abSummary(reportOf([], { aborted: "UnauthorizedResponseError 401" }))).toContain("Budget: no calls finished.");
  });

  it("gives no verdict without a target", () => {
    expect(abSummary(reportOf(shipping, { target: null })).split("\n")[2]).toBe(
      "**No verdict:** name the targeted failure with `--target`.",
    );
  });

  it("gives no verdict for a run that aborted, whatever its finished runs show", () => {
    expect(abSummary(reportOf(shipping, { aborted: "BadGatewayResponseError 502" })).split("\n")[2]).toBe(
      "**No verdict:** the run aborted (BadGatewayResponseError 502); missing runs are not scored.",
    );
  });
});
