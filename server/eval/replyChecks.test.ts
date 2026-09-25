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
    teams: ["Ops", "Finance"],
    attributions: [{ phrase: "invoiceable", teams: ["Finance"] }],
    expect: {
      views: {
        team: "Ops",
        groups: [
          { name: "day desk", markers: ["same carrier", "one row"] },
          { name: "night shift", markers: ["every change"] },
        ],
      },
      splitTeam: "Ops",
      splitTerms: ["REBOOKED", "AMENDED"],
      codeLine: true,
      stalePattern: "lane.*AMENDED",
      forum: ["27 Oct"],
      questionEvidence: [["submit"], ["invoiceable"], ["new row"]],
    },
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
  "Question for the ops lead and the finance controller, at the 27 Oct review: If a booking exists on submit but counts only once invoiceable, which one does a same-carrier date change keep?",
].join("\n");

const SIX_EVENTS = ["3.", "4.", "5.", "6."].map((n) => `${n} Guess: Ops calls the customer.`).join("\n") + "\n2. Guess:";

const FIVE_WORDS = ["submit", "invoiceable", "REBOOKED", "AMENDED"]
  .map((word) => `"${word}"\n- From thread: Ops use it.`)
  .concat('"booking"')
  .join("\n");

const INTERVIEW_06_REPLY = [
  "Events, in order",
  "1. From thread: The customer submits a booking on the portal and Ops starts working it.",
  "2. From thread: Ops tenders the load to a carrier, and the carrier accepts the tender.",
  "3. From thread: The carrier drops the load or the lane changes, and Ops rebooks it.",
  "4. From thread: The carrier team's EDI job cancels the first tender and sends a new tender with a new tender ID.",
  "5. From thread: Finance invoices the load after proof of delivery.",
  "",
  "Words that don't match",
  "\"booking\"",
  "- From thread: Ops means the customer's portal submission that the desk starts working.",
  "- From thread: Finance means an invoiceable load, after proof of delivery.",
  "- From thread: Carriers mean a tender, not a booking.",
  "- From thread: Night dispatch means a load once a carrier has accepted it, because that's when it shows on their board.",
  "\"rebook\"",
  "- From thread: Ops (view A) means a carrier or lane change creates a new booking under the carrier contract.",
  "- From thread: Ops (view B) means REBOOKED whenever the carrier changes, lane or not, because AMENDED doesn't reach the carrier portal overnight.",
  "- From thread: Finance means the old invoice is voided and a new one is raised.",
  "- From thread: Code sends a cancel and a new tender with a new ID.",
  "\"tender\"",
  "- From thread: Carriers mean the offer they accept or reject, keyed by tender ID.",
  "- From thread: Ops means the moment the desk sends the load out.",
  "\"hold\"",
  "- From thread: Ops (view A) means a load waiting on the customer.",
  "- From thread: Ops (view B) means a load waiting on the carrier to accept.",
  "- From thread: Finance means a credit hold on the account, so nothing ships.",
  "",
  "Question for the finance controller and the carrier team lead, at the 27 Oct RFC review: For the load in the thread that got two carrier invoices after a rebook, was the second invoice matched to the original booking ref or to the new tender ID?",
].join("\n");

const HOLD_IS_WAITING = [{ team: "Ops", words: [["hold"], ["waiting on customer", "waiting on the customer"]] }];

const bookingSplit: Fixture = {
  ...fixture,
  key: { ...fixture.key, teams: ["Ops", "Finance", "Carriers"], expect: { ...fixture.key.expect, sameMeaning: HOLD_IS_WAITING } },
};

function askedAs(question: string): string {
  return GOOD_REPLY.replace("If a booking exists on submit but counts only once invoiceable, which one does a same-carrier date change keep?", question);
}

function withWord(block: string): string {
  return GOOD_REPLY.replace("\n\nQuestion for", `\n${block}\n\nQuestion for`);
}

const FLIPPED_VIEWS = withWord(
  [
    '"booking count"',
    "- From thread: Ops (view A) means every change adds a row.",
    "- From thread: Ops (view B) means a same carrier date change keeps one row.",
  ].join("\n"),
);

function swap(first: string, second: string): string {
  return GOOD_REPLY.replace(first, "\u0000").replace(second, first).replace("\u0000", second);
}

