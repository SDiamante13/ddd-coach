import { describe, expect, it } from "vitest";
import { entityId } from "./entityId.ts";
import type { ExchangeId } from "./exchange.ts";
import type { RowCheck } from "./rowChecks.ts";
import { rowFactsOf } from "./rowFacts.ts";
import type { WordsLane } from "./words.ts";

const e1 = "e1" as ExchangeId;
const billing = entityId("meaning", "late|Company B billing");
const lane: WordsLane = {
  terms: [{ id: entityId("term", "late"), word: "late", placedBy: e1, rows: [{ id: billing, holder: "Company B billing", meaning: "Past the appointment.", correctedFrom: "On the late report.", provenance: "thread", line: null, placedBy: e1, changedBy: e1 }] }],
  latest: e1,
};
const shown = (text: string) => text.replace("Company B", "Acme");

describe("rowFactsOf", () => {
  it("states a row's check and the visitor's wording under the names the export shows", () => {
    const checks = new Map<typeof billing, RowCheck>([[billing, { verdict: "holds", where: "Company B contract §4", at: "2026-10-01" }]]);

    const { rowOf } = rowFactsOf(lane, checks, shown);

    expect(rowOf!("late", "Acme billing")).toEqual({ status: "checked by you, 1 Oct 2026, Acme contract §4", meaning: "Past the appointment." });
  });
});
