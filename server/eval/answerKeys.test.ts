// @vitest-environment node
import { describe, expect, it } from "vitest";
import { fixtureShaOf, keyChanges, keyShaOf } from "./answerKeys.ts";
import { loadFixture } from "./fixtures.ts";

describe("keyChanges", () => {
  it("names only the fixtures whose answer key changed since the run", () => {
    const recorded = { greeting: "aaa", "example-thread": "bbb", "booking-split": "ccc" };
    const current = { greeting: "aaa", "example-thread": "b2b", "booking-split": "ccc" };

    expect(keyChanges(recorded, current)).toEqual(["example-thread"]);
  });
});

describe("fixtureShaOf", () => {
  it("keeps a fixture's key sha when it has no glossary, so older records don't read as changed", () => {
    const { key } = loadFixture("example-thread");

    expect(fixtureShaOf({ key })).toBe(keyShaOf(key));
  });

  it("changes when a fixture's kept glossary changes, so a glossary edit can't pass silently (#100)", () => {
    const { key, glossary } = loadFixture("kept-drift");

    expect(fixtureShaOf({ key, glossary })).not.toBe(fixtureShaOf({ key, glossary: glossary!.slice(1) }));
  });
});
