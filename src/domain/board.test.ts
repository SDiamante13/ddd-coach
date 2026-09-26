import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { entityId } from "./entityId.ts";
import type { ExchangeId } from "./exchange.ts";
import {
  applyAction,
  type Board,
  boardSummary,
  type BoardAction,
  changeOf,
  emptyBoard,
  type EventCard,
  previousProvenanceOf,
  previousTextOf,
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

  it("leaves the cards as they are when a later reply repeats an event, spacing aside, and marks that reply latest", () => {
    const first = applyAction(emptyBoard, addEvent("Customer submits a bkg.", "thread", "reply-1"));
    const repeated = applyAction(first, addEvent(" Customer submits  a bkg.", "thread", "reply-2"));
    expect(repeated).toEqual({ cards: first.cards, latest: "reply-2" });
  });

  it("quietly takes the newer wording when a later reply restates an event in another case or punctuation", () => {
    const first = applyAction(emptyBoard, addEvent("Customer submits a bkg.", "thread", "reply-1"));
    const restated = applyAction(first, addEvent("Customer submits a BKG!", "thread", "reply-2"));
    expect(restated.cards).toStrictEqual([{ ...first.cards[0], text: "Customer submits a BKG!" }]);
  });

  it("updates a card in place, recording its previous provenance, when a later reply gives its event a new one", () => {
    const guessed = [
      addEvent("Ops chooses another carrier.", "guess", "reply-1"),
      addEvent("The carrier rejects the booking.", "thread", "reply-1"),
    ].reduce(applyAction, emptyBoard);
    const confirmed = applyAction(guessed, addEvent("Ops chooses another carrier.", "thread", "reply-2"));
    expect(confirmed).toEqual({
      cards: [{ ...guessed.cards[0], provenance: "thread", previousProvenance: "guess", changedBy: "reply-2" }, guessed.cards[1]],
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

describe("previousTextOf", () => {
  const renamedBy = (by: string): EventCard => ({
    id: entityId("event", "Customer submits a booking."),
    kind: "event",
    text: "Customer submits a booking.",
    previousText: "Customer submits a bkg.",
    provenance: "thread",
    placedBy: "reply-1" as ExchangeId,
    changedBy: by as ExchangeId,
  });
  const renamedIn = (by: string): Board => ({ cards: [renamedBy(by)], latest: by as ExchangeId });

  it("gives a renamed card's previous words while the reply that renamed it is the latest", () => {
    const board = renamedIn("reply-2");
    expect(previousTextOf(board, board.cards[0]!)).toBe("Customer submits a bkg.");
  });

  it("gives no previous words once a later reply only repeats the card", () => {
    const board = applyAction(renamedIn("reply-2"), addEvent("Customer submits a booking.", "thread", "reply-3"));
    expect(previousTextOf(board, board.cards[0]!)).toBeNull();
  });

  it("gives no previous words when a later reply only changes the card's provenance", () => {
    const board = applyAction(renamedIn("reply-2"), addEvent("Customer submits a booking.", "guess", "reply-3"));
    expect(previousTextOf(board, board.cards[0]!)).toBeNull();
  });
});

describe("previousProvenanceOf", () => {
  const confirmed = [
    addEvent("Ops chooses another carrier.", "guess", "reply-1"),
    addEvent("Ops chooses another carrier.", "thread", "reply-2"),
  ];

  it("gives a card's previous provenance while the reply that changed it is the latest", () => {
    const board = confirmed.reduce(applyAction, emptyBoard);
    expect(previousProvenanceOf(board, board.cards[0]!)).toBe("guess");
  });

  it("gives no previous provenance once a later reply only repeats the card", () => {
    const board = [...confirmed, addEvent("Ops chooses another carrier.", "thread", "reply-3")].reduce(applyAction, emptyBoard);
    expect(previousProvenanceOf(board, board.cards[0]!)).toBeNull();
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

describe("boardSummary", () => {
  const boardWith = (...provenances: Provenance[]): Board =>
    provenances.map((provenance, index) => addEvent(`Event ${index}.`, provenance, "x1")).reduce(applyAction, emptyBoard);

  it.each([
    [["thread"], "1 event"],
    [["thread", "thread"], "2 events"],
    [["guess"], "1 event · 1 guess"],
    [["thread", "guess", "guess"], "3 events · 2 guesses"],
  ] as [Provenance[], string][])("counts %j as %s", (provenances, summary) => {
    expect(boardSummary(boardWith(...provenances))).toBe(summary);
  });
});
