// @vitest-environment node
import { describe, expect, it } from "vitest";
import { parseChatRequest } from "./chatRequest.ts";

function turns(count: number) {
  return Array.from({ length: count }, () => ({ prompt: "A", reply: "R" }));
}

function turnOfLength(characters: number) {
  return { prompt: "A", reply: "R".repeat(characters - 1) };
}

describe("parseChatRequest", () => {
  it("reads the message and its history as a conversation", () => {
    expect(parseChatRequest({ message: " B ", history: [{ prompt: "A", reply: "R1" }] })).toEqual({
      ok: true,
      conversation: { history: [{ prompt: "A", reply: "R1" }], prompt: "B" },
    });
  });

  it("refuses more than 50 history turns as too long", () => {
    expect(parseChatRequest({ message: "B", history: turns(51) })).toEqual({ ok: false, reason: "tooLong" });
  });

  it("refuses an oversized history as too long before checking its turns", () => {
    const history = Array.from({ length: 51 }, () => "not a turn");

    expect(parseChatRequest({ message: "B", history })).toEqual({ ok: false, reason: "tooLong" });
  });

  it("refuses more than 24,000 characters across the history and message as too long", () => {
    const history = [turnOfLength(23_999)];

    expect(parseChatRequest({ message: "BC", history })).toEqual({ ok: false, reason: "tooLong" });
  });

  it("accepts 50 turns and 24,000 characters exactly", () => {
    const history = [...turns(49), turnOfLength(24_000 - 49 * 2 - 1)];

    expect(parseChatRequest({ message: "B", history }).ok).toBe(true);
  });
});
