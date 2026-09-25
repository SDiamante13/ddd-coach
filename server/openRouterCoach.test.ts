// @vitest-environment node
import type { ChatContentItems, ChatFinishReasonEnum, ChatResult } from "@openrouter/sdk/models";
import type { SendChatCompletionRequestRequest } from "@openrouter/sdk/models/operations";
import type { RequestOptions } from "@openrouter/sdk/lib/sdks";
import { describe, expect, it } from "vitest";
import { CUT_SHORT_NOTE } from "../src/shared/chatContract.ts";
import { verifiedConversationOf } from "./test/conversations.ts";
import { createOpenRouterCoach } from "./openRouterCoach.ts";

const config = { apiKey: "sk-or-test-key", model: "test/model" };

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

function fakeChat(content: Content, finishReason: ChatFinishReasonEnum = "stop") {
  const requests: [SendChatCompletionRequestRequest, RequestOptions?][] = [];
  const send = async (request: SendChatCompletionRequestRequest, options?: RequestOptions) => {
    requests.push([request, options]);
    return resultWith(content, finishReason);
  };
  return { chat: { send }, requests };
}

describe("OpenRouter coach", () => {
  it("sends the instructions as a system message, then the history as alternating turns before the prompt, capped and without SDK retries", async () => {
    const { chat, requests } = fakeChat("Hi there");
    const conversation = verifiedConversationOf("C", [
      { prompt: "A", reply: "R1" },
      { prompt: "B", reply: "R2" },
    ]);

    const reply = await createOpenRouterCoach(config, "INSTRUCTIONS", chat).reply(conversation);

    expect(reply).toBe("Hi there");
    expect(requests).toEqual([
      [
        {
          chatRequest: {
            model: "test/model",
            messages: [
              { role: "system", content: "INSTRUCTIONS" },
              { role: "user", content: "A" },
              { role: "assistant", content: "R1" },
              { role: "user", content: "B" },
              { role: "assistant", content: "R2" },
              { role: "user", content: "C" },
            ],
            stream: false,
            maxCompletionTokens: 1000,
          },
        },
        { retries: { strategy: "none" } },
      ],
    ]);
  });

  it("asks for the configured reasoning effort", async () => {
    const { chat, requests } = fakeChat("Hi there");

    await createOpenRouterCoach({ ...config, reasoningEffort: "low" }, "INSTRUCTIONS", chat).reply(verifiedConversationOf("A"));

    expect(requests[0]?.[0].chatRequest.reasoning).toEqual({ effort: "low" });
  });

  it("joins the text parts of structured content", async () => {
    const { chat } = fakeChat([
      { type: "text", text: "Hi " },
      { type: "image_url", imageUrl: { url: "https://example.com/x.png" } },
      { type: "text", text: "there" },
    ]);

    expect(await createOpenRouterCoach(config, "INSTRUCTIONS", chat).reply(verifiedConversationOf("Hello coach"))).toBe("Hi there");
  });

  it("treats missing content as empty text", async () => {
    const { chat } = fakeChat(null);

    expect(await createOpenRouterCoach(config, "INSTRUCTIONS", chat).reply(verifiedConversationOf("Hello coach"))).toBe("");
  });

  it("ends a reply cut at the token cap on its last complete line, with the cut-short note", async () => {
    const { chat } = fakeChat("Events, in order\n1. From thread: Customer submits.\n2. From thr", "length");

    const reply = await createOpenRouterCoach(config, "INSTRUCTIONS", chat).reply(verifiedConversationOf("Thread"));

    expect(reply).toBe(`Events, in order\n1. From thread: Customer submits.\n\n${CUT_SHORT_NOTE}`);
  });
});
