// @vitest-environment node
import { describe, expect, it } from "vitest";
import { evalSummary, type SummaryRun } from "./evalSummary.ts";
import type { SoftScores } from "./replyChecks.ts";
import { shipBar } from "./shipBar.ts";

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

const run: SummaryRun = {
  label: "greeting 1",
  fixture: "greeting",
  reply: "Hi! Paste it here.",
  hardFailures: [],
  soft: ALL_SOFT,
  ms: 2_000,
  promptTokens: 1_000,
  cachedTokens: 0,
  completionTokens: 20,
  reasoningTokens: 0,
  cost: 0.001,
  finishReason: "stop",
};

describe("evalSummary", () => {
  it("reports a single-arm run as a diagnostic, leaving the ship verdict to the A/B", () => {
    const summary = evalSummary("Eval", [run], shipBar([run]));

    expect(summary).toContain("**Every run clean: yes.**");
  });

  it("heads the fixture table with plain check names, since the tallies carry their own n", () => {
    expect(evalSummary("Eval", [run], shipBar([run]))).toContain(
      "| Fixture | Split | Code line | Question spans the thread | Same meaning named (reported only, #76) |",
    );
  });
});
