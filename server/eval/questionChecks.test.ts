// @vitest-environment node
import { describe, expect, it } from "vitest";
import { asksOpenly, namesACase, rolesFromThread } from "./questionChecks.ts";

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

describe("rolesFromThread (#99)", () => {
  const allowed = ["maintainer", "release manager", "whoever owns"];

  it.each([
    ["roles the thread names, with the forum after them", "the German maintainer and the India maintainer, at Friday's release call", true],
    ["a neutral owner", "whoever owns the number series", true],
    ["an invented role", "the invoicing product lead and the India maintainer", false],
  ])("judges %s", (_case, roles, passes) => {
    expect(rolesFromThread(roles, allowed)).toBe(passes);
  });

  it("passes any roles when the key lists none", () => {
    expect(rolesFromThread("the invoicing product lead", undefined)).toBe(true);
  });
});
