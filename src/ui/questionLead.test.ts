import { describe, expect, it } from "vitest";
import { questionLead } from "./questionLead.ts";

describe("questionLead", () => {
  it("reaches from the card's top to the bottom of the first quote, plus the card's bottom inset", () => {
    expect(questionLead({ cardTop: 81, anchorBottom: 304, scrollTop: 0, bottomInset: 13 })).toBe(236);
  });

  it("measures the same lead however far the card is scrolled inside", () => {
    expect(questionLead({ cardTop: 81, anchorBottom: 254, scrollTop: 50, bottomInset: 13 })).toBe(236);
    expect(questionLead({ cardTop: 90, anchorBottom: 200, scrollTop: 0, bottomInset: 10 })).toBe(120);
  });

  it("rounds up, so a fraction of a pixel never clips the quote", () => {
    expect(questionLead({ cardTop: 80.9, anchorBottom: 304.2, scrollTop: 0, bottomInset: 13 })).toBe(237);
  });
});
