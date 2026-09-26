import { describe, expect, it } from "vitest";
import {
  CUT_BOARD_REPLY,
  FIRST_BOARD_REPLY,
  GREETING_REPLY,
  PROSE_FOLLOW_UP_REPLY,
  REPEAT_ONLY_BOARD_REPLY,
  SECOND_BOARD_REPLY,
  THIRD_BOARD_REPLY,
} from "../test/boardReplies.ts";
import { type Board, changeOf, previousTextOf, PROVENANCE_LABEL } from "./board.ts";
import { boardOf } from "./boardFromReplies.ts";
import { type Exchange, type ExchangeId, fail, type Prompt, reply, submit } from "./exchange.ts";

const pending = (id: string) => submit(id as ExchangeId, "thread" as Prompt);
const replied = (id: string, text: string): Exchange => reply(pending(id), text, "signature");
const marks = (board: Board) => board.cards.map((card) => changeOf(board, card));
const firstTwoReplies = [replied("reply-1", FIRST_BOARD_REPLY), replied("reply-2", SECOND_BOARD_REPLY)];

describe("boardOf", () => {
  it("turns a reply's events into cards in order, each from the thread and just added", () => {
    const board = boardOf([replied("reply-1", FIRST_BOARD_REPLY)]);
    expect(board.cards.map((card) => [card.text, card.provenance, changeOf(board, card)])).toEqual([
      ["Customer submits a bkg on the portal.", "thread", "added"],
      ["The night shift rebooked Load 48213 after its date moved +1 day with the same carrier.", "thread", "added"],
      ["The carrier billed TONU on the orig load, then hauled the new one.", "thread", "added"],
      ["A date or window change with the same carrier and same lane is AMENDED.", "thread", "added"],
      ["The night shift still RBs date-only changes until amend! syncs to the carrier portal.", "thread", "added"],
    ]);
  });

  it("keeps each event's provenance and labels a guess GUESS", () => {
    const board = boardOf([replied("reply-2", SECOND_BOARD_REPLY)]);
    expect(board.cards.map((card) => [card.text, PROVENANCE_LABEL[card.provenance]])).toEqual([
      ["Customer submits a bkg on the portal.", "FROM THREAD"],
      ["The carrier rejects the booking.", "FROM THREAD"],
      ["Ops chooses another carrier and resubmits the booking.", "GUESS"],
    ]);
  });

  it("places nothing for a greeting, a prose follow-up, a pending exchange or a failed one", () => {
    const board = boardOf([
      replied("reply-1", GREETING_REPLY),
      replied("reply-2", PROSE_FOLLOW_UP_REPLY),
      pending("reply-3"),
      fail(pending("reply-4"), { error: "The coach timed out.", retryable: true }),
    ]);
    expect(board.cards).toEqual([]);
  });

  it("keeps the events a cut reply got to", () => {
    const board = boardOf([replied("reply-1", CUT_BOARD_REPLY)]);
    expect(board.cards.map((card) => card.text)).toEqual(["Customer submits a bkg on the portal.", "The carrier rejects the booking."]);
  });

  it("collapses a repeated event into its card and appends the new ones, marking only those", () => {
    const first = boardOf(firstTwoReplies.slice(0, 1));
    const board = boardOf(firstTwoReplies);
    expect(board.cards.map((card) => card.id)).toEqual([
      ...first.cards.map((card) => card.id),
      "event:the carrier rejects the booking",
      "event:ops chooses another carrier and resubmits the booking",
    ]);
    expect(marks(board)).toEqual([null, null, null, null, null, "added", "added"]);
  });

  it("turns a guess into a thread event in place when a later reply restates it from the thread", () => {
    const board = boardOf([...firstTwoReplies, replied("reply-3", THIRD_BOARD_REPLY)]);
    expect(board.cards).toHaveLength(7);
    expect([board.cards[6]!.provenance, changeOf(board, board.cards[6]!)]).toEqual(["thread", "updated"]);
  });

  it("marks no card after a reply that only repeats known events", () => {
    const board = boardOf([...firstTwoReplies, replied("reply-3", REPEAT_ONLY_BOARD_REPLY)]);
    expect(marks(board).every((mark) => mark === null)).toBe(true);
  });

  it("quietly takes a later reply's wording for a card when it differs only in case or punctuation", () => {
    const restated = "Events, in order\n1. From thread: The carrier REJECTS the booking!";
    const board = boardOf([...firstTwoReplies, replied("reply-3", restated)]);
    const card = board.cards[5]!;
    expect([card.text, previousTextOf(board, card), changeOf(board, card)]).toEqual(["The carrier REJECTS the booking!", null, null]);
  });
});
