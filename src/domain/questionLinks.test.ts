import { describe, expect, it } from "vitest";
import { boardOf } from "./boardFromReplies.ts";
import { entityId } from "./entityId.ts";
import type { Exchange, ExchangeId, Prompt } from "./exchange.ts";
import { latestQuestionOf } from "./latestQuestion.ts";
import { questionLinksOf } from "./questionLinks.ts";

const PASTE = ["Mon 08:10 Ops: truck picked up 7731 fifty minutes after the pickup window", "Tue 09:30 Billing: issued Customer D a service credit for 7731"].join("\n");

const replied = (reply: string): Exchange => ({ id: "e1" as ExchangeId, prompt: PASTE as Prompt, status: "replied", reply, signature: "sig" });

const REPLY = [
  "Events, in order",
  "1. From thread: The truck picks up 7731 fifty minutes after the pickup window.",
  "2. From thread: Billing issues Customer D a service credit for 7731.",
  "3. Guess: Billing reverses the credit.",
  "",
  "Question for the billing lead, at Friday's review: Does a late pickup earn the credit?",
  'From thread: "truck picked up 7731 fifty minutes after the pickup window"',
  'From thread: "issued Customer D a service credit for 7731"',
].join("\n");

const linksOf = (reply: string) => {
  const exchanges = [replied(reply)];
  return questionLinksOf(latestQuestionOf(exchanges)!, boardOf(exchanges), exchanges);
};

describe("questionLinksOf", () => {
  it("links the question to the events its source lines come from", () => {
    expect(linksOf(REPLY)).toEqual([
      entityId("event", "The truck picks up 7731 fifty minutes after the pickup window."),
      entityId("event", "Billing issues Customer D a service credit for 7731."),
    ]);
  });

  it("links nothing for a source line no event comes from", () => {
    const unmatched = REPLY.split("\n").slice(0, 6).concat('From thread: "who owns the weekly late report now"').join("\n");

    expect(linksOf(unmatched)).toEqual([]);
  });
});
