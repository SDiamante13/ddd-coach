// @vitest-environment node
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { CUT_SHORT_NOTE } from "../shared/chatContract.ts";
import { V10_GREETING_REPLY, V10_THREAD_REPLIES } from "../test/v10Replies.ts";
import { parseReply, type ReplyBlock } from "./replyBlocks.ts";

describe("parseReply", () => {
  it("reads a words section as rows of meanings with their source and holder", () => {
    const reply = ["Words that don't match", '"booking"', "- From thread: Ops means the request from submit onward."].join("\n");

    expect(parseReply(reply)).toEqual([
      {
        kind: "words",
        rows: [{ word: "booking", meanings: [{ source: "From thread", holder: "Ops", meaning: "The request from submit onward." }] }],
      },
    ]);
  });

  it("reads an events section as numbered claims with their source", () => {
    const reply = ["Events, in order", "1. From thread: The customer hits submit.", "2. Guess: Ops rebooks when the date changes."].join("\n");

    expect(parseReply(reply)).toEqual([
      {
        kind: "events",
        items: [
          { source: "From thread", text: "The customer hits submit." },
          { source: "Guess", text: "Ops rebooks when the date changes." },
        ],
      },
    ]);
  });

  it("reads the question line as its roles and its question", () => {
    const reply = "Question for the ops lead and the finance controller, at the 27 Oct review: For load 48213, which count includes the new row?";

    expect(parseReply(reply)).toEqual([
      { kind: "question", roles: "the ops lead and the finance controller, at the 27 Oct review", text: "For load 48213, which count includes the new row?" },
    ]);
  });

  it("keeps a line outside the layout as text", () => {
    expect(parseReply("Hi! Paste a thread when you have one.")).toEqual([{ kind: "text", text: "Hi! Paste a thread when you have one." }]);
  });

  it("joins adjacent text lines into one paragraph and starts another after a blank line", () => {
    expect(parseReply("DDD is Domain-Driven Design.\nIt starts with the business.\n\nPaste a thread.")).toEqual([
      { kind: "text", text: "DDD is Domain-Driven Design.\nIt starts with the business." },
      { kind: "text", text: "Paste a thread." },
    ]);
  });

  it("reads the server's cut-short note as a cut marker", () => {
    const reply = ["Events, in order", "1. From thread: The customer hits submit.", "", CUT_SHORT_NOTE].join("\n");

    expect(parseReply(reply).at(-1)).toEqual({ kind: "cut" });
  });

  describe("a meaning's holder", () => {
    const holderAndMeaning = (claim: string) => {
      const [block] = parseReply(["Words that don't match", '"rebook"', `- Guess: ${claim}`].join("\n"));
      const meaning = block?.kind === "words" ? block.rows[0]?.meanings[0] : undefined;
      return [meaning?.holder, meaning?.meaning];
    };

    it.each([
      ["Ops (night shift) means every change is REBOOKED.", ["Ops (night shift)", "Every change is REBOOKED."]],
      ["Carriers mean a tender, not a booking.", ["Carriers", "A tender, not a booking."]],
      ["Team unclear means the portal label after the 990.", ["Team unclear", "The portal label after the 990."]],
    ])("is the words before means: %s", (claim, expected) => {
      expect(holderAndMeaning(claim)).toEqual(expected);
    });

    it("is empty when means comes too late to follow a holder", () => {
      const claim = "The dashboard counts both rows of a rebook, which means the number doubles.";

      expect(holderAndMeaning(claim)).toEqual(["", claim]);
    });

    it("is Code for a Code line whose verb isn't means", () => {
      expect(holderAndMeaning("Code creates a new row, which means the count doubles.")).toEqual(["Code", "Creates a new row, which means the count doubles."]);
    });
  });

  describe("drops nothing", () => {
    const LAYOUT_LINES = [
      "Events, in order",
      "1. From thread: The customer hits submit.",
      "2. Guess: Ops rebooks.",
      "Words that don't match",
      '"rebook"',
      "- From thread: Ops (night shift) means every change.",
      "- Guess: Code counts both rows.",
      "Question for the ops lead: For load 48213, which count includes it?",
      CUT_SHORT_NOTE,
      "",
    ];
    const freeLine = fc.string({ minLength: 1 }).map((text) => `note ${text.replace(/[\r\n]/g, " ")}`.trim());
    const replyLines = fc.array(fc.oneof(fc.constantFrom(...LAYOUT_LINES), freeLine), { maxLength: 40 });

    const linesIn = (block: ReplyBlock): number => {
      switch (block.kind) {
        case "events":
          return 1 + block.items.length;
        case "words":
          return 1 + block.rows.reduce((sum, row) => sum + 1 + row.meanings.length, 0);
        case "text":
          return block.text.split("\n").length;
        default:
          return 1;
      }
    };

    it("accounts for every non-blank line of any reply", () => {
      fc.assert(
        fc.property(replyLines, (lines) => {
          const blocks = parseReply(lines.join("\n"));
          expect(blocks.reduce((sum, block) => sum + linesIn(block), 0)).toBe(lines.filter((line) => line !== "").length);
        }),
      );
    });

    it("keeps every free-text line, in order", () => {
      fc.assert(
        fc.property(replyLines, (lines) => {
          const texts = parseReply(lines.join("\n")).flatMap((block) => (block.kind === "text" ? block.text.split("\n") : []));
          expect(texts.filter((line) => line.startsWith("note"))).toEqual(lines.filter((line) => line.startsWith("note")));
        }),
      );
    });
  });

  describe("real v10 replies", () => {
    it.each(Object.entries(V10_THREAD_REPLIES))("parse %s into events, words and the question with nothing left over", (_fixture, reply) => {
      expect(parseReply(reply).map((block) => block.kind)).toEqual(["events", "words", "question"]);
    });

    it("parse a greeting as text only", () => {
      expect(parseReply(V10_GREETING_REPLY).every((block) => block.kind === "text")).toBe(true);
    });
  });
});
