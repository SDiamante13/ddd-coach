// @vitest-environment node
import { describe, expect, it } from "vitest";
import { latencyVerdict } from "./latency.ts";

describe("latencyVerdict", () => {
  it("passes first turns with a median at 15 s and none over 22 s", () => {
    expect(latencyVerdict([9_000, 15_000, 15_000, 22_000, 10_000])).toEqual({
      medianMs: 15_000,
      maxMs: 22_000,
      pullStreamingAhead: false,
    });
  });

  it("pulls streaming ahead when the median first turn is over 15 s", () => {
    expect(latencyVerdict([15_001, 2_000, 15_001, 3_000, 15_001])).toEqual({
      medianMs: 15_001,
      maxMs: 15_001,
      pullStreamingAhead: true,
    });
  });

  it("pulls streaming ahead when any first turn is over 22 s", () => {
    expect(latencyVerdict([5_000, 5_000, 22_001, 5_000, 5_000]).pullStreamingAhead).toBe(true);
  });
});
