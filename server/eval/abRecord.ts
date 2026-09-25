import { createHash } from "node:crypto";
import type { CoachConfig } from "../config.ts";
import type { AbPlan, AbResult, AbRun, ArmPrompt } from "./abEval.ts";
import type { AbReport } from "./abSummary.ts";
import { abVerdict } from "./abVerdict.ts";
import { keyShaOf, type KeyShas } from "./answerKeys.ts";
import { loadFixture } from "./fixtures.ts";
import { recordable } from "./recordable.ts";

export type RecordedCall = Omit<AbRun, "prompt"> & { promptChars: number; promptSha256: string };
export type AbRecord = {
  kind: "ab";
  model: string;
  reasoningEffort: string;
  runs: number;
  target: string[] | null;
  aborted: string | null;
  verdict: ReturnType<typeof abVerdict>;
  arms: Record<"live" | "candidate", { version: number; instructionsSha256: string }>;
  keys: KeyShas;
  calls: RecordedCall[];
};

const sha256 = (text: string): string => createHash("sha256").update(text).digest("hex");

const armOf = ({ version, instructions }: ArmPrompt) => ({ version, instructionsSha256: sha256(instructions) });

export function abRecordOf({ model, reasoningEffort }: CoachConfig, plan: AbPlan & { target: string[] | null }, result: AbResult): AbRecord {
  return {
    kind: "ab",
    model,
    reasoningEffort: reasoningEffort ?? "unset",
    runs: plan.runs,
    target: plan.target,
    aborted: result.aborted,
    verdict: result.aborted === null ? abVerdict(result.runs, plan.target) : null,
    arms: { live: armOf(plan.live), candidate: armOf(plan.candidate) },
    keys: currentKeys(plan.fixtures),
    calls: result.runs.map(recordable),
  };
}

export function currentKeys(fixtures: readonly string[]): KeyShas {
  return Object.fromEntries(fixtures.map((name) => [name, keyShaOf(loadFixture(name).key)]));
}

export function reportOf(record: AbRecord): AbReport {
  const { model, reasoningEffort, runs: n, target, aborted, arms, calls } = record;
  return { model, reasoningEffort, liveVersion: arms.live.version, candidateVersion: arms.candidate.version, n, target, aborted, runs: calls };
}
