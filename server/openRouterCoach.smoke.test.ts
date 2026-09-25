// @vitest-environment node
import { describe, expect, it } from "vitest";
import { verifiedConversationOf } from "./test/conversations.ts";
import { coachInstructions } from "./coachInstructions.ts";
import { readConfig } from "./config.ts";
import { loadFixture } from "./eval/fixtures.ts";
import { createOpenRouterCoach } from "./openRouterCoach.ts";

const config = readConfig(process.env);

describe.runIf(config.ok)("OpenRouter coach against the real provider", () => {
  it("asks one question about a pasted thread", async () => {
    if (!config.ok) throw new Error(config.error);
    const thread = loadFixture("carrier-status").thread.slice(0, 600);

    const reply = await createOpenRouterCoach(config.config, coachInstructions()).reply(verifiedConversationOf(thread));

    expect(reply).toContain("Question for");
  }, 30_000);

  it("uses a detail from an earlier turn", async () => {
    if (!config.ok) throw new Error(config.error);
    const conversation = verifiedConversationOf("Which carrier did I name for Rotterdam?", [
      { prompt: "Our carrier for the Rotterdam lane is Maersk. Reply only OK.", reply: "OK" },
    ]);

    const reply = await createOpenRouterCoach(config.config, coachInstructions()).reply(conversation);

    expect(reply).toContain("Maersk");
  }, 30_000);
});
