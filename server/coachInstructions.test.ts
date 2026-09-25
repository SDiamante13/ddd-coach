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

  it.each([
    ["views that hold across words", "Decide once, before Part 2: view A is the group that appears first in the material"],
    ["one plain line when views agree", "Never write view A and view B lines that say the same thing."],
    ["no view per word for one meaning", "Don't write a view A line that gives one group's word and a view B line that gives the other's"],
    ["no screen as a holder", "A screen or system, such as the patient portal, isn't a holder either"],
    ["teams as holders", "Never start it with a shift, desk or group inside a team"],
    ["a question that asks", "Ask; don't propose."],
    ["an example question that offers a choice", "which does billing see: an appointment, a request, or nothing yet?"],
  ])("ask for %s", (_rule, text) => {
    expect(coachInstructions()).toContain(text);
  });

  it("emit no reference tags when there is no reference", () => {
    expect(coachInstructions()).not.toContain("<reference>");
  });
});
