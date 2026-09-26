// @vitest-environment node
import { describe, expect, it } from "vitest";
import { driftNamed, noFalseDrift, settledNotReAsked } from "./glossaryChecks.ts";

const kept = (holder: string, meaning: string) => ({ word: "late", holder, meaning, source: "From thread" as const, keptOn: "2026-09-25", from: "load 7731" });
const GLOSSARY = [kept("Carrier desk", "A missed pickup that can incur a carrier late fee."), kept("Ops (day desk)", "A truck not at pickup by the end of the pickup window.")];
const LATE = '- "late": Carrier desk here means a missed delivery appointment; you kept: "A missed pickup that can incur a carrier late fee." (kept 25 Sep 2026 from load 7731).';
const AGREEING = '- "late": Ops (day desk) here means a truck that misses the pickup window; you kept: "A truck not at pickup by the end of the pickup window." (kept 25 Sep 2026 from load 7731).';
const expectLate = { drift: [{ word: "late", holder: "Carrier desk" }], keptFrom: ["load 7731"] };

describe("driftNamed", () => {
  it("passes a drift line for each contradicted row that quotes it and names where it was kept", () => {
    expect(driftNamed([LATE], expectLate, GLOSSARY)).toBe(true);
  });

  it.each([
    ["without its end stop", '"A missed pickup that can incur a carrier late fee"'],
    ["in another case", '"a missed pickup that can incur a Carrier late fee."'],
    ["with other spacing", '"A missed pickup  that can\tincur a carrier late fee. "'],
    ["in curly quotes, ending in other punctuation", "“A missed pickup that can incur a carrier late fee;”"],
  ])("accepts the kept quote %s, normalised as entity ids are", (_case, quote) => {
    expect(driftNamed([LATE.replace('"A missed pickup that can incur a carrier late fee."', quote)], expectLate, GLOSSARY)).toBe(true);
  });

  it("fails when an expected drift has no line", () => {
    expect(driftNamed([], expectLate, GLOSSARY)).toBe(false);
  });

  it("fails a drift line that doesn't say where the kept meaning came from", () => {
    expect(driftNamed([LATE.replace("load 7731", "an earlier thread")], expectLate, GLOSSARY)).toBe(false);
  });

  it.each([
    ["quotes a kept row the thread agrees with", AGREEING],
    ["paraphrases the contradicted row", LATE.replace('"A missed pickup that can incur a carrier late fee."', '"a missed pickup with a late fee"')],
    ["doesn't quote the kept meaning", LATE.replace('"A missed pickup that can incur a carrier late fee."', "a missed pickup that can incur a carrier late fee")],
  ])("fails a drift line that %s", (_case, line) => {
    expect(driftNamed([line], expectLate, GLOSSARY)).toBe(false);
  });
});

describe("noFalseDrift", () => {
  it.each([
    ["an expected drift", [LATE], expectLate, GLOSSARY, true],
    ["no drift where none is expected", [], {}, [], true],
    ["a drift at a kept row the thread agrees with", [LATE, AGREEING], expectLate, GLOSSARY, false],
    ["a drift on a word that didn't change", [LATE.replace('"late"', '"on time"')], expectLate, GLOSSARY, false],
    ["any drift when no glossary was kept", [LATE], {}, [], false],
    ["a drift line it can't read", ["- late changed a bit."], expectLate, GLOSSARY, false],
  ])("judges %s", (_case, lines, expected, glossary, passes) => {
    expect(noFalseDrift(lines, expected, glossary)).toBe(passes);
  });
});

describe("settledNotReAsked", () => {
  const settled = { settled: [["on time", "on-time"]] };

  it.each([
    ["asks about what changed", "For load 7815, which POD does Billing accept: the signed paper or the app photo?", true],
    ["re-asks a settled word", "For load 7815, what counts as on time for Customer D?", false],
    ["re-asks it in another spelling", "For load 7815, is the On-Time rule the delivery appointment?", false],
    ["only contains it inside another word", "For load 7815, which ontimeliness metric applies?", true],
  ])("judges a question that %s", (_case, question, passes) => {
    expect(settledNotReAsked(question, settled)).toBe(passes);
  });

  it("passes any question when nothing is settled", () => {
    expect(settledNotReAsked("What counts as on time?", {})).toBe(true);
  });
});
