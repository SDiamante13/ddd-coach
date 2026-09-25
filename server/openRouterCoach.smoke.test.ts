// @vitest-environment node
import { describe, expect, it } from "vitest";
import type { Prompt } from "../src/domain/exchange.ts";
import { readConfig } from "./config.ts";
import { createOpenRouterCoach } from "./openRouterCoach.ts";

const config = readConfig(process.env);

describe.runIf(config.ok)("OpenRouter coach against the real provider", () => {
  it("returns a non-empty reply", async () => {
    if (!config.ok) throw new Error(config.error);

    const reply = await createOpenRouterCoach(config.config).reply("Reply with one word." as Prompt);

    expect(reply.trim()).not.toBe("");
  }, 30_000);
});
