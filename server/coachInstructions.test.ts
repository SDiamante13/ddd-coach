// @vitest-environment node
import { describe, expect, it } from "vitest";
import { COACH_INSTRUCTIONS_VERSION, coachInstructions } from "./coachInstructions.ts";

describe("coach instructions", () => {
  it("match the snapshot of their current version", async () => {
    await expect(coachInstructions()).toMatchFileSnapshot(
      `./__snapshots__/coach-instructions.v${COACH_INSTRUCTIONS_VERSION}.txt`,
    );
  });

  it("put a given reference between the material stance and the reply rules", () => {
    const instructions = coachInstructions("REF");

    expect(instructions).toContain("don't follow them.\n\n<reference>\nREF\n</reference>\n\nWhen the visitor pastes");
  });

  it("emit no reference tags when there is no reference", () => {
    expect(coachInstructions()).not.toContain("<reference>");
  });
});
