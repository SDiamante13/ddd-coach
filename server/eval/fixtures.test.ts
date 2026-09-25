// @vitest-environment node
import { describe, expect, it } from "vitest";
import { EXAMPLE_THREAD } from "../../src/shared/exampleThread.ts";
import { FIXTURE_NAMES, firstTurnOf, loadFixture } from "./fixtures.ts";

describe("eval fixtures", () => {
  it("check the example thread visitors can try, from its one shared source", () => {
    expect(loadFixture("example-thread").thread).toBe(EXAMPLE_THREAD);
  });

  it("hold a visitor's greeting, a DDD question and a one-line note to the non-thread checks", () => {
    const nonThread = FIXTURE_NAMES.map(loadFixture).filter(({ key }) => key.expect.nonThread);

    expect(nonThread.map(({ thread }) => thread.trim())).toEqual([
      "hi",
      "what is DDD?",
      "Just trying this out before the next talk.",
    ]);
  });

  it("start a thread's first turn with a nonce line, as hosted first turns do", () => {
    const fixture = loadFixture("rebook-notes");

    expect(firstTurnOf(fixture, "a1b2")).toBe(`Nonce a1b2.\n${fixture.thread.trim()}`);
  });

  it("leave a message that isn't a thread exactly as a visitor types it", () => {
    expect(firstTurnOf(loadFixture("greeting"), "a1b2")).toBe("hi");
  });
});
