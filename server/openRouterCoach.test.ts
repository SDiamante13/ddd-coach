// @vitest-environment node
import type { ChatContentItems, ChatResult } from "@openrouter/sdk/models";
import type { SendChatCompletionRequestRequest } from "@openrouter/sdk/models/operations";
import { describe, expect, it } from "vitest";
import type { Prompt } from "../src/domain/exchange.ts";
import { createOpenRouterCoach } from "./openRouterCoach.ts";

const config = { apiKey: "sk-or-test-key", model: "test/model" };

function resultWith(content: string | ChatContentItems[] | null): ChatResult {
  return {
    id: "result-1",
    created: 0,
    model: "test/model",
    object: "chat.completion",
    systemFingerprint: null,
    choices: [{ index: 0, finishReason: "stop", message: { role: "assistant", content } }],
  };
}

function fakeChat(content: string | ChatContentItems[] | null) {
  const requests: SendChatCompletionRequestRequest[] = [];
  const send = async (request: SendChatCompletionRequestRequest) => {
    requests.push(request);
    return resultWith(content);
  };
  return { chat: { send }, requests };
}

describe("OpenRouter coach", () => {
  it("sends the prompt as a single non-streaming user message to the configured model", async () => {
    const { chat, requests } = fakeChat("Hi there");

    const reply = await createOpenRouterCoach(config, chat).reply("Hello coach" as Prompt);

    expect(reply).toBe("Hi there");
    expect(requests).toEqual([
      {
        chatRequest: {
          model: "test/model",
          messages: [{ role: "user", content: "Hello coach" }],
          stream: false,
        },
      },
    ]);
  });

  it("joins the text parts of structured content", async () => {
    const { chat } = fakeChat([
      { type: "text", text: "Hi " },
      { type: "image_url", imageUrl: { url: "https://example.com/x.png" } },
      { type: "text", text: "there" },
    ]);

    expect(await createOpenRouterCoach(config, chat).reply("Hello coach" as Prompt)).toBe("Hi there");
  });

  it("treats missing content as empty text", async () => {
    const { chat } = fakeChat(null);

    expect(await createOpenRouterCoach(config, chat).reply("Hello coach" as Prompt)).toBe("");
  });
});
