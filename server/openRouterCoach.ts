import { OpenRouter } from "@openrouter/sdk";
import type { RequestOptions } from "@openrouter/sdk/lib/sdks";
import type { ChatAssistantMessage, ChatContentItems, ChatMessages, ProviderPreferences } from "@openrouter/sdk/models";
import type {
  SendChatCompletionRequestRequest,
  SendChatCompletionRequestResponse,
} from "@openrouter/sdk/models/operations";
import type { Conversation, Turn } from "../src/domain/conversation.ts";
import { glossaryContext } from "./glossaryContext.ts";
import { coachProvider } from "../src/shared/coachProvider.ts";
import { field, stringField } from "../src/shared/json.ts";
import { CoachOutOfCredit, type Coach } from "./coach.ts";
import type { CoachConfig } from "./config.ts";
import { endOnCompleteLine } from "./replyEnding.ts";

export type ChatClient = {
  send(
    request: SendChatCompletionRequestRequest,
    options?: RequestOptions,
  ): Promise<SendChatCompletionRequestResponse>;
};

const MAX_COMPLETION_TOKENS = 1_000;
const WITHOUT_RETRIES: RequestOptions = { retries: { strategy: "none" } };
const PINNED_ROUTING: ProviderPreferences = { order: [coachProvider.slug], allowFallbacks: false, dataCollection: "deny" };

export function createOpenRouterCoach(
  config: CoachConfig,
  instructions: string,
  chat: ChatClient = new OpenRouter({ apiKey: config.apiKey }).chat,
): Coach {
  return {
    reply: async (conversation: Conversation) =>
      replyText(await chat.send(chatRequest(config, instructions, conversation), WITHOUT_RETRIES).catch(asCoachError)),
  };
}

const PAYMENT_REQUIRED = 402;
const SPENT_BUDGET_SOURCES: readonly (string | undefined)[] = ["openrouter_key_limit", "openrouter_credits"];

function asCoachError(error: unknown): never {
  if (isBudgetSpent(error)) throw new CoachOutOfCredit();
  throw error;
}

function isBudgetSpent(error: unknown): boolean {
  return isPaymentRequired(error) && SPENT_BUDGET_SOURCES.includes(limitSourceOf(error));
}

function limitSourceOf(error: unknown): string | undefined {
  const body = parsedOrNull(stringField(error, "body"));
  return stringField(field(field(body, "error"), "metadata"), "limit_source");
}

function parsedOrNull(text: string | undefined): unknown {
  try {
    return text === undefined ? null : JSON.parse(text);
  } catch {
    return null;
  }
}

function isPaymentRequired(error: unknown): boolean {
  return typeof error === "object" && error !== null && "statusCode" in error && error.statusCode === PAYMENT_REQUIRED;
}

function chatRequest(
  { model, reasoningEffort }: CoachConfig,
  instructions: string,
  conversation: Conversation,
): SendChatCompletionRequestRequest {
  return {
    chatRequest: {
      model,
      messages: [{ role: "system", content: instructions }, ...messagesOf(conversation)],
      stream: false,
      maxCompletionTokens: MAX_COMPLETION_TOKENS,
      provider: PINNED_ROUTING,
      ...(reasoningEffort && { reasoning: { effort: reasoningEffort } }),
    },
  };
}

function messagesOf({ history, prompt, glossary }: Conversation): ChatMessages[] {
  const kept: ChatMessages[] = glossary.length === 0 ? [] : [{ role: "user", content: glossaryContext(glossary) }];
  return [...kept, ...history.flatMap(messagesOfTurn), { role: "user", content: prompt }];
}

function messagesOfTurn({ prompt, reply }: Turn): ChatMessages[] {
  return [
    { role: "user", content: prompt },
    { role: "assistant", content: reply },
  ];
}

function replyText(response: SendChatCompletionRequestResponse): string {
  const choice = "choices" in response ? response.choices[0] : undefined;
  const text = extractText(choice?.message.content);
  return choice?.finishReason === "length" ? endOnCompleteLine(text) : text;
}

function extractText(content: ChatAssistantMessage["content"] | undefined): string {
  if (typeof content === "string") return content;
  return (content ?? []).map(textOf).join("");
}

function textOf(item: ChatContentItems): string {
  return item.type === "text" && "text" in item ? item.text : "";
}
