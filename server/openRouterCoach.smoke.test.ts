// @vitest-environment node
import { describe, expect, it } from "vitest";
import { verifiedConversationOf } from "./test/conversations.ts";
import { coachInstructions } from "./coachInstructions.ts";
import { readConfig } from "./config.ts";
import { createOpenRouterCoach } from "./openRouterCoach.ts";

const config = readConfig(process.env);

describe.runIf(config.ok)("OpenRouter coach against the real provider", () => {
  it("returns a non-empty reply", async () => {
    if (!config.ok) throw new Error(config.error);

    const reply = await createOpenRouterCoach(config.config, coachInstructions()).reply(verifiedConversationOf("Reply with one word."));

    expect(reply.trim()).not.toBe("");
  }, 30_000);

  it("uses a detail from an earlier turn", async () => {
    if (!config.ok) throw new Error(config.error);
    const conversation = verifiedConversationOf("What was the code word? Answer in one word.", [
      { prompt: "Remember the code word: PELICAN. Reply only OK.", reply: "OK" },
    ]);

    const reply = await createOpenRouterCoach(config.config, coachInstructions()).reply(conversation);

    expect(reply.toUpperCase()).toContain("PELICAN");
  }, 30_000);
});
