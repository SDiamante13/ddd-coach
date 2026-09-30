import { describe, expect, it } from "vitest";
import { chipNameOf, chipTextOf } from "./NewEventsChip.tsx";

describe("the new-events chip's words", () => {
  it.each([
    [{ added: 2, updated: 0 }, "2 new ▸", "Show the 2 new events"],
    [{ added: 0, updated: 1 }, "1 updated ▸", "Show the 1 updated event"],
    [{ added: 2, updated: 1 }, "2 new · 1 updated ▸", "Show the 2 new and 1 updated events"],
  ])("says %o as %s", (counts, text, name) => {
    expect(chipTextOf(counts)).toBe(text);
    expect(chipNameOf(counts)).toBe(name);
  });
});
