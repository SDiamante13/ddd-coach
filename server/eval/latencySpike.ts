import type { Prompt } from "../../src/domain/exchange.ts";
import { coachInstructions } from "../coachInstructions.ts";
import type { CoachConfig } from "../config.ts";
import { createOpenRouterCoach, type ChatClient } from "../openRouterCoach.ts";
import { verifiedConversationOf } from "../test/conversations.ts";
import type { VerifiedConversation } from "../turnSignature.ts";
import { latencyVerdict, median } from "./latency.ts";
import { recordingChat, type CallRecord } from "./recordingChat.ts";

type Overrides = Parameters<typeof recordingChat>[1];
export type Measured = CallRecord & { label: string; prompt: Prompt; reply: string };

const FOLLOW_UP = "Which of those lines are guesses?";

export async function latencySpike(config: CoachConfig, chat: ChatClient, thread: string) {
  const probes = await repeat(3, (i) => measure(config, chat, `probe ${i}`, firstTurn(thread), { maxCompletionTokens: 1 }));
  const runs = await repeat(5, (i) => measure(config, chat, `run ${i}`, firstTurn(thread)));
  const streamed = await repeat(2, (i) => measure(config, chat, `stream ${i}`, firstTurn(thread), { stream: true }));
  const followUp = await measure(config, chat, "follow-up", followUpOf(runs[0]!));
  const probeMs = median(probes.map((probe) => probe.ms));
  return { probeMs, verdict: latencyVerdict(runs.map((run) => run.ms)), calls: [...probes, ...runs, ...streamed, followUp] };
}

async function measure(
  config: CoachConfig,
  chat: ChatClient,
  label: string,
  conversation: VerifiedConversation,
  overrides?: Overrides,
): Promise<Measured> {
  const recorder = recordingChat(chat, overrides);
  const reply = await createOpenRouterCoach(config, coachInstructions(), recorder.chat).reply(conversation);
  const record = recorder.records[0]!;
  console.log(`${label}: ${record.ms} ms, ${record.completionTokens} out, cached ${record.cachedTokens}, ${record.finishReason}`);
  return { ...record, label, prompt: conversation.prompt, reply };
}

async function repeat<T>(times: number, run: (index: number) => Promise<T>): Promise<T[]> {
  const results: T[] = [];
  for (let index = 1; index <= times; index++) results.push(await run(index));
  return results;
}

function firstTurn(thread: string): VerifiedConversation {
  const nonce = `(Pasted at ${new Date().toISOString()}.)`;
  return verifiedConversationOf(`${nonce}\n${thread.trim()}`);
}

function followUpOf({ prompt, reply }: Measured): VerifiedConversation {
  return verifiedConversationOf(FOLLOW_UP, [{ prompt, reply }]);
}
