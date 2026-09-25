// @vitest-environment node
import { describe, expect, it } from "vitest";
import { asksOpenly, namesACase } from "./questionChecks.ts";

describe("asksOpenly", () => {
  it("fails a ruling whose clause opens with should, even with options joined by or", () => {
    const ruling =
      "For the same-carrier date change that occurs after CARRIER_ACK, should the working item remain one booking and be AMENDED, or become a new booking through REBOOKED?";

    expect(asksOpenly(ruling)).toBe(false);
  });
});

describe("namesACase", () => {
  it.each([
    ["a load ID", "For load 7731, which rule decides the service credit?"],
    ["a customer", "For Customer B's rolling rebook, which count includes the new row?"],
    ["a message time", "For the rebook posted at 8:41, which booking does Finance invoice?"],
  ])("finds %s", (_case, question) => {
    expect(namesACase(question)).toBe(true);
  });

  it("finds no case in a question about the load in general", () => {
    expect(namesACase("For the load in the thread that got two invoices, which ref was matched?")).toBe(false);
  });
});
