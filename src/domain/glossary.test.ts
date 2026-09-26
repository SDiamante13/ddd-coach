import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { V11_EXAMPLE_REPLY } from "../test/v10Replies.ts";
import { keep, keepMessage, keptRowsOf, MAX_KEPT_ROWS, MAX_SENT_ROWS, outgoingGlossary, sourceLabelOf, type KeptRow } from "./glossary.ts";
import { entityId } from "./entityId.ts";
import { parseReply } from "./replyBlocks.ts";

describe("keptRowsOf", () => {
  it("turns every meaning in the reply's word table into a kept row with its date, source and stable ids", () => {
    const rows = keptRowsOf(parseReply(V11_EXAMPLE_REPLY), "2026-09-25", "load 7731");

    expect(rows).toHaveLength(11);
    expect(rows[3]).toEqual({
      id: "meaning:late|carrier desk",
      termId: "term:late",
      word: "late",
      holder: "Carrier desk",
      meaning: "A missed pickup that can incur a carrier late fee.",
      source: "From thread",
      keptOn: "2026-09-25",
      from: "load 7731",
    });
  });
});

describe("sourceLabelOf", () => {
  it.each([
    ["For Customer D load 7731, which count includes it?", "load 7731"],
    ["For Customer B's second same-carrier date change at 11:55 PM, which count includes the old row?", "Customer B"],
    ["Which count should the dashboard show?", "thread of 25 Sep 2026"],
    [undefined, "thread of 25 Sep 2026"],
  ])("labels a keep from %s as %s", (question, label) => {
    expect(sourceLabelOf(question, new Date(2026, 8, 25))).toBe(label);
  });
});

describe("keep", () => {
  const rows = keptRowsOf(parseReply(V11_EXAMPLE_REPLY), "2026-09-25", "load 7731");

  it("adds every new row to an empty glossary", () => {
    expect(keep([], rows)).toEqual({ ok: true, glossary: rows, added: 11, updated: 0 });
  });

  it("changes nothing when the same rows are kept again", () => {
    expect(keep(rows, rows)).toEqual({ ok: true, glossary: rows, added: 0, updated: 0 });
  });

  it("replaces a kept row in place when a later reply gives its word and team a new meaning", () => {
    const changed = { ...rows[3]!, meaning: "A missed delivery appointment under the dedicated-lane contract.", keptOn: "2026-10-02", from: "load 7815" };
    const brandNew = { ...rows[0]!, id: "meaning:pod|billing" as never, termId: "term:pod" as never, word: "POD", holder: "Billing" };

    const result = keep(rows, [changed, brandNew]);

    expect(result).toMatchObject({ ok: true, added: 1, updated: 1 });
    expect(result.ok && result.glossary[3]).toEqual(changed);
    expect(result.ok && result.glossary).toHaveLength(12);
  });

  it("refuses the whole keep when it would take the glossary past its limit", () => {
    const nearlyFull = Array.from({ length: MAX_KEPT_ROWS - 5 }, (_, index) => ({ ...rows[0]!, id: `meaning:w${index}|ops` as never }));

    expect(keep(nearlyFull, rows)).toEqual({ ok: false, reason: "full" });
  });
});

describe("keep, for any rows", () => {
  const row = fc
    .record({ word: fc.constantFrom("late", "on time", "POD"), holder: fc.constantFrom("Ops", "Billing", "Carrier desk"), meaning: fc.constantFrom("a", "b") })
    .map(({ word, holder, meaning }): KeptRow => ({
      id: entityId("meaning", `${word}|${holder}`),
      termId: entityId("term", word),
      ...{ word, holder, meaning, source: "From thread", keptOn: "2026-09-25", from: "load 7731" },
    }));
  const replyRows = fc.uniqueArray(row, { selector: (each) => each.id, maxLength: 9 });

  it("gives the same glossary when the same rows are kept twice, with every id once", () => {
    fc.assert(
      fc.property(fc.array(replyRows, { maxLength: 4 }), replyRows, (earlier, rows) => {
        const before = earlier.reduce<readonly KeptRow[]>((glossary, each) => (keep(glossary, each) as { glossary: readonly KeptRow[] }).glossary, []);
        const once = keep(before, rows);
        const twice = once.ok ? keep(once.glossary, rows) : once;

        expect(twice.ok && twice.glossary).toEqual(once.ok && once.glossary);
        expect(once.ok && new Set(once.glossary.map((kept) => kept.id)).size).toBe(once.ok && once.glossary.length);
      }),
    );
  });
});

describe("keepMessage", () => {
  it.each([
    [{ ok: true, glossary: [], added: 11, updated: 0 }, "Kept 11 rows from load 7731."],
    [{ ok: true, glossary: [], added: 1, updated: 0 }, "Kept 1 row from load 7731."],
    [{ ok: true, glossary: [], added: 2, updated: 1 }, "Updated 1 row and kept 2 new rows from load 7731."],
    [{ ok: true, glossary: [], added: 0, updated: 3 }, "Updated 3 rows from load 7731."],
    [{ ok: true, glossary: [], added: 0, updated: 0 }, "Already kept."],
    [{ ok: false, reason: "full" }, `Your glossary is full (${MAX_KEPT_ROWS} rows). Remove some to keep more.`],
  ] as const)("says %j as %s", (result, message) => {
    expect(keepMessage(result, "load 7731")).toBe(message);
  });
});

describe("outgoingGlossary", () => {
  it("swaps every text field as the rows leave and sends no ids", () => {
    const named = keptRowsOf(parseReply(V11_EXAMPLE_REPLY.replaceAll("Customer D", "Brightline Foods")), "2026-09-25", "Brightline Foods");

    const { sent } = outgoingGlossary(named, [{ from: "Brightline Foods", to: "Customer D" }]);

    expect(sent[6]).toEqual({
      word: "weekly late report",
      holder: "Billing",
      meaning: "The basis for service credits and Customer D's Q3 on-time percentage.",
      source: "From thread",
      keptOn: "2026-09-25",
      from: "Customer D",
    });
  });

  it("sends the newest kept rows up to the limit and names the older ones it leaves out", () => {
    const base = keptRowsOf(parseReply(V11_EXAMPLE_REPLY), "2026-09-25", "load 7731")[0]!;
    const rowOn = (day: string, index: number): KeptRow => ({ ...base, id: `meaning:w${index}|ops` as never, word: `w${index}`, keptOn: day });
    const older = rowOn("2026-09-20", 0);
    const rows = [older, ...Array.from({ length: MAX_SENT_ROWS }, (_, index) => rowOn("2026-09-25", index + 1))];

    const { sent, left } = outgoingGlossary(rows, []);

    expect(sent).toHaveLength(MAX_SENT_ROWS);
    expect(sent.map((row) => row.word)).not.toContain("w0");
    expect(left).toEqual([older]);
  });

  it("counts a row kept later on the same day as newer", () => {
    const base = keptRowsOf(parseReply(V11_EXAMPLE_REPLY), "2026-09-25", "load 7731")[0]!;
    const rows = Array.from({ length: MAX_SENT_ROWS + 1 }, (_, index): KeptRow => ({ ...base, id: `meaning:w${index}|ops` as never, word: `w${index}` }));

    expect(outgoingGlossary(rows, []).left.map((row) => row.word)).toEqual(["w0"]);
  });
});
