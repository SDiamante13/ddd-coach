// @vitest-environment node
import { describe, expect, it } from "vitest";
import { parseCoachReply } from "./replyLayout.ts";

const REPLY = [
  "Events, in order",
  "1. From thread: The customer hits submit.",
  "",
  "Words that don't match",
  '"booking"',
  "- From thread: Ops means the request from submit onward.",
  "- Guess: Code inserts a new row on every rebook.",
  "",
  "Question for the ops lead and the finance controller, at the 27 Oct review: Is a rebook a new booking?",
].join("\n");

describe("parseCoachReply", () => {
  it("reads the events, each word with its meanings, and the question's roles", () => {
    expect(parseCoachReply(REPLY)).toEqual({
      events: ["From thread: The customer hits submit."],
      words: [
        {
          word: "booking",
          meanings: ["From thread: Ops means the request from submit onward.", "Guess: Code inserts a new row on every rebook."],
        },
      ],
      question: { roles: "the ops lead and the finance controller, at the 27 Oct review", text: "Is a rebook a new booking?" },
    });
  });

  it("returns nothing when a part is missing", () => {
    expect(parseCoachReply(REPLY.replace("Words that don't match", "Words"))).toBeNull();
  });
});
