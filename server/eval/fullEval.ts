import { systemPrompt } from "../systemPrompt.ts";
import type { CoachConfig } from "../config.ts";
import type { ChatClient } from "../openRouterCoach.ts";
import { verifiedConversationOf } from "../test/conversations.ts";
import { FIXTURE_NAMES, loadFixture } from "./fixtures.ts";
import { measure, repeat, type Measured } from "./measure.ts";
import { scoreReply, type Fixture } from "./replyChecks.ts";
import { shipBar, type ScoredRun } from "./shipBar.ts";

export type EvalRun = Measured & ScoredRun;

export async function fullEval(config: CoachConfig, chat: ChatClient, repeats: number, instructions = systemPrompt()) {
  const runs: EvalRun[] = [];
  for (const name of FIXTURE_NAMES) {
    const fixture = loadFixture(name);
    runs.push(...(await repeat(repeats, (i) => scoredRun(config, chat, { name, fixture, instructions }, i))));
  }
  return { runs, bar: shipBar(runs) };
}

type EvalCase = { name: string; fixture: Fixture; instructions: string };

async function scoredRun(config: CoachConfig, chat: ChatClient, { name, fixture, instructions }: EvalCase, index: number): Promise<EvalRun> {
  const asPasted = verifiedConversationOf(fixture.thread.trim(), [], fixture.glossary ?? []);
  const measured = await measure(config, chat, `${name} ${index}`, asPasted, {}, instructions);
  return { ...measured, fixture: name, ...scoreReply(measured.reply, measured.finishReason, fixture) };
}
