// @vitest-environment node
import type { ChatContentItems, ChatFinishReasonEnum, ChatResult } from "@openrouter/sdk/models";
import type { SendChatCompletionRequestRequest } from "@openrouter/sdk/models/operations";
import type { RequestOptions } from "@openrouter/sdk/lib/sdks";
import {
  BadGatewayResponseError,
  OpenRouterDefaultError,
  PaymentRequiredResponseError,
  UnauthorizedResponseError,
} from "@openrouter/sdk/models/errors";
import { describe, expect, it } from "vitest";
import { CUT_SHORT_NOTE } from "../src/shared/chatContract.ts";
import { CoachBusy, CoachKeyRejected, CoachOutOfCredit } from "./coach.ts";
import { verifiedConversationOf } from "./test/conversations.ts";
import type { CoachConfig } from "./config.ts";
import { glossaryContext } from "./glossaryContext.ts";
import { createOpenRouterCoach, type ChatClient } from "./openRouterCoach.ts";

const config = { apiKey: "sk-or-test-key", model: "test/model" };
const INSTRUCTIONS = "INSTRUCTIONS";

function coachOn(chat: ChatClient, coachConfig: CoachConfig = config) {
  return createOpenRouterCoach(coachConfig, INSTRUCTIONS, chat);
}

type Content = string | ChatContentItems[] | null;

function resultWith(content: Content, finishReason: ChatFinishReasonEnum): ChatResult {
  return {
    id: "result-1",
    created: 0,
    model: "test/model",
    object: "chat.completion",
    systemFingerprint: null,
    choices: [{ index: 0, finishReason, message: { role: "assistant", content } }],
  };
}

const PROVIDER_TEXT = "Insufficient credits for key sk-or-test-key";

type ErrorBody = { code: number; message: string; metadata?: Record<string, string> };

function httpMetaOf(error: ErrorBody, headers: Record<string, string> = {}) {
  return rawHttpMetaOf(error.code, JSON.stringify({ error }), headers);
}

function rawHttpMetaOf(status: number, body: string, headers: Record<string, string> = {}) {
  const response = new Response(body, { status, headers });
  return { response, request: new Request("https://openrouter.ai/api/v1/chat"), body };
}

function paymentRequiredBody(limitSource: string): ErrorBody {
  return { code: 402, message: PROVIDER_TEXT, metadata: { limit_source: limitSource, remedy_hint: PROVIDER_TEXT } };
}

function paymentRequired(error: ErrorBody, headers: Record<string, string> = {}): PaymentRequiredResponseError {
  return new PaymentRequiredResponseError({ error }, httpMetaOf(error, headers));
}

function failingChat(error: Error): ChatClient {
  return { send: () => Promise.reject(error) };
}

function fakeChat(content: Content, finishReason: ChatFinishReasonEnum = "stop") {
  const requests: [SendChatCompletionRequestRequest, RequestOptions?][] = [];
  const send = async (request: SendChatCompletionRequestRequest, options?: RequestOptions) => {
    requests.push([request, options]);
    return resultWith(content, finishReason);
  };
  return { chat: { send }, requests };
}

