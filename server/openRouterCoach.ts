import { OpenRouter } from "@openrouter/sdk";
import type { ChatContentItems } from "@openrouter/sdk/models";
import type {
  SendChatCompletionRequestRequest,
  SendChatCompletionRequestResponse,
} from "@openrouter/sdk/models/operations";
import type { Prompt } from "../src/domain/exchange.ts";
import type { Coach } from "./chatHandler.ts";
import type { CoachConfig } from "./config.ts";

export type ChatClient = {
  send(request: SendChatCompletionRequestRequest): Promise<SendChatCompletionRequestResponse>;
};

export function createOpenRouterCoach(
  config: CoachConfig,
  chat: ChatClient = new OpenRouter({ apiKey: config.apiKey }).chat,
): Coach {
  return {
    reply: async (prompt: Prompt) => extractText(await chat.send(userMessage(config.model, prompt))),
  };
}

function userMessage(model: string, prompt: Prompt): SendChatCompletionRequestRequest {
  return { chatRequest: { model, messages: [{ role: "user", content: prompt }], stream: false } };
}

export function extractText(response: SendChatCompletionRequestResponse): string {
  const content = "choices" in response ? response.choices[0]?.message.content : undefined;
  if (typeof content === "string") return content;
  return (content ?? []).map(textOf).join("");
}

function textOf(item: ChatContentItems): string {
  return item.type === "text" && "text" in item ? item.text : "";
}
