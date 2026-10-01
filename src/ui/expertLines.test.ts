import { describe, expect, it } from "vitest";
import { entityId } from "../domain/entityId.ts";
import type { ExchangeId } from "../domain/exchange.ts";
import type { WordsLane } from "../domain/words.ts";
import { expertLinesOf } from "./expertLines.ts";
import type { Hotspot } from "./hotspot.ts";

const e1 = "e1" as ExchangeId;
const term = entityId("term", "late");
const row = entityId("meaning", "late|Billing");
const words: WordsLane = {
  terms: [{ id: term, word: "late", placedBy: e1, rows: [{ id: row, holder: "Billing", meaning: "Company A counts it late.", provenance: "thread", line: null, placedBy: e1, changedBy: e1 }] }],
  latest: e1,
};
const hotspot: Hotspot = { id: entityId("question", "q"), text: "q", links: [], rows: [{ term, row, word: "late", holder: "Billing" }], unplaced: [], askedIn: e1 };
const restoreNames = (text: string) => ({ text: text.replace("Company A", "Acme Foods"), spans: [] });

describe("expertLinesOf", () => {
  it("keeps a restored name's capital at the start of the meaning", () => {
    const expert = expertLinesOf(hotspot, "the billing lead", words, new Map(), restoreNames);

    expect(expert!.lines[0]!.text).toBe("Does Billing's “late” still mean: Acme Foods counts it late?");
  });
});
