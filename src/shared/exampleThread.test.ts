import { describe, expect, it } from "vitest";
import { EXAMPLE_THREAD } from "./exampleThread.ts";

describe("example thread", () => {
  it("is long enough to need joining but short enough to read at a break", () => {
    expect(EXAMPLE_THREAD.length).toBeGreaterThanOrEqual(3_000);
    expect(EXAMPLE_THREAD.length).toBeLessThanOrEqual(6_000);
  });

  it("says up front that it's fictional", () => {
    expect(EXAMPLE_THREAD).toMatch(/^Example thread \(fictional\)\./);
  });

  it.each([
    ["the contract's rule, early", "delivery appointment"],
    ["the later credit that breaks it", "7731"],
  ])("plants %s for the question to join", (_part, anchor) => {
    expect(EXAMPLE_THREAD).toContain(anchor);
  });
});
