// @vitest-environment node
import { describe, expect, it } from "vitest";
import { failedHardChecks, softScores, type Fixture } from "./replyChecks.ts";

const fixture: Fixture = {
  thread: [
    "Dana Whitfield: a booking exists the moment the customer hits submit.",
    "Tom Brennan: for finance it's only a booking once it's invoiceable.",
    "Sam Kowalski: Booking#rebook! sets REBOOKED and inserts a new row. amend! sets AMENDED.",
  ].join("\n"),
  key: {
    people: ["Dana", "Whitfield", "Tom", "Brennan", "Sam", "Kowalski"],
    attributions: [{ phrase: "invoiceable", teams: ["Finance"] }],
    expect: { splitTeam: "Ops", splitTerms: ["REBOOKED", "AMENDED"], codeLine: true, stalePattern: "lane.*AMENDED" },
  },
};

const GOOD_REPLY = [
  "Events, in order",
  "1. From thread: The customer hits submit on the portal.",
  "2. Guess: Ops rebooks when the date changes.",
  "",
  "Words that don't match",
  '"booking"',
  "- From thread: Ops means the request from submit onward.",
  "- From thread: Finance means a shipment once it's invoiceable.",
  "- Guess: Code inserts a new row on every rebook.",
  '"rebook"',
  "- From thread: Ops (view A) means a date change with the same carrier is AMENDED.",
  "- From thread: Ops (view B) means every change is REBOOKED.",
  "",
  "Question for the ops lead who handles rebooks: Is a date change with the same carrier still the same booking?",
].join("\n");

const SIX_EVENTS = ["3.", "4.", "5.", "6."].map((n) => `${n} Guess: Ops calls the customer.`).join("\n") + "\n2. Guess:";

const FIVE_WORDS = ["submit", "invoiceable", "REBOOKED", "AMENDED"]
  .map((word) => `"${word}"\n- From thread: Ops use it.`)
  .concat('"booking"')
  .join("\n");

function swap(first: string, second: string): string {
  return GOOD_REPLY.replace(first, "\u0000").replace(second, first).replace("\u0000", second);
}

describe("hard checks", () => {
  it("pass a reply in the layout that follows every rule", () => {
    expect(failedHardChecks(GOOD_REPLY, "stop", fixture)).toEqual([]);
  });

  it.each([
    ["layout", "the parts out of order", swap("Events, in order", "Words that don't match")],
    ["events", "six events", GOOD_REPLY.replace("2. Guess:", SIX_EVENTS)],
    ["labels", "a meaning line without a source label", GOOD_REPLY.replace("- Guess: Code", "- Code")],
    ["no names", "a person named in a meaning line", GOOD_REPLY.replace("Finance means", "Tom in Finance means")],
    ["one question", "a second question", GOOD_REPLY.replace("on every rebook.", "on every rebook. Is that right?")],
    ["no jargon", "avoided jargon", GOOD_REPLY.replace("Ops means", "Ops, a bounded context, means")],
    ["no jargon", "a made-up CamelCase name", GOOD_REPLY.replace("Ops rebooks", "BookingRebooked fires")],
    ["complete ending", "a truncated last line", GOOD_REPLY.slice(0, -12)],
    ["at most 4 words", "five quoted words", GOOD_REPLY.replace('"booking"', FIVE_WORDS)],
  ])("fail %s for %s", (check, _case, reply) => {
    expect(failedHardChecks(reply, "stop", fixture)).toContain(check);
  });

  it("fail complete ending for a reply the model cut at the cap", () => {
    expect(failedHardChecks(GOOD_REPLY, "length", fixture)).toEqual(["complete ending"]);
  });
});

describe("soft scores", () => {
  it("all hold for a reply that attributes, splits and quotes as the key expects", () => {
    expect(softScores(GOOD_REPLY, fixture)).toEqual({
      attribution: true,
      split: true,
      codeLine: true,
      noStaleMeaning: true,
      quotedWordsInThread: true,
      under400Words: true,
    });
  });

  it.each([
    ["attribution", "the invoiceable meaning given to Ops", GOOD_REPLY.replace("Finance means a shipment", "Ops means a shipment")],
    ["split", "the second view named after a shift", GOOD_REPLY.replace("Ops (view B)", "Night dispatch")],
    ["split", "a split that never names AMENDED", GOOD_REPLY.replace("is AMENDED", "keeps its ref")],
    ["codeLine", "no line for the code", GOOD_REPLY.replace("- Guess: Code inserts a new row on every rebook.\n", "")],
    ["noStaleMeaning", "the corrected meaning carried", GOOD_REPLY.replace("a date change with", "a lane change with")],
    ["quotedWordsInThread", "a quoted word not in the thread", GOOD_REPLY.replace('"booking"', '"reservation"')],
    ["under400Words", "a reply of 400 words", GOOD_REPLY.replace("onward.", `onward.${" word".repeat(400)}.`)],
  ])("miss %s for %s", (score, _case, reply) => {
    expect(softScores(reply, fixture)).toMatchObject({ [score]: false });
  });
});
