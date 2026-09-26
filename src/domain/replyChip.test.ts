import { describe, expect, it } from "vitest";
import { chipLabel } from "./replyChip.ts";

describe("chipLabel (#95)", () => {
  it.each([
    [{ added: 5, updated: 0, already: 0 }, "← 5 new on the board"],
    [{ added: 2, updated: 1, already: 1 }, "← 2 new on the board · 1 updated · 1 already there"],
    [{ added: 2, updated: 0, already: 1 }, "← 2 new on the board · 1 already there"],
    [{ added: 0, updated: 1, already: 0 }, "← 1 updated on the board"],
    [{ added: 0, updated: 1, already: 2 }, "← 1 updated on the board · 2 already there"],
    [{ added: 0, updated: 0, already: 3 }, "← 3 already on the board"],
  ])("words %j as %s", (counts, label) => {
    expect(chipLabel(counts)).toBe(label);
  });
});
