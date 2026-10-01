import { describe, expect, it } from "vitest";
import { entityId } from "./entityId.ts";
import type { Exchange, ExchangeId, Prompt } from "./exchange.ts";
import { wordsOf } from "./words.ts";
import { emptyBoard, sentCorrectionsOf } from "./board.ts";
import type { VisitorAction } from "./boardFromReplies.ts";

const PASTE = ["Mon Ops (day desk): late means the truck missed the pickup window", "Tue Billing: late is anything on the weekly late report"].join("\n");

const replied = (id: string, reply: string): Exchange => ({ id: id as ExchangeId, prompt: PASTE as Prompt, status: "replied", reply, signature: "s" });

const FIRST = [
  "Words that don't match",
  '"late"',
  "- From thread: Ops (day desk) means a truck not at pickup by the end of the pickup window.",
  "- From thread: Billing means a load on the weekly late report.",
  "- Guess: Code means actual_pickup_at is after pickup_window_end.",
].join("\n");

const SECOND = [
  "Words that don't match",
  '"late"',
  "- From thread: Billing means any load the weekly late report lists.",
  '"on time"',
  "- Guess: Account team means meeting the booked delivery appointment.",
].join("\n");

describe("wordsOf", () => {
  it("makes one term card per word with a row per team, keeping From thread and Guess apart", () => {
    const [late] = wordsOf([replied("e1", FIRST)]).terms;

    expect(late!.id).toBe(entityId("term", "late"));
    expect(late!.rows.map(({ id, holder, provenance }) => [id, holder, provenance])).toEqual([
      [entityId("meaning", "late|Ops (day desk)"), "Ops (day desk)", "thread"],
      [entityId("meaning", "late|Billing"), "Billing", "thread"],
      [entityId("meaning", "late|Code"), "Code", "guess"],
    ]);
  });

  it("updates a restated row in place and adds new words after the ones already there", () => {
    const lane = wordsOf([replied("e1", FIRST), replied("e2", SECOND)]);

    expect(lane.terms.map(({ word }) => word)).toEqual(["late", "on time"]);
    const billing = lane.terms[0]!.rows[1]!;
    expect([billing.meaning, billing.placedBy, billing.changedBy]).toEqual(["Any load the weekly late report lists.", "e1", "e2"]);
    expect(lane.latest).toBe("e2");
  });

  it("finds each thread row's source line in the paste, and none for a guess", () => {
    const [late] = wordsOf([replied("e1", FIRST)]).terms;

    expect(late!.rows[0]!.line).toBe("Mon Ops (day desk): late means the truck missed the pickup window");
    expect(late!.rows[2]!.line).toBeNull();
  });

  it("takes a row's source line only from its own team, never another desk's (#109 hotfix)", () => {
    const paste = [
      "Mon 09:40  Ops day desk: a truck not at pickup by the window end is late",
      "Mon 10:02  Ops night desk: on time means delivered before the appointment, even after a late pickup",
    ].join("\n");
    const reply = ["Words that don't match", '"on time"', "- From thread: Ops (day desk) means a load can recover from a late pickup by delivering before the appointment.", "- From thread: Ops (night desk) means delivered before the appointment even after a late pickup."].join("\n");
    const exchanges: Exchange[] = [{ id: "e1" as ExchangeId, prompt: paste as Prompt, status: "replied", reply, signature: "s" }];

    const [onTime] = wordsOf(exchanges).terms;

    expect(onTime!.rows[0]!.line).toBeNull();
    expect(onTime!.rows[1]!.line).toBe("Mon 10:02  Ops night desk: on time means delivered before the appointment, even after a late pickup");
  });

  it("takes the visitor's correction of a row's meaning, keeping the coach's words to strike through (#90c)", () => {
    const fix: VisitorAction = { kind: "correct", id: entityId("meaning", "late|Billing"), text: "Any load past the booked appointment.", after: "e1" as ExchangeId };

    const billing = wordsOf([replied("e1", FIRST)], [fix]).terms[0]!.rows[1]!;

    expect([billing.meaning, billing.correctedFrom]).toEqual(["Any load past the booked appointment.", "A load on the weekly late report."]);
  });

  it("keeps the visitor's wording when a later reply restates a corrected row (#95's rule)", () => {
    const fix: VisitorAction = { kind: "correct", id: entityId("meaning", "late|Billing"), text: "Any load past the booked appointment.", after: "e1" as ExchangeId };

    const billing = wordsOf([replied("e1", FIRST), replied("e2", SECOND)], [fix]).terms[0]!.rows[1]!;

    expect([billing.meaning, billing.correctedFrom]).toEqual(["Any load past the booked appointment.", "A load on the weekly late report."]);
  });

  it("sends each corrected term row with its word and team, and nothing for rows the visitor left alone", () => {
    const fix: VisitorAction = { kind: "correct", id: entityId("meaning", "late|Billing"), text: "Any load past the booked appointment.", after: "e1" as ExchangeId };

    const lane = wordsOf([replied("e1", FIRST)], [fix]);

    expect(sentCorrectionsOf(emptyBoard, lane.terms)).toEqual([
      { was: "late (Billing): A load on the weekly late report.", now: "late (Billing): Any load past the booked appointment." },
    ]);
  });

  it("finds a team row's line in a Slack paste once the visitor says who's on that team (#133)", () => {
    const paste = ["Luis Ortega  8:12 AM", "customer D asked why 7731 says Confirmed", "", "Rosa Delgado  8:15 AM", "for us Confirmed means the carrier accepted the tender"].join("\n");
    const reply = ["Words that don't match", '"confirmed"', "- From thread: Carrier desk means the carrier accepted the tender."].join("\n");
    const exchange: Exchange = { id: "e1" as ExchangeId, prompt: paste as Prompt, status: "replied", reply, signature: "s" };
    const row = (whoIsWho?: ReadonlyMap<string, string>) => wordsOf([exchange], [], whoIsWho).terms[0]!.rows[0]!.line;

    expect(row()).toBeNull();
    expect(row(new Map([["rosa delgado", "Carrier desk"]]))).toBe("for us Confirmed means the carrier accepted the tender");
  });

  it("returns the exact source line when an emoji comes earlier in the paste", () => {
    const paste = ["Mon 08:04  Billing: 🎉🎉🎉🎉🎉 morning", "", "Mon 11:15  Billing: late is anything on the weekly late report", "Mon 11:20  Ops day desk: next"].join("\n");
    const reply = ["Words that don't match", '"late"', "- From thread: Billing means a load on the weekly late report."].join("\n");
    const exchange: Exchange = { id: "e1" as ExchangeId, prompt: paste as Prompt, status: "replied", reply, signature: "s" };

    expect(wordsOf([exchange]).terms[0]!.rows[0]!.line).toBe("Mon 11:15  Billing: late is anything on the weekly late report");
  });

  describe("with the visitor's teams (#133, option b)", () => {
    const paste = ["Rosa Delgado  8:15 AM", "for us Confirmed means the carrier accepted the tender", "", "Dana Whitfield  8:21 AM", "for ops confirmed is when we called the customer", "", "Maya Okafor  9:02 PM", "nights: confirmed is when the truck is checked in"].join("\n");
    const rowLine = (holder: string, meaning: string) => {
      const reply = ["Words that don't match", '"confirmed"', `- From thread: ${holder} means ${meaning}`].join("\n");
      const exchange: Exchange = { id: "e1" as ExchangeId, prompt: paste as Prompt, status: "replied", reply, signature: "s" };
      const teams = new Map([["rosa delgado", "Carrier desk"], ["dana whitfield", "Ops day desk"], ["maya okafor", "Ops night desk"]]);
      return wordsOf([exchange], [], teams).terms[0]!.rows[0]!.line;
    };

    it("lets a renamed holder take the lines of the one team its words name", () => {
      expect(rowLine("Carriers", "the carrier accepted the tender.")).toBe("for us Confirmed means the carrier accepted the tender");
      expect(rowLine("Ops (night shift)", "the truck is checked in.")).toBe("nights: confirmed is when the truck is checked in");
    });

    it("gives no source when the holder could be more than one of the visitor's teams", () => {
      expect(rowLine("Ops (view B)", "the truck is checked in.")).toBeNull();
    });

    it("finds a team's line that says the same thing with other word endings (#138, the Carrier desk row in the #133 demo)", () => {
      const tonu = "for carriers it's contractual. once they've accepted, cancelling costs us a TONU if the truck's rolling";
      const reply = ["Words that don't match", '"confirmed"', "- From thread: Carrier desk means a contractual acceptance that can create a TONU risk if cancelled while the truck is rolling."].join("\n");
      const exchange: Exchange = { id: "e1" as ExchangeId, prompt: ["Rosa Delgado  8:15 AM", tonu].join("\n") as Prompt, status: "replied", reply, signature: "s" };

      expect(wordsOf([exchange], [], new Map([["rosa delgado", "Carrier desk"]])).terms[0]!.rows[0]!.line).toBe(tonu);
    });

    it("gives a row whose team is unclear no line, rather than anyone's (#138)", () => {
      const reply = ["Words that don't match", '"booking count"', "- From thread: means night dispatch subtracts rebooks by hand."].join("\n");
      const exchange: Exchange = { id: "e1" as ExchangeId, prompt: "Mon 08:04  Ops night desk: night dispatch subtracts rebooks by hand from the booking count" as Prompt, status: "replied", reply, signature: "s" };

      const row = wordsOf([exchange]).terms[0]!.rows[0]!;

      expect([row.holder, row.line]).toEqual(["", null]);
    });
  });
});
