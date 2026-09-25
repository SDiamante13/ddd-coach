import type { Prompt } from "../../src/domain/exchange.ts";
import { coachInstructions } from "../coachInstructions.ts";
import type { CoachConfig } from "../config.ts";
import { createOpenRouterCoach, type ChatClient } from "../openRouterCoach.ts";
import type { VerifiedConversation } from "../turnSignature.ts";
import { recordingChat, type CallRecord } from "./recordingChat.ts";

type Overrides = Parameters<typeof recordingChat>[1];
export type Measured = CallRecord & { label: string; prompt: Prompt; reply: string };

export async function measure(
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

export async function repeat<T>(times: number, run: (index: number) => Promise<T>): Promise<T[]> {
  const results: T[] = [];
  for (let index = 1; index <= times; index++) results.push(await run(index));
  return results;
}
