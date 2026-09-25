import { describe, expect, it } from "vitest";
import { addSwap, applySwaps, madeUpPlaceholders, placeholderClash, removeSwap, type SwapList } from "./swaps.ts";

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

describe("addSwap", () => {
  it("adds a swap without surrounding spaces", () => {
    expect(addSwap([], "  Acme Foods ", " Customer A  ")).toEqual({ ok: true, list: swaps(["Acme Foods", "Customer A"]) });
  });

  it("refuses a blank word to replace", () => {
    expect(addSwap([], "  ", "Customer A")).toEqual({ ok: false, field: "from", reason: "Enter a word to replace." });
  });

  it("refuses a blank placeholder", () => {
    expect(addSwap([], "Acme", " ")).toEqual({ ok: false, field: "to", reason: "Enter a placeholder." });
  });

  it("refuses a word to replace shorter than 2 characters", () => {
    expect(addSwap([], " A ", "Customer A")).toEqual({
      ok: false,
      field: "from",
      reason: "Use at least 2 characters, so common letters aren't swapped.",
    });
  });

  it("refuses a placeholder that is the word itself in any case", () => {
    expect(addSwap([], "Acme", "ACME")).toEqual({
      ok: false,
      field: "to",
      reason: "Pick a placeholder that differs from the word.",
    });
  });

  it("replaces the placeholder of a word already listed in any case", () => {
    const list = swaps(["Acme", "Customer A"], ["Laredo", "Lane 1"]);
    expect(addSwap(list, "ACME", "Customer B")).toEqual({
      ok: true,
      list: swaps(["Laredo", "Lane 1"], ["ACME", "Customer B"]),
    });
  });

  it("refuses a 51st swap but still updates a listed one", () => {
    const full = swaps(...Array.from({ length: 50 }, (_, i): [string, string] => [`Name ${i}`, `Person ${i}`]));

    expect(addSwap(full, "Acme", "Customer A")).toEqual({
      ok: false,
      field: "from",
      reason: "You can keep up to 50 swaps. Remove one to add another.",
    });
    expect(addSwap(full, "Name 0", "Person X").ok).toBe(true);
  });
});

describe("placeholderClash", () => {
  it("flags a placeholder the thread already uses", () => {
    expect(placeholderClash("Ops", "Maya asked ops to rebook")).toBe("in-thread");
  });

  it("accepts a made-up placeholder the thread doesn't use, even inside a longer word", () => {
    expect(placeholderClash("Person 1", "Maya asked Person 12 to rebook")).toBeNull();
  });

  it.each(["Ops", "finance", "Night desk", "Dispatch", "Sales"])("flags %j as a team or role name", (to) => {
    expect(placeholderClash(to, "")).toBe("role-name");
  });

  it("says nothing about a blank placeholder", () => {
    expect(placeholderClash("", "Maya asked ops, then Finance.")).toBeNull();
  });
});

describe("madeUpPlaceholders", () => {
  it("suggests the first customer letter and person number the thread and list don't use", () => {
    const list = swaps(["Acme", "Customer A"], ["Maya", "Person 1"]);
    expect(madeUpPlaceholders(list, "Customer B asked Person 2")).toEqual(["Customer C", "Person 3"]);
  });
});