describe("hard checks", () => {
  it("pass a reply in the layout that follows every rule", () => {
    expect(failedHardChecks(GOOD_REPLY, "stop", fixture)).toEqual([]);
  });

  it.each([
    ["parses", "the parts out of order", swap("Events, in order", "Words that don't match")],
    ["events", "six events", GOOD_REPLY.replace("2. Guess:", SIX_EVENTS)],
    ["labels", "a meaning line without a source label", GOOD_REPLY.replace("- Guess: Code", "- Code")],
    ["no names", "a person named in a meaning line", GOOD_REPLY.replace("Finance means", "Tom in Finance means")],
    ["one question", "a second question", GOOD_REPLY.replace("on every rebook.", "on every rebook. Is that right?")],
    ["no jargon", "avoided jargon", GOOD_REPLY.replace("Ops means", "Ops, a bounded context, means")],
    ["no jargon", "a made-up CamelCase name", GOOD_REPLY.replace("Ops rebooks", "BookingRebooked fires")],
    ["complete ending", "a truncated last line", GOOD_REPLY.slice(0, -12)],
    ["no markdown", "bold emphasis", GOOD_REPLY.replace("Ops means", "**Ops** means")],
    ["no offers", "an offer to do more", GOOD_REPLY.replace("on every rebook.", "on every rebook. Would you like me to draft a glossary.")],
    ["at most 4 words", "five quoted words", GOOD_REPLY.replace('"booking"', FIVE_WORDS)],
    ["holders", "a shift as the holder", GOOD_REPLY.replace("Ops (view B) means", "Night dispatch means")],
    ["holders", "a shift inside a team as the holder", GOOD_REPLY.replace("Ops (view B) means", "Night Ops means")],
    ["holders", "a shift after the team", GOOD_REPLY.replace("Ops (view B) means", "Ops night shift means")],
    ["holders", "a shift as the view label", GOOD_REPLY.replace("Ops (view B) means", "Ops (night) means")],
    ["holders", "a thing as the holder", GOOD_REPLY.replace("Finance means", "The dashboard counts")],
    ["holders", "a party the thread doesn't give a view", GOOD_REPLY.replace("Finance means", "Customers see")],
    ["split labels", "two plain lines for one team", GOOD_REPLY.replace("Finance means a shipment", "Ops means a shipment")],
    ["split labels", "a plain line and a view line for one team", GOOD_REPLY.replace("Ops (view B) means", "Ops means")],
    ["split labels", "the same view twice", GOOD_REPLY.replace("Ops (view B) means", "Ops (view A) means")],
    ["stable views", "view A and view B swapping groups between words", FLIPPED_VIEWS],
    ["question asks", "a yes/no question with the answer in it", askedAs("should Ops keep one booking and send AMENDED so Finance issues one invoice?")],
    ["question asks", "a yes/no question about one option", askedAs("should the portal still show Confirmed?")],
    ["question asks", "a long yes/no question", askedAs("should it remain one booking and one invoice after the carrier bills TONU on the original load?")],
    ["question asks", "a short yes/no question", askedAs("is that still an appointment?")],
    ["question asks", "a leading question", askedAs("Shouldn't Ops amend instead of rebook?")],
    ["question asks", "an open question that proposes", askedAs("Why not amend instead of rebooking, which keeps one invoice?")],
  ])("fail %s for %s", (check, _case, reply) => {
    expect(failedHardChecks(reply, "stop", fixture)).toContain(check);
  });

  it("pass holders for the longest matching team and for an unclear team", () => {
    const withDesk = { ...fixture, key: { ...fixture.key, teams: ["Ops", "Carrier", "Carrier desk"] } };
    const reply = GOOD_REPLY.replace("Finance means", "Carrier desk means").replace("Ops means", "Team unclear means");

    expect(failedHardChecks(reply, "stop", withDesk)).toEqual([]);
  });

  it("pass split labels for a lone view line under a word", () => {
    const reply = GOOD_REPLY.replace("Ops means the request", "Ops (view A) means the request");

    expect(failedHardChecks(reply, "stop", fixture)).toEqual([]);
  });

  it.each([
    ["views that keep their groups across words", ["same carrier date change keeps one row", "every change adds a row"]],
    ["a view line that hits both groups' markers", ["every change on the same carrier keeps one row", "every change adds a row"]],
  ])("pass stable views for %s", (_case, [viewA, viewB]) => {
    const reply = withWord(`"booking count"\n- From thread: Ops (view A) means ${viewA}.\n- From thread: Ops (view B) means ${viewB}.`);

    expect(failedHardChecks(reply, "stop", fixture)).toEqual([]);
  });

  it("fail holders and same meaning not split for the interview 06 reply", () => {
    expect(failedHardChecks(INTERVIEW_06_REPLY, "stop", bookingSplit)).toEqual(["holders", "same meaning not split"]);
  });

  it("leave a split same-meaning word out of stable views", () => {
    const hold = ['"hold"', "- From thread: Ops (view A) means every change waits.", "- From thread: Ops (view B) means one row waits."];

    expect(failedHardChecks(withWord(hold.join("\n")), "stop", bookingSplit)).toEqual(["same meaning not split"]);
  });

  it("pass same meaning not split for one plain line under the same-meaning word", () => {
    const hold = '"hold"\n- From thread: Ops means a booking waiting on the customer, whether they say "hold" or "waiting on customer".';

    expect(failedHardChecks(withWord(hold), "stop", bookingSplit)).toEqual([]);
  });

  it.each([
    ["a choice joined by or", "was the second invoice matched to the original booking ref or to the new tender ID?"],
    ["a choice with a fallback option", "should the portal show Confirmed or a different status?"],
    ["a choice after a condition", "For a date-only change at night, should Ops create a new booking or record an AMENDED change?"],
  ])("pass question asks for %s", (_case, question) => {
    expect(failedHardChecks(askedAs(question), "stop", fixture)).toEqual([]);
  });

  it("fail code guess for a Code line stated as fact when no code was shown", () => {
    const noCode = { ...fixture, key: { ...fixture.key, expect: { ...fixture.key.expect, codeShown: false } } };
    const reply = GOOD_REPLY.replace("- Guess: Code", "- From thread: Code");

    expect(failedHardChecks(reply, "stop", noCode)).toEqual(["code guess"]);
  });

  it.each([
    ["an accented name", "José", "José hits submit", ["no names"]],
    ["an accented name in decomposed form", "José", "José hits submit".normalize("NFD"), ["no names"]],
    ["initials with full stops", "C.J.", "C.J. hits submit", ["no names"]],
    ["a short name inside a longer accented one", "Ana", "Anaïs hits submit", []],
    ["a name with an unclosed bracket the reply lacks", "Kev (nights", "The customer hits submit", []],
  ])("check names for %s", (_case, name, event, failures) => {
    const withName = { ...fixture, key: { ...fixture.key, people: [name] } };

    expect(failedHardChecks(GOOD_REPLY.replace("The customer hits submit", event), "stop", withName)).toEqual(failures);
  });

  it.each([
    ["a straight closing quote", 'Ops calls it "same booking."', []],
    ["a curly closing quote", "Ops calls it “same booking.”", []],
    ["a curly apostrophe after a question mark", "Ops asks ‘same booking?’", []],
    ["a bracket with no full stop", "Ops calls it same booking (per the sheet)", ["complete ending"]],
  ])("check complete ending for a last line ending in %s", (_case, lastLine, failures) => {
    expect(failedHardChecks(`${GOOD_REPLY}\n${lastLine}`, "stop", fixture)).toEqual(failures);
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
      questionSpansThread: true,
      jointRoles: true,
      forum: true,
      sameMeaningNamed: true,
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
    ["questionSpansThread", "a question from one part of the thread", GOOD_REPLY.replace(" but counts only once invoiceable,", ",")],
    ["jointRoles", "a single role", GOOD_REPLY.replace("the ops lead and the finance controller", "the ops lead")],
    ["forum", "no forum when the thread names one", GOOD_REPLY.replace(", at the 27 Oct review", "")],
  ])("miss %s for %s", (score, _case, reply) => {
    expect(softScores(reply, fixture)).toMatchObject({ [score]: false });
  });

  it("miss sameMeaningNamed when the same-meaning word's line names only one of its words", () => {
    const hold = withWord('"hold"\n- From thread: Ops means a booking waiting on the customer.');

    expect(softScores(hold, bookingSplit)).toMatchObject({ sameMeaningNamed: false });
  });

  it.each([
    ["one line names both words", withWord('"hold"\n- From thread: Ops means waiting on the customer, whether they say "hold" or "waiting on customer".')],
    ["neither word is quoted", GOOD_REPLY],
  ])("hold sameMeaningNamed when %s", (_case, reply) => {
    expect(softScores(reply, bookingSplit)).toMatchObject({ sameMeaningNamed: true });
  });
});
