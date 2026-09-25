// @vitest-environment node
import { describe, expect, it } from "vitest";
import { asksOpenly } from "./questionChecks.ts";

describe("asksOpenly", () => {
  it("fails a ruling whose clause opens with should, even with options joined by or", () => {
    const ruling =
      "For the same-carrier date change that occurs after CARRIER_ACK, should the working item remain one booking and be AMENDED, or become a new booking through REBOOKED?";

    expect(asksOpenly(ruling)).toBe(false);
  });
});