describe("OpenRouter coach", () => {
  it("puts a kept glossary in its own user message right after the unchanged system message (#100)", async () => {
    const { chat, requests } = fakeChat("Hi there");
    const row = { word: "late", holder: "Ops", meaning: "Late.", source: "From thread" as const, keptOn: "2026-09-25", from: "load 7731" };

    await coachOn(chat).reply(verifiedConversationOf("C", [{ prompt: "A", reply: "R1" }], [row]));

    expect(requests[0]![0].chatRequest.messages).toEqual([
      { role: "system", content: INSTRUCTIONS },
      { role: "user", content: glossaryContext([row]) },
      { role: "user", content: "A" },
      { role: "assistant", content: "R1" },
      { role: "user", content: "C" },
    ]);
  });

  it("sends the instructions as a system message, then the history as alternating turns before the prompt, capped and without SDK retries", async () => {
    const { chat, requests } = fakeChat("Hi there");
    const conversation = verifiedConversationOf("C", [
      { prompt: "A", reply: "R1" },
      { prompt: "B", reply: "R2" },
    ]);

    const reply = await coachOn(chat).reply(conversation);

    expect(reply).toBe("Hi there");
    expect(requests).toEqual([
      [
        {
          chatRequest: {
            model: "test/model",
            messages: [
              { role: "system", content: INSTRUCTIONS },
              { role: "user", content: "A" },
              { role: "assistant", content: "R1" },
              { role: "user", content: "B" },
              { role: "assistant", content: "R2" },
              { role: "user", content: "C" },
            ],
            stream: false,
            maxCompletionTokens: 1000,
            provider: { order: ["openai"], allowFallbacks: false, dataCollection: "deny" },
          },
        },
        { retries: { strategy: "none" } },
      ],
    ]);
  });

  it("pins routing to OpenAI with no fallback and no data collection, so the data notice stays true (#110)", async () => {
    const { chat, requests } = fakeChat("Hi there");

    await coachOn(chat).reply(verifiedConversationOf("A"));

    expect(requests[0]?.[0].chatRequest.provider).toEqual({ order: ["openai"], allowFallbacks: false, dataCollection: "deny" });
  });

  it("asks for the configured reasoning effort", async () => {
    const { chat, requests } = fakeChat("Hi there");

    await coachOn(chat, { ...config, reasoningEffort: "low" }).reply(verifiedConversationOf("A"));

    expect(requests[0]?.[0].chatRequest.reasoning).toEqual({ effort: "low" });
  });

  it("joins the text parts of structured content", async () => {
    const { chat } = fakeChat([
      { type: "text", text: "Hi " },
      { type: "image_url", imageUrl: { url: "https://example.com/x.png" } },
      { type: "text", text: "there" },
    ]);

    expect(await coachOn(chat).reply(verifiedConversationOf("Hello coach"))).toBe("Hi there");
  });

  it("treats missing content as empty text", async () => {
    const { chat } = fakeChat(null);

    expect(await coachOn(chat).reply(verifiedConversationOf("Hello coach"))).toBe("");
  });

  it("ends a reply cut at the token cap on its last complete line, with the cut-short note", async () => {
    const { chat } = fakeChat("Events, in order\n1. From thread: Customer submits.\n2. From thr", "length");

    const reply = await coachOn(chat).reply(verifiedConversationOf("Thread"));

    expect(reply).toBe(`Events, in order\n1. From thread: Customer submits.\n\n${CUT_SHORT_NOTE}`);
  });

  it.each([
    ["a typed payment-required error", paymentRequired(paymentRequiredBody("openrouter_key_limit"))],
    ["an untyped 402", new OpenRouterDefaultError(PROVIDER_TEXT, httpMetaOf(paymentRequiredBody("openrouter_key_limit")))],
    ["a balance that cannot cover the request", paymentRequired(paymentRequiredBody("openrouter_credits"))],
  ])("reports a spent usage budget, without the provider's text, for %s", async (_case, error) => {
    const failure = await coachOn(failingChat(error)).reply(verifiedConversationOf("Hello coach")).catch((e: unknown) => e);

    expect(failure).toBeInstanceOf(CoachOutOfCredit);
    expect(String((failure as Error).message)).not.toContain(PROVIDER_TEXT);
  });

  it.each([
    ["a briefly exhausted in-flight budget", paymentRequired(paymentRequiredBody("openrouter_in_flight_budget"))],
    [
      "an in-flight budget whose Retry-After is a date",
      paymentRequired(paymentRequiredBody("openrouter_in_flight_budget"), { "Retry-After": "Wed, 21 Oct 2026 07:28:00 GMT" }),
    ],
    ["an unknown limit source", paymentRequired(paymentRequiredBody("openrouter_new_limit"))],
    ["no limit source", paymentRequired({ code: 402, message: PROVIDER_TEXT })],
    ["a body that is not JSON", new OpenRouterDefaultError(PROVIDER_TEXT, rawHttpMetaOf(402, "<html>Payment Required</html>"))],
  ])("passes a 402 for %s through as a failure worth retrying", async (_case, error) => {
    await expect(coachOn(failingChat(error)).reply(verifiedConversationOf("Hello coach"))).rejects.toBe(error);
  });

  it("reports a briefly exhausted in-flight budget as busy for the provider's Retry-After seconds (#74)", async () => {
    const error = paymentRequired(paymentRequiredBody("openrouter_in_flight_budget"), { "Retry-After": "20" });

    const failure = await coachOn(failingChat(error)).reply(verifiedConversationOf("Hello coach")).catch((e: unknown) => e);

    expect(failure).toBeInstanceOf(CoachBusy);
    expect((failure as CoachBusy).retryAfterSeconds).toBe(20);
  });

  it("names an expired or invalid provider key as its own failure, without the provider's text (#74, #103)", async () => {
    const error = { code: 401, message: PROVIDER_TEXT };
    const unauthorized = new UnauthorizedResponseError({ error }, httpMetaOf(error));

    const failure = await coachOn(failingChat(unauthorized)).reply(verifiedConversationOf("Hello coach")).catch((e: unknown) => e);

    expect(failure).toBeInstanceOf(CoachKeyRejected);
    expect(failure).toMatchObject({ name: "CoachKeyRejected", statusCode: 401 });
    expect(String((failure as Error).message)).not.toContain(PROVIDER_TEXT);
  });

  it("passes any other provider failure through unchanged", async () => {
    const error = { code: 502, message: PROVIDER_TEXT };
    const badGateway = new BadGatewayResponseError({ error }, httpMetaOf(error));

    await expect(coachOn(failingChat(badGateway)).reply(verifiedConversationOf("Hello coach"))).rejects.toBe(badGateway);
  });
});
