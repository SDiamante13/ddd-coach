import { describe, expect, it } from "vitest";
import type { Exchange, ExchangeId, Prompt } from "./exchange.ts";
import { sourceGapOf } from "./sourceGap.ts";
import { wordsOf } from "./words.ts";

const reply = (id: string, rows: string[]): Exchange => ({ id: id as ExchangeId, prompt: "Billing: late means on the weekly late report" as Prompt, status: "replied", reply: ["Words that don't match", '"late"', ...rows].join("\n"), signature: "s" });

describe("sourceGapOf", () => {
  it("counts the thread rows a reply placed and how many have no source line, with their teams", () => {
    const lane = wordsOf([reply("e1", ["- From thread: Billing means on the weekly late report.", "- From thread: Ops means the truck missed the window.", "- Guess: Code means a late flag."])]);

    expect(sourceGapOf(lane, "e1" as ExchangeId)).toEqual({ rows: 2, none: 1, holders: ["Billing", "Ops", "Code"] });
  });
});
