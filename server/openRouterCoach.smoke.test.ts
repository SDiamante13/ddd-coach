// @vitest-environment node
import { describe, expect, it } from "vitest";
import type { Conversation } from "../src/domain/conversation.ts";
import type { Prompt } from "../src/domain/exchange.ts";
import { readConfig } from "./config.ts";
import { createOpenRouterCoach } from "./openRouterCoach.ts";

const config = readConfig(process.env);

function conversationOf(prompt: string): Conversation {
  return { history: [], prompt: prompt as Prompt };
}

describe.runIf(config.ok)("OpenRouter coach against the real provider", () => {
  it("returns a non-empty reply", async () => {
    if (!config.ok) throw new Error(config.error);

    const reply = await createOpenRouterCoach(config.config).reply(conversationOf("Reply with one word."));

    expect(reply.trim()).not.toBe("");
  }, 30_000);
});
