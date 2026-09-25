// @vitest-environment node
import { describe, expect, it } from "vitest";
import { CUT_SHORT_NOTE } from "../shared/chatContract.ts";
import { parseReply } from "./replyBlocks.ts";
import { copiedMessage, rfcDocument, toMarkdown } from "./rfcExport.ts";

const AS_OF = new Date(2026, 8, 25, 14, 30);

const markdownOf = (reply: string) => toMarkdown(rfcDocument(parseReply(reply)), AS_OF);

const WORDS = [
  "Words that don't match",
  '"rebook"',
  "- From thread: Ops (day desk) means a date change with the same carrier is AMENDED.",
  "- Guess: Code counts both rows of a rebook.",
].join("\n");

const QUESTION = [
  "Question for the ops lead and the finance controller, at the 27 Oct review: For load 48213, which count includes the new row?",
  'From thread: "carrier billed TONU on orig load, then hauled the new one"',
  'From thread: "finance only needs one invoice per shipment that actually moves"',
].join("\n");

const EVENTS = ["Events, in order", "1. From thread: The customer submits a booking on the portal.", "2. Guess: Ops rebooks a date change at night."].join("\n");

describe("toMarkdown", () => {
  it("writes the as-of line and the words as a GitHub table, the term on its first row only", () => {
    expect(markdownOf(WORDS)).toBe(
      [
        "As of 25 Sep 2026",
        "",
        "## Words that don't match",
        "",
        "| Term | Team | Meaning | Source |",
        "|---|---|---|---|",
        "| rebook | Ops (day desk) | A date change with the same carrier is AMENDED. | From thread |",
        "|  | Code | Guess: Counts both rows of a rebook. | Guess |",
        "",
      ].join("\n"),
    );
  });

  it("escapes pipes inside a cell so the table keeps its columns", () => {
    const piped = ["Words that don't match", '"status"', "- From thread: Ops means CONFIRMED | TENDERED on the portal."].join("\n");

    expect(markdownOf(piped)).toContain("| status | Ops | CONFIRMED \\| TENDERED on the portal. | From thread |");
  });

  it("lists the open question with its roles, forum and the two thread lines under it", () => {
    expect(markdownOf(`${WORDS}\n\n${QUESTION}`)).toContain(
      [
        "## Open questions",
        "",
        "- Question for the ops lead and the finance controller, at the 27 Oct review: For load 48213, which count includes the new row?",
        '  - From thread: "carrier billed TONU on orig load, then hauled the new one"',
        '  - From thread: "finance only needs one invoice per shipment that actually moves"',
        "",
      ].join("\n"),
    );
  });

  it("ends with the events, numbered and labelled with their source", () => {
    expect(markdownOf(`${EVENTS}\n\n${WORDS}\n\n${QUESTION}`).endsWith(
      ["## Events, in order", "", "1. From thread: The customer submits a booking on the portal.", "2. Guess: Ops rebooks a date change at night.", ""].join("\n"),
    )).toBe(true);
  });

  it("copies only the parts a cut reply has, then says it was cut", () => {
    expect(markdownOf(`${EVENTS}\n\n${CUT_SHORT_NOTE}`)).toBe(
      [
        "As of 25 Sep 2026",
        "",
        "## Events, in order",
        "",
        "1. From thread: The customer submits a booking on the portal.",
        "2. Guess: Ops rebooks a date change at night.",
        "",
        "The coach's reply was cut short here; ask it to continue for the rest.",
      ].join("\n"),
    );
  });
});

describe("toMarkdown escaping", () => {
  const LIVE = "[x](javascript:alert(1)) <img src=x onerror=alert(1)> `run` a\\b";
  const ESCAPED = "\\[x\\](javascript:alert(1)) \\<img src=x onerror=alert(1)\\> \\`run\\` a\\\\b";

  it("escapes link, HTML and code characters in a table cell, so no renderer makes them live", () => {
    const reply = ["Words that don't match", '"hold"', `- From thread: Ops means ${LIVE}.`].join("\n");

    expect(markdownOf(reply)).toContain(`| hold | Ops | ${ESCAPED}. | From thread |`);
  });

  it("escapes the same characters in the question, its thread lines and the events", () => {
    const reply = [
      "Events, in order",
      `1. From thread: Ops pastes ${LIVE}.`,
      "",
      `Question for the ops lead: For load 48213, which ${LIVE}?`,
      `From thread: "${LIVE}"`,
    ].join("\n");
    const markdown = markdownOf(reply);

    expect(markdown).toContain(`- Question for the ops lead: For load 48213, which ${ESCAPED}?`);
    expect(markdown).toContain(`  - From thread: "${ESCAPED}"`);
    expect(markdown).toContain(`1. From thread: Ops pastes ${ESCAPED}.`);
  });
});

describe("rfcDocument", () => {
  it("never carries a book citation into the RFC copy, even when the reply has one (#58)", () => {
    const cited = `${WORDS}\nSource: Evans, Domain-Driven Design Reference (2015), "Bounded Context".`;

    expect(markdownOf(cited)).not.toContain("Domain-Driven Design Reference");
  });
});

describe("copiedMessage", () => {
  it.each([
    [0, "Copied for your RFC."],
    [1, "Copied for your RFC. 1 row is still a guess."],
    [2, "Copied for your RFC. 2 rows are still guesses."],
  ])("counts %i guess rows", (guesses, message) => {
    expect(copiedMessage(guesses)).toBe(message);
  });
});
