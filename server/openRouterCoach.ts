import { OpenRouter } from "@openrouter/sdk";
import type { RequestOptions } from "@openrouter/sdk/lib/sdks";
import type { ChatContentItems, ChatMessages } from "@openrouter/sdk/models";
import type {
  SendChatCompletionRequestRequest,
  SendChatCompletionRequestResponse,
} from "@openrouter/sdk/models/operations";
import type { Conversation, Turn } from "../src/domain/conversation.ts";
import type { Coach } from "./coach.ts";
import type { CoachConfig } from "./config.ts";

export type ChatClient = {
  send(
    request: SendChatCompletionRequestRequest,
    options?: RequestOptions,
  ): Promise<SendChatCompletionRequestResponse>;
};

const MAX_COMPLETION_TOKENS = 600;
const WITHOUT_RETRIES: RequestOptions = { retries: { strategy: "none" } };

export function createOpenRouterCoach(
  config: CoachConfig,
  chat: ChatClient = new OpenRouter({ apiKey: config.apiKey }).chat,
): Coach {
  return {
    reply: async (conversation: Conversation) =>
      extractText(await chat.send(chatRequest(config.model, conversation), WITHOUT_RETRIES)),
  };
}

function chatRequest(model: string, conversation: Conversation): SendChatCompletionRequestRequest {
  return {
    chatRequest: {
      model,
      messages: messagesOf(conversation),
      stream: false,
      maxCompletionTokens: MAX_COMPLETION_TOKENS,
    },
  };
}

function messagesOf({ history, prompt }: Conversation): ChatMessages[] {
  return [...history.flatMap(messagesOfTurn), { role: "user", content: prompt }];
}

function messagesOfTurn({ prompt, reply }: Turn): ChatMessages[] {
  return [
    { role: "user", content: prompt },
    { role: "assistant", content: reply },
  ];
}

function extractText(response: SendChatCompletionRequestResponse): string {
  const content = "choices" in response ? response.choices[0]?.message.content : undefined;
  if (typeof content === "string") return content;
  return (content ?? []).map(textOf).join("");
}

function textOf(item: ChatContentItems): string {
  return item.type === "text" && "text" in item ? item.text : "";
}
