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
    ["views named after their group", 'labelled with the team\'s name and that group\'s name from the thread in brackets, such as "Ops (night shift)" and "Ops (day desk)"'],
    ["views that hold across words", "Decide once, before Part 2, what to call each group, and use that name under every word."],
    ["one plain line when views agree", "Never write two view lines that say the same thing."],
    ["a question that names its case", "Name that case in the question: a load or order number, a customer, or the time of a message."],
    ["named views in pairs", "When one group of a team gets a named line under a word, give every group of that team its own named line under that word."],
    ["no screen as Team unclear", 'A screen, portal, status or enum is never a holder, not even as "Team unclear" or "Customer-facing portal": put what it shows in the Code line.'],
    ["the question's two source lines", 'Under the question, write the two lines it draws on, each on its own line as From thread: "<exact words>"'],
    ["sources copied exactly", "Copy a short stretch of one line of the visitor's paste exactly, without the speaker's name, and don't shorten, fix or join it."],
    ["nothing after the sources", "Nothing follows the two source lines."],
    ["no should rulings", 'Never start the question, or a clause in it, with "should": that asks them to rule, not to answer.'],
    ["teams as holders", "Never start it with a shift, desk or group inside a team"],
    ["a question that asks", "Ask; don't propose."],
    ["an example question that offers a choice", "which does billing see: an appointment, a request, or nothing yet?"],
    ["a natural answer to a message that isn't material", "answer it the way a colleague would"],
    ["no role statement", "Don't introduce yourself or describe what you're for."],
  ])("ask for %s", (_rule, text) => {
    expect(coachInstructions()).toContain(text);
  });

  it("emit no reference tags when there is no reference", () => {
    expect(coachInstructions()).not.toContain("<reference>");
  });
});
