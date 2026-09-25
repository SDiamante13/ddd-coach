import type { ChatMessages, ChatResult } from "@openrouter/sdk/models";
import type { ChatClient } from "../openRouterCoach.ts";

export type SentMessages = ChatMessages[];

const USAGE = { promptTokens: 1_000, completionTokens: 200, totalTokens: 1_200, cost: 0.002 };

export function fakeChat(replyTo: (messages: SentMessages) => string) {
  const sent: SentMessages[] = [];
  const send = async ({ chatRequest }: Parameters<ChatClient["send"]>[0]): Promise<ChatResult> => {
    sent.push(chatRequest.messages);
    return resultOf(replyTo(chatRequest.messages));
  };
  return { chat: { send } as ChatClient, sent };
}

function resultOf(content: string): ChatResult {
  const message = { role: "assistant" as const, content };
  return {
    id: "fake",
    created: 0,
    model: "fake/model",
    object: "chat.completion",
    systemFingerprint: null,
    choices: [{ index: 0, finishReason: "stop", message }],
    usage: USAGE,
  };
}
