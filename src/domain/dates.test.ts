import { describe, expect, it } from "vitest";
import { isoDay, shortDate } from "./dates.ts";

describe("dates", () => {
  it("writes a local day as 2026-09-05, zero-padded", () => {
    expect(isoDay(new Date(2026, 8, 5, 23, 59))).toBe("2026-09-05");
  });

  it("writes a short date as 5 Sep 2026", () => {
    expect(shortDate(new Date(2026, 8, 5))).toBe("5 Sep 2026");
  });
});
