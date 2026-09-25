import { describe, expect, it } from "vitest";
import { fail, reply, submit, type ExchangeId, type Prompt } from "../domain/exchange.ts";
import { conversationText } from "./conversationText.ts";

const exchange = (id: string, prompt: string) => submit(id as ExchangeId, prompt as Prompt);

describe("conversationText", () => {
  it("writes each turn as You and Coach lines, with a blank line between turns", () => {
    const replied = reply(exchange("1", "A"), "R1", "sig-A");
    const refused = fail(exchange("2", "B"), { error: "Skipped", retryable: false });

    expect(conversationText([replied, refused, exchange("3", "C")])).toBe("You: A\nCoach: R1\n\nYou: B\n\nYou: C");
  });

  it("keeps a long multi-line message whole", () => {
    const thread = `Ops: one\n${"x".repeat(9000)}\nFinance: two\nCarriers: three\nOps: four`;

    expect(conversationText([exchange("1", thread)])).toBe(`You: ${thread}`);
  });
});
