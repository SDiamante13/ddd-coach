// @vitest-environment node
import { describe, expect, it } from "vitest";
import { latencyVerdict, mentionsNonce } from "./latency.ts";

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

  it("takes the median of an even count as the mean of the middle two", () => {
    expect(latencyVerdict([4_000, 1_000, 3_000, 2_000]).medianMs).toBe(2_500);
  });

  it("pulls streaming ahead when any first turn is over 22 s", () => {
    expect(latencyVerdict([5_000, 5_000, 22_001, 5_000, 5_000]).pullStreamingAhead).toBe(true);
  });
});

describe("mentionsNonce", () => {
  const pastedAt = new Date("2026-09-25T09:13:36.000Z");

  it.each([
    ["the nonce's timestamp", "1. From thread: The thread was exported at 2026-09-25T09:13:36.000Z."],
    ["the nonce's wording", "Guess: Ops pasted at the start of the shift."],
  ])("catches a reply that repeats %s", (_case, reply) => {
    expect(mentionsNonce(reply, pastedAt)).toBe(true);
  });

  it("passes a reply that ignores the nonce", () => {
    expect(mentionsNonce("1. From thread: Customer submits a booking on the portal.", pastedAt)).toBe(false);
  });
});
