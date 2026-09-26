import { describe, expect, it } from "vitest";
import { fail, reply, submit, type ExchangeId, type Prompt } from "../domain/exchange.ts";
import { conversationText } from "./conversationText.ts";

const SOURCE_LINE = 'Source: Evans, Domain-Driven Design Reference (2015), "Bounded Context".';
const exchange = (id: string, prompt: string) => submit(id as ExchangeId, prompt as Prompt);

describe("conversationText", () => {
  it("writes each turn as You and Coach lines, with a blank line between turns", () => {
    const replied = reply(exchange("1", "A"), "R1", "sig-A");
    const refused = fail(exchange("2", "B"), { error: "Skipped", remedy: "copy" });

    expect(conversationText([replied, refused, exchange("3", "C")])).toBe("You: A\nCoach: R1\n\nYou: B\n\nYou: C");
  });

  it("closes the gap a stripped Source line leaves between paragraphs", () => {
    const cited = reply(exchange("1", "Q"), `Answer.\n\n${SOURCE_LINE}\n\nPaste a thread.`, "sig-A");

    expect(conversationText([cited])).toBe("You: Q\nCoach: Answer.\n\nPaste a thread.");
  });

  it("ends a turn at its last words when the stripped Source line closed the reply", () => {
    const cited = reply(exchange("1", "Q1"), `Answer.\n\n${SOURCE_LINE}`, "sig-A");

    expect(conversationText([cited, exchange("2", "Q2")])).toBe("You: Q1\nCoach: Answer.\n\nYou: Q2");
  });

  it("keeps a long multi-line message whole", () => {
    const thread = `Ops: one\n${"x".repeat(9000)}\nFinance: two\nCarriers: three\nOps: four`;

    expect(conversationText([exchange("1", thread)])).toBe(`You: ${thread}`);
  });
});
