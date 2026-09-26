// @vitest-environment node
import { describe, expect, it } from "vitest";
import { MAX_MESSAGE_CHARS } from "../src/shared/chatContract.ts";
import { GLOSSARY_ENABLED } from "../src/shared/features.ts";
import { MAX_CONVERSATION_CHARS, parseChatRequest } from "./chatRequest.ts";

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
      conversation: { history: [{ prompt: "A", reply: "R1", signature: "" }], prompt: "B", glossary: [] },
    });
  });

  it("refuses more than 50 history turns as too long", () => {
    expect(parseChatRequest({ message: "B", history: turns(51) })).toEqual({ ok: false, reason: "tooLong" });
  });

  it("refuses an oversized history as too long before checking its turns", () => {
    const history = Array.from({ length: 51 }, () => "not a turn");

    expect(parseChatRequest({ message: "B", history })).toEqual({ ok: false, reason: "tooLong" });
  });

  it("refuses more characters than the conversation cap across the history and message as too long", () => {
    const history = [turnOfLength(MAX_CONVERSATION_CHARS - 1)];

    expect(parseChatRequest({ message: "BC", history })).toEqual({ ok: false, reason: "tooLong" });
  });

  it("accepts 50 turns at the conversation cap exactly", () => {
    const history = [...turns(49), turnOfLength(MAX_CONVERSATION_CHARS - 49 * 2 - 1)];

    expect(parseChatRequest({ message: "B", history }).ok).toBe(true);
  });

  it("accepts a message at the per-message limit", () => {
    expect(parseChatRequest({ message: "M".repeat(MAX_MESSAGE_CHARS), history: [] }).ok).toBe(true);
  });
});

describe("parseChatRequest, kept glossary (#100)", () => {
  const row = { word: "late", holder: "Carrier desk", meaning: "A missed pickup that can incur a carrier late fee.", source: "From thread", keptOn: "2026-09-25", from: "load 7731" };

  it.skipIf(!GLOSSARY_ENABLED)("reads the kept glossary rows sent with the message", () => {
    const result = parseChatRequest({ message: "Next week's thread", history: [], glossary: [row] });

    expect(result.ok && result.conversation.glossary).toEqual([row]);
  });

  it.skipIf(!GLOSSARY_ENABLED).each([
    ["a glossary that isn't a list", "late"],
    ["a row without a meaning", [{ ...row, meaning: "" }]],
    ["a row with an unknown source", [{ ...row, source: "Rumour" }]],
    ["a row kept on no real day", [{ ...row, keptOn: "yesterday" }]],
  ])("refuses %s as malformed", (_case, glossary) => {
    expect(parseChatRequest({ message: "Next", history: [], glossary })).toEqual({ ok: false, reason: "malformed" });
  });

  it.each([
    ["more rows than are ever sent", Array.from({ length: 61 }, () => row)],
    ["a field longer than a kept row holds", [{ ...row, meaning: "x".repeat(301) }]],
  ])("refuses %s as a glossary too big to send", (_case, glossary) => {
    expect(parseChatRequest({ message: "Next", history: [], glossary })).toEqual({ ok: false, reason: "glossaryTooLong" });
  });

  it.skipIf(!GLOSSARY_ENABLED)("counts the glossary toward the conversation's size", () => {
    const glossary = [{ ...row, meaning: "m".repeat(300) }];
    const fits = { message: "x".repeat(20_000), history: [{ prompt: "p".repeat(20_000), reply: "r".repeat(MAX_CONVERSATION_CHARS - 40_100) }] };

    expect(parseChatRequest(fits).ok).toBe(true);
    expect(parseChatRequest({ ...fits, glossary })).toEqual({ ok: false, reason: "tooLong" });
  });
});
