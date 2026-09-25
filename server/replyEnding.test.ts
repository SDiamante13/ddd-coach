// @vitest-environment node
import { describe, expect, it } from "vitest";
import { CUT_SHORT_NOTE } from "../src/shared/chatContract.ts";
import { endOnCompleteLine } from "./replyEnding.ts";

describe("endOnCompleteLine", () => {
  it("drops a word cut in half and adds the cut-short note", () => {
    const cut = "- From thread: Finance means once it's invoiceable.\n- From thread: Ops say a bo";

    expect(endOnCompleteLine(cut)).toBe(`- From thread: Finance means once it's invoiceable.\n\n${CUT_SHORT_NOTE}`);
  });

  it("keeps a sentence that ends in a closing quote on the cut line", () => {
    const cut = 'Events, in order\n1. From thread: Dana\'s desk says "same booking." Then the carr';

    expect(endOnCompleteLine(cut)).toBe(
      `Events, in order\n1. From thread: Dana's desk says "same booking."\n\n${CUT_SHORT_NOTE}`,
    );
  });

  it("keeps a sentence that ends in a curly closing quote on the cut line", () => {
    const cut = "Events, in order\n1. From thread: Dana’s desk says “same booking.” Then the carr";

    expect(endOnCompleteLine(cut)).toBe(
      `Events, in order\n1. From thread: Dana’s desk says “same booking.”\n\n${CUT_SHORT_NOTE}`,
    );
  });

  it.each(["e.g.", "i.e.", "vs.", "E.g."])("does not take the full stop in %s as the end of a sentence", (abbreviation) => {
    const cut = `- From thread: Ops means one thing.\n- From thread: Finance means a change, ${abbreviation} a da`;

    expect(endOnCompleteLine(cut)).toBe(`- From thread: Ops means one thing.\n\n${CUT_SHORT_NOTE}`);
  });

  it("takes the full stop in etc. as the end of a sentence", () => {
    const cut = "- From thread: Ops means one thing.\n- From thread: Finance means a date, a lane, etc. Then a";

    expect(endOnCompleteLine(cut)).toBe(
      `- From thread: Ops means one thing.\n- From thread: Finance means a date, a lane, etc.\n\n${CUT_SHORT_NOTE}`,
    );
  });

  it("drops a numbered line cut short instead of keeping its number", () => {
    const cut = "Events, in order\n1. From thread: Customer submits on the portal.\n2. From thread: Ops rebo";

    expect(endOnCompleteLine(cut)).toBe(
      `Events, in order\n1. From thread: Customer submits on the portal.\n\n${CUT_SHORT_NOTE}`,
    );
  });

  it("returns nothing when no complete line or sentence was written", () => {
    expect(endOnCompleteLine("Events, in ord")).toBe("");
  });

  it("still adds the note when the cut fell right after a full stop", () => {
    const cut = "Words that don't match\n\"rebook\"\n- From thread: Finance means a new invoice.";

    expect(endOnCompleteLine(cut)).toBe(`${cut}\n\n${CUT_SHORT_NOTE}`);
  });
});
