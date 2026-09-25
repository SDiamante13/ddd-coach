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
