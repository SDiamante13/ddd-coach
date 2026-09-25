// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fakeChat } from "../test/fakeChat.ts";
import { firstTurnLatency, latencySpike } from "./latencySpike.ts";

const config = { apiKey: "sk-or-test-key", model: "test/model" };
const THREAD = "Dana (8:30): the load is still on hold.";

describe("latencySpike", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-25T08:30:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not report a reply that quotes a thread time equal to the nonce minute", async () => {
    const { chat } = fakeChat(() => "1. From thread: At 8:30 the load is on hold.");

    const spike = await latencySpike(config, chat, THREAD);

    expect(spike.nonceMentions).toEqual([]);
  });

  it("records on every call the time its first turn was pasted, so a later re-score can find the nonce", async () => {
    const { chat } = fakeChat(() => "1. From thread: The load is on hold.");

    const spike = await latencySpike(config, chat, THREAD);

    expect(spike.calls.map((call) => call.pastedAt)).toEqual(Array(11).fill("2026-09-25T08:30:00.000Z"));
  });
});

describe("firstTurnLatency", () => {
  it("times n uncached first turns only, each with its own nonce, and gives the latency verdict", async () => {
    const { chat, sent } = fakeChat(() => "1. From thread: The load is on hold.");

    const result = await firstTurnLatency(config, chat, THREAD, 5);

    expect(result.calls.map((call) => call.label)).toEqual(["run 1", "run 2", "run 3", "run 4", "run 5"]);
    expect(sent.every((messages) => String(messages.at(-1)?.content).startsWith("(Pasted at "))).toBe(true);
    expect(result.verdict.pullStreamingAhead).toBe(false);
  });
});
