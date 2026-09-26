// @vitest-environment node
import { describe, expect, it } from "vitest";
import { driftNamed, noFalseDrift, settledNotReAsked } from "./glossaryChecks.ts";

const LATE = '- "late": Carrier desk here means a missed delivery appointment; you kept: a missed pickup (kept 25 Sep 2026 from load 7731).';
const expectLate = { drift: ["late"], keptFrom: ["load 7731"] };

describe("driftNamed", () => {
  it("passes a drift line for each expected word that names where it was kept", () => {
    expect(driftNamed([LATE], expectLate)).toBe(true);
  });

  it("fails when an expected drift has no line", () => {
    expect(driftNamed([], expectLate)).toBe(false);
  });

  it("fails a drift line that doesn't say where the kept meaning came from", () => {
    expect(driftNamed([LATE.replace("load 7731", "an earlier thread")], expectLate)).toBe(false);
  });
});

describe("noFalseDrift", () => {
  it.each([
    ["an expected drift", [LATE], expectLate, true],
    ["no drift where none is expected", [], {}, true],
    ["a drift on a word that didn't change", [LATE.replace('"late"', '"on time"')], expectLate, false],
    ["any drift when no glossary was kept", [LATE], {}, false],
    ["a drift line it can't read", ["- late changed a bit."], expectLate, false],
  ])("judges %s", (_case, lines, expected, passes) => {
    expect(noFalseDrift(lines, expected)).toBe(passes);
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
