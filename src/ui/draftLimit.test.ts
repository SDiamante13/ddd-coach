import { describe, expect, it } from "vitest";
import { draftLimit } from "./draftLimit.ts";

const max = 100;

describe("draftLimit", () => {
  it.each([
    [79, "ok"],
    [80, "near"],
    [100, "near"],
    [101, "over"],
  ])("rates a %i-character draft against a cap of 100 as %s", (length, expected) => {
    expect(draftLimit(length, max)).toBe(expected);
  });
});
