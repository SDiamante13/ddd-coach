// @vitest-environment node
import { describe, expect, it } from "vitest";
import { EXAMPLE_THREAD } from "../../src/shared/exampleThread.ts";
import { FIXTURE_NAMES, loadFixture } from "./fixtures.ts";
import { keptGlossaryFixture } from "./keptGlossaryFixture.ts";

describe("eval fixtures", () => {
  it("check the example thread visitors can try, from its one shared source", () => {
    expect(loadFixture("example-thread").thread).toBe(EXAMPLE_THREAD);
  });

  it("hold a greeting, DDD questions and a one-line note to the non-thread checks, with what grounding expects (#58)", () => {
    const nonThread = FIXTURE_NAMES.map(loadFixture).filter(({ key }) => key.expect.nonThread);

    expect(nonThread.map(({ thread, key }) => [thread.trim(), key.expect])).toEqual([
      ["hi", { nonThread: true }],
      ["what is DDD?", { nonThread: true }],
      ["Just trying this out before the next talk.", { nonThread: true }],
      ["What's a bounded context?", { nonThread: true, cites: ["Bounded Context"] }],
      ["How do I run an Event Storming workshop?", { nonThread: true, notCovered: true }],
    ]);
  });

  it.each([["kept-drift"], ["kept-steady"]])("gives %s the glossary kept from the recorded v11 example reply, in wire shape (#100)", (name) => {
    const { glossary } = loadFixture(name);

    expect(glossary).toEqual(keptGlossaryFixture());
    expect(glossary).toHaveLength(11);
    expect(glossary?.[3]).toEqual({
      word: "late",
      holder: "Carrier desk",
      meaning: "A missed pickup that can incur a carrier late fee.",
      source: "From thread",
      keptOn: "2026-09-25",
      from: "load 7731",
    });
  });
});
