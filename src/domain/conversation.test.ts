import { describe, expect, it } from "vitest";
import { historyBefore, turnsOf } from "./conversation.ts";
import { fail, reply, submit, type ExchangeId, type Prompt } from "./exchange.ts";

function exchangeId(n: number): ExchangeId {
  return `exchange-${n}` as ExchangeId;
}

function asPrompt(text: string): Prompt {
  return text as Prompt;
}

const repliedA = reply(submit(exchangeId(1), asPrompt("A")), "R1");
const failedB = fail(submit(exchangeId(2), asPrompt("B")), "Coach unavailable");
const repliedC = reply(submit(exchangeId(3), asPrompt("C")), "R3");
const pendingD = submit(exchangeId(4), asPrompt("D"));

describe("turnsOf", () => {
  it("keeps only replied exchanges as turns, in log order", () => {
    expect(turnsOf([repliedA, failedB, repliedC, pendingD])).toEqual([
      { prompt: "A", reply: "R1" },
      { prompt: "C", reply: "R3" },
    ]);
  });
});

describe("historyBefore", () => {
  it("keeps only the replied turns positioned before the exchange", () => {
    expect(historyBefore([repliedA, failedB, repliedC], exchangeId(2))).toEqual([{ prompt: "A", reply: "R1" }]);
  });
});
