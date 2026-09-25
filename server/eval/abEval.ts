import type { CoachConfig } from "../config.ts";
import type { ChatClient } from "../openRouterCoach.ts";
import { verifiedConversationOf } from "../test/conversations.ts";
import type { EvalRun } from "./fullEval.ts";
import { loadFixture } from "./fixtures.ts";
import { measure } from "./measure.ts";
import { scoreReply, type Fixture } from "./replyChecks.ts";

export type Arm = "live" | "candidate";
export type ArmPrompt = { version: number; instructions: string };
export type AbPlan = { live: ArmPrompt; candidate: ArmPrompt; runs: number; fixtures: readonly string[] };
export type AbRun = EvalRun & { arm: Arm; version: number; i: number };

type ArmOf = ArmPrompt & { arm: Arm };
type PlannedCall = { arm: ArmOf; name: string; fixture: Fixture; i: number };

export type AbResult = { runs: AbRun[]; aborted: string | null };

export async function abEval(config: CoachConfig, chat: ChatClient, plan: AbPlan): Promise<AbResult> {
  const runs: AbRun[] = [];
  try {
    for (const call of plannedCalls(plan)) runs.push(await retriedOnce(() => scoredCall(config, chat, call)));
  } catch (error) {
    return { runs, aborted: failureOf(error) };
  }
  return { runs, aborted: null };
}

export function failureOf(error: unknown): string {
  const { name, statusCode } = error as { name?: string; statusCode?: number };
  return `${name ?? "Error"} ${statusCode ?? ""}`.trim();
}

function plannedCalls({ live, candidate, runs, fixtures }: AbPlan): PlannedCall[] {
  const arms: Record<Arm, ArmOf> = { live: { ...live, arm: "live" }, candidate: { ...candidate, arm: "candidate" } };
  return fixtures.flatMap((name) => {
    const fixture = loadFixture(name);
    return runNumbers(runs).flatMap((i) => pairedOrder(i, arms.live, arms.candidate).map((arm) => ({ arm, name, fixture, i })));
  });
}

const retriedOnce = <T>(attempt: () => Promise<T>): Promise<T> => attempt().catch(attempt);

const runNumbers = (runs: number): number[] => Array.from({ length: runs }, (_, index) => index + 1);

function pairedOrder<T>(i: number, live: T, candidate: T): T[] {
  return i % 2 === 1 ? [live, candidate] : [candidate, live];
}

async function scoredCall(config: CoachConfig, chat: ChatClient, { arm, name, fixture, i }: PlannedCall): Promise<AbRun> {
  const asPasted = verifiedConversationOf(fixture.thread.trim());
  const label = `${arm.arm} v${arm.version} ${name} ${i}`;
  const measured = await measure(config, chat, label, asPasted, {}, arm.instructions);
  return { ...measured, arm: arm.arm, version: arm.version, fixture: name, i, ...scoreReply(measured.reply, measured.finishReason, fixture) };
}
