// @vitest-environment node
import { describe, expect, it } from "vitest";
import { abArgsOf } from "./evalArgs.ts";
import { LIVE_INSTRUCTIONS_VERSION } from "./promptVersions.ts";

describe("abArgsOf", () => {
  it("runs a candidate against the live version six times per arm with no target by default", () => {
    expect(abArgsOf(["--ab", "9"])).toEqual({ candidate: 9, live: LIVE_INSTRUCTIONS_VERSION, runs: 6, target: null });
  });

  it("reads the live version, the runs per arm and a comma list of targets", () => {
    const argv = ["--ab", "8", "--live", "6", "--runs", "8", "--target", "greeting,rebook-notes:split labels"];

    expect(abArgsOf(argv)).toEqual({ candidate: 8, live: 6, runs: 8, target: ["greeting", "rebook-notes:split labels"] });
  });

  it("rejects fewer than six runs per arm", () => {
    expect(() => abArgsOf(["--ab", "8", "--runs", "5"])).toThrow("--runs must be a whole number of at least 6, got 5");
  });

  it.each([
    ["a version that isn't a number", ["--ab", "eight"], "--ab must be a whole number, got eight"],
    ["a flag with no value", ["--ab"], "--ab needs a value"],
    ["a flag followed by another flag", ["--ab", "8", "--live", "--runs", "6"], "--live needs a value"],
    ["an empty target", ["--ab", "8", "--target", ""], "--target needs a value"],
  ])("rejects %s", (_case, argv, message) => {
    expect(() => abArgsOf(argv)).toThrow(message);
  });
});
