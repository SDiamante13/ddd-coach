import { describe, expect, it } from "vitest";
import { applySwaps, removeSwap, type SwapList } from "./swaps.ts";

const swaps = (...pairs: [string, string][]): SwapList => pairs.map(([from, to]) => ({ from, to }));

describe("applySwaps", () => {
  it("replaces a listed word with its placeholder", () => {
    expect(applySwaps(swaps(["Acme", "Customer A"]), "Acme is late").text).toBe("Customer A is late");
  });

  it("replaces whole words only", () => {
    expect(applySwaps(swaps(["Tom", "Finance"]), "Tomorrow Tom calls").text).toBe("Tomorrow Finance calls");
  });

  it("replaces a listed word in any case with the placeholder as typed", () => {
    expect(applySwaps(swaps(["Acme", "Customer A"]), "ACME is late").text).toBe("Customer A is late");
  });

  it("prefers the longest listed words", () => {
    const list = swaps(["Acme", "Customer A"], ["Acme Foods", "Customer B"]);
    expect(applySwaps(list, "Acme Foods is late").text).toBe("Customer B is late");
  });

  it("never swaps a placeholder again", () => {
    const list = swaps(["A Co", "B Co"], ["B Co", "C Co"]);
    expect(applySwaps(list, "A Co and B Co").text).toBe("B Co and C Co");
  });

  it("treats regex characters in a listed word literally", () => {
    const list = swaps(["C++ team", "Team 1"], ["A.B. Freight", "Carrier 1"], ["Dry-Van Co", "Carrier 2"]);
    expect(applySwaps(list, "C++ team asks A.B. Freight and Dry-Van Co, not AxBx Freight").text).toBe(
      "Team 1 asks Carrier 1 and Carrier 2, not AxBx Freight",
    );
  });

  it("marks where each placeholder sits in the swapped text", () => {
    const list = swaps(["Acme", "Customer A"], ["Laredo", "Lane 1"]);
    expect(applySwaps(list, "Acme: Laredo and ACME").spans).toEqual([
      { start: 0, end: 10 },
      { start: 12, end: 18 },
      { start: 23, end: 33 },
    ]);
  });

  it.each([
    "",
    " ",
    "Acme",
    "Acme is late",
    "  padded  ",
    "line one\nline two",
    "\t\ttabs",
    "C++ (team) [x] {y} $1 ^a|b",
    "Ünïcödé naïve café",
    "日本語のテキスト",
    "emoji 🚚📦",
    "a.b.c",
    "Tom's Tomorrow",
    "$&$1$'",
    "\\backslash\\",
    "123 456-7890",
    "ALL CAPS",
    "mixed Case",
    "trailing newline\n",
    "x".repeat(500),
  ])("leaves %j unchanged with no swaps", (text) => {
    expect(applySwaps([], text)).toEqual({ text, spans: [] });
  });
});

describe("removeSwap", () => {
  it("drops the swap for a listed word and keeps the rest", () => {
    const list = swaps(["Acme", "Customer A"], ["Laredo", "Lane 1"]);
    expect(removeSwap(list, "Acme")).toEqual(swaps(["Laredo", "Lane 1"]));
  });
});
