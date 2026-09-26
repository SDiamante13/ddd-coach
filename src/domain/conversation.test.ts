import { describe, expect, it } from "vitest";
import { historyBefore, lastLongPaste, turnsOf } from "./conversation.ts";
import { fail, reply, submit, type ExchangeId, type Prompt } from "./exchange.ts";

function exchangeId(n: number): ExchangeId {
  return `exchange-${n}` as ExchangeId;
}

function asPrompt(text: string): Prompt {
  return text as Prompt;
}

const repliedA = reply(submit(exchangeId(1), asPrompt("A")), "R1", "sig-A");
const failedB = fail(submit(exchangeId(2), asPrompt("B")), { error: "Coach unavailable", remedy: "retry" });
const repliedC = reply(submit(exchangeId(3), asPrompt("C")), "R3", "sig-C");
const pendingD = submit(exchangeId(4), asPrompt("D"));
const turnA = { prompt: "A", reply: "R1", signature: "sig-A" };
const turnC = { prompt: "C", reply: "R3", signature: "sig-C" };

describe("turnsOf", () => {
  it("keeps only replied exchanges as turns, in log order", () => {
    expect(turnsOf([repliedA, failedB, repliedC, pendingD])).toEqual([turnA, turnC]);
  });
});

describe("historyBefore", () => {
  it("keeps only the replied turns positioned before the exchange", () => {
    expect(historyBefore([repliedA, failedB, repliedC], exchangeId(2))).toEqual([turnA]);
  });

  it("keeps every replied turn for an exchange that is not in the log", () => {
    expect(historyBefore([repliedA, failedB, repliedC], exchangeId(99))).toEqual([turnA, turnC]);
  });
});

describe("lastLongPaste", () => {
  it("is the most recent message of 1,000 characters or more, skipping shorter follow-ups (#68)", () => {
    const older = reply(submit(exchangeId(5), asPrompt("O".repeat(2_000))), "R", "sig-O");
    const thread = reply(submit(exchangeId(6), asPrompt("T".repeat(1_000))), "R", "sig-T");

    expect(lastLongPaste([older, thread, repliedA, failedB])).toBe("T".repeat(1_000));
  });
});
