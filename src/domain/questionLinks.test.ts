import { describe, expect, it } from "vitest";
import { boardOf } from "./boardFromReplies.ts";
import { entityId } from "./entityId.ts";
import type { Exchange, ExchangeId, Prompt } from "./exchange.ts";
import { latestQuestionOf } from "./latestQuestion.ts";
import { questionLinksOf, questionTiesOf } from "./questionLinks.ts";
import { QUESTION_PASTE, QUESTION_REPLY, ROW_QUOTE_PASTE, ROW_QUOTE_REPLY } from "../test/questionReplies.ts";

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

  it("ties a quote to the term row it comes from, so only quotes on neither cards nor rows are missing (#109 hotfix)", () => {
    const exchanges: Exchange[] = [{ id: "e1" as ExchangeId, prompt: ROW_QUOTE_PASTE as Prompt, status: "replied", reply: ROW_QUOTE_REPLY, signature: "s" }];

    const ties = questionTiesOf(latestQuestionOf(exchanges)!, boardOf(exchanges), exchanges);

    expect(ties.links).toEqual([entityId("event", "The truck picks up 7731 fifty minutes after the pickup window.")]);
    expect(ties.rows).toEqual([{ term: entityId("term", "late"), row: entityId("meaning", "late|Account team"), word: "late", holder: "Account team" }]);
    expect(ties.unplaced).toEqual([]);
  });
});

describe("questionTiesOf with who's who (#133)", () => {
  const paste = ["Luis Ortega  8:12 AM", "customer D asked why 7731 says Confirmed", "", "Rosa Delgado  8:15 AM", "for us Confirmed means the carrier accepted the tender"].join("\n");
  const reply = [
    "Words that don't match",
    '"confirmed"',
    "- From thread: Carriers means the carrier accepted the tender.",
    "",
    "Question for the carrier lead: Which Confirmed should the portal show?",
    'From thread: "for us Confirmed means the carrier accepted the tender"',
  ].join("\n");
  const exchanges: Exchange[] = [{ id: "e1" as ExchangeId, prompt: paste as Prompt, status: "replied", reply, signature: "sig" }];
  const tiesWith = (whoIsWho?: ReadonlyMap<string, string>) => questionTiesOf(latestQuestionOf(exchanges)!, boardOf(exchanges), exchanges, whoIsWho).rows.map(({ holder }) => holder);

  it("ties the question to the row whose line it quotes once the speaker's team is known", () => {
    expect(tiesWith()).toEqual([]);
    expect(tiesWith(new Map([["rosa delgado", "Carrier desk"]]))).toEqual(["Carriers"]);
  });
});
