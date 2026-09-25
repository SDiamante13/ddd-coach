import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { entityId } from "./entityId.ts";
import type { ExchangeId } from "./exchange.ts";
import {
  applyAction,
  type Board,
  type BoardAction,
  changeOf,
  emptyBoard,
  type Provenance,
  PROVENANCE_LABEL,
} from "./board.ts";

const addEvent = (text: string, provenance: Provenance, by: string): BoardAction => ({
  type: "addEvent",
  id: entityId("event", text),
  text,
  provenance,
  by: by as ExchangeId,
});

const eventText = fc.constantFrom(
  "Customer submits a bkg.",
  "customer submits a  BKG",
  "The carrier rejects the booking.",
  "Ops chooses another carrier!",
  "ops chooses another carrier",
);
const boardAction = fc
  .tuple(eventText, fc.constantFrom<Provenance>("thread", "guess"), fc.constantFrom("reply-1", "reply-2", "reply-3"))
  .map(([text, provenance, by]) => addEvent(text, provenance, by));
const boardActions = fc.array(boardAction, { maxLength: 12 });
const boardOfActions = (actions: readonly BoardAction[]) => actions.reduce(applyAction, emptyBoard);
const idsInFirstAppearanceOrder = (actions: readonly BoardAction[]) => [...new Set(actions.map((action) => action.id))];

describe("applyAction", () => {
  it("places a new event as a card placed and changed by its reply", () => {
    const board = applyAction(emptyBoard, addEvent("Customer submits a bkg.", "thread", "reply-1"));
    expect(board).toEqual({
      cards: [
        {
          id: "event:customer submits a bkg",
          kind: "event",
          text: "Customer submits a bkg.",
          provenance: "thread",
          placedBy: "reply-1",
          changedBy: "reply-1",
        },
      ],
      latest: "reply-1",
    });
  });

  it("leaves the cards as they are when a later reply repeats an event, and marks that reply latest", () => {
    const first = applyAction(emptyBoard, addEvent("Customer submits a bkg.", "thread", "reply-1"));
    const repeated = applyAction(first, addEvent("customer submits  a BKG", "thread", "reply-2"));
    expect(repeated).toEqual({ cards: first.cards, latest: "reply-2" });
  });

  it("updates a card in place when a later reply gives its event a new provenance", () => {
    const guessed = [
      addEvent("Ops chooses another carrier.", "guess", "reply-1"),
      addEvent("The carrier rejects the booking.", "thread", "reply-1"),
    ].reduce(applyAction, emptyBoard);
    const confirmed = applyAction(guessed, addEvent("Ops chooses another carrier.", "thread", "reply-2"));
    expect(confirmed).toEqual({
      cards: [{ ...guessed.cards[0], provenance: "thread", changedBy: "reply-2" }, guessed.cards[1]],
      latest: "reply-2",
    });
  });
});

describe("changeOf", () => {
  it("marks a card placed by the latest reply as added", () => {
    const board = applyAction(emptyBoard, addEvent("Customer submits a bkg.", "thread", "reply-1"));
    expect(changeOf(board, board.cards[0]!)).toBe("added");
  });

  it("leaves a card unmarked once a later reply only repeats it", () => {
    const board = [
      addEvent("Customer submits a bkg.", "thread", "reply-1"),
      addEvent("Customer submits a bkg.", "thread", "reply-2"),
    ].reduce(applyAction, emptyBoard);
    expect(changeOf(board, board.cards[0]!)).toBeNull();
  });

  it("marks a card whose provenance the latest reply changed as updated", () => {
    const board = [
      addEvent("Ops chooses another carrier.", "guess", "reply-1"),
      addEvent("Ops chooses another carrier.", "thread", "reply-2"),
    ].reduce(applyAction, emptyBoard);
    expect(changeOf(board, board.cards[0]!)).toBe("updated");
  });
});

describe("PROVENANCE_LABEL", () => {
  it("labels a guess GUESS and a thread event FROM THREAD", () => {
    expect([PROVENANCE_LABEL.guess, PROVENANCE_LABEL.thread]).toEqual(["GUESS", "FROM THREAD"]);
  });
});

describe("a board folded from actions", () => {
  it("is unchanged by applying the same action again", () => {
    fc.assert(
      fc.property(boardActions, boardAction, (actions, action) => {
        const once = applyAction(boardOfActions(actions), action);
        expect(applyAction(once, action)).toEqual(once);
      }),
    );
  });

  it("holds one card per id, in the order each id first appeared", () => {
    fc.assert(
      fc.property(boardActions, (actions) => {
        expect(boardOfActions(actions).cards.map((card) => card.id)).toEqual(idsInFirstAppearanceOrder(actions));
      }),
    );
  });

  it("keeps every earlier board intact, equal to replaying the actions up to it", () => {
    fc.assert(
      fc.property(boardActions, (actions) => {
        const history = actions.reduce<Board[]>((boards, action) => [...boards, applyAction(boards.at(-1)!, action)], [emptyBoard]);
        history.forEach((earlier, i) => expect(earlier).toEqual(boardOfActions(actions.slice(0, i))));
      }),
    );
  });
});
