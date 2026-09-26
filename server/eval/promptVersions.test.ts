// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { COACH_INSTRUCTIONS_VERSION, coachInstructions } from "../coachInstructions.ts";
import { systemPrompt } from "../systemPrompt.ts";
import { instructionsOf } from "./promptVersions.ts";

describe("instructionsOf", () => {
  it("gives the current version as the prompt the coach sends", () => {
    expect(instructionsOf(COACH_INSTRUCTIONS_VERSION)).toBe(systemPrompt());
  });

  it("gives an earlier version as its snapshot, byte for byte", () => {
    const v6 = readFileSync(new URL("../__snapshots__/coach-instructions.v6.txt", import.meta.url), "utf8");

    expect(instructionsOf(6)).toBe(v6);
  });

  it("refuses a version with no snapshot", () => {
    expect(() => instructionsOf(99)).toThrow("No snapshot of coach instructions v99");
  });

  it("refuses a current-version snapshot that no longer matches the prompt", () => {
    const stale = () => "an older draft of the current prompt";

    expect(() => instructionsOf(COACH_INSTRUCTIONS_VERSION, stale)).toThrow(
      `The v${COACH_INSTRUCTIONS_VERSION} snapshot is stale; run npm test`,
    );
  });
});
