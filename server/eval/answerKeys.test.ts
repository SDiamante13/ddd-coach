// @vitest-environment node
import { describe, expect, it } from "vitest";
import { keyChanges } from "./answerKeys.ts";

describe("keyChanges", () => {
  it("names only the fixtures whose answer key changed since the run", () => {
    const recorded = { greeting: "aaa", "example-thread": "bbb", "booking-split": "ccc" };
    const current = { greeting: "aaa", "example-thread": "b2b", "booking-split": "ccc" };

    expect(keyChanges(recorded, current)).toEqual(["example-thread"]);
  });
});
