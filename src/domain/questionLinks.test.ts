import { describe, expect, it } from "vitest";
import { boardOf } from "./boardFromReplies.ts";
import { entityId } from "./entityId.ts";
import type { Exchange, ExchangeId, Prompt } from "./exchange.ts";
import { latestQuestionOf } from "./latestQuestion.ts";
import { questionLinksOf, questionTiesOf } from "./questionLinks.ts";
import { QUESTION_PASTE, QUESTION_REPLY } from "../test/questionReplies.ts";

const replied = (reply: string): Exchange => ({ id: "e1" as ExchangeId, prompt: QUESTION_PASTE as Prompt, status: "replied", reply, signature: "sig" });

const REPLY = QUESTION_REPLY;

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

  it("names the quotes no event card comes from, never inventing a card for them (#126)", () => {
    const unmatched = REPLY.split("\n").slice(0, 7).concat('From thread: "who owns the weekly late report now"').join("\n");
    const exchanges = [replied(unmatched)];

    const ties = questionTiesOf(latestQuestionOf(exchanges)!, boardOf(exchanges), exchanges);

    expect(ties.unplaced).toEqual(["who owns the weekly late report now"]);
    expect(ties.links).toEqual([entityId("event", "The truck picks up 7731 fifty minutes after the pickup window.")]);
  });
});
