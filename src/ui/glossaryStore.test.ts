import { describe, expect, it } from "vitest";
import { keptRowsOf, MAX_KEPT_ROWS } from "../domain/glossary.ts";
import { parseReply } from "../domain/replyBlocks.ts";
import { V11_EXAMPLE_REPLY } from "../test/v10Replies.ts";
import { keepGlossary, keptGlossary } from "./glossaryStore.ts";

const KEY = "ddd-coach.glossary.v1";
const rows = keptRowsOf(parseReply(V11_EXAMPLE_REPLY), "2026-09-25", "load 7731");

describe("glossaryStore", () => {
  it("reads back what it kept", () => {
    keepGlossary(rows);

    expect(keptGlossary()).toEqual(rows);
  });

  it("reads a value from an unknown future version as empty", () => {
    localStorage.setItem(KEY, JSON.stringify({ version: 2, rows }));

    expect(keptGlossary()).toEqual([]);
  });

  it("drops rows that aren't kept rows and keeps the rest", () => {
    const broken = [{ ...rows[0], source: "Rumour" }, { ...rows[1], keptOn: "yesterday" }, { word: "late" }, "late", null];
    localStorage.setItem(KEY, JSON.stringify({ version: 1, rows: [...broken, rows[2]] }));

    expect(keptGlossary()).toEqual([rows[2]]);
  });

  it("reads no more than the glossary's limit", () => {
    const many = Array.from({ length: MAX_KEPT_ROWS + 3 }, (_, index) => ({ ...rows[0]!, id: `meaning:w${index}|ops` }));
    localStorage.setItem(KEY, JSON.stringify({ version: 1, rows: many }));

    expect(keptGlossary()).toHaveLength(MAX_KEPT_ROWS);
  });

  it("reads anything that isn't valid JSON as empty", () => {
    localStorage.setItem(KEY, "{not json");

    expect(keptGlossary()).toEqual([]);
  });
});
