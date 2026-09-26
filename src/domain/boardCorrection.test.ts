import { describe, expect, it } from "vitest";
import { applyAction, type BoardAction, emptyBoard, labelOf, type Provenance, struckWordsOf } from "./board.ts";
import { entityId } from "./entityId.ts";
import type { ExchangeId } from "./exchange.ts";

const add = (text: string, by: string, provenance: Provenance = "thread"): BoardAction => ({
  type: "addEvent",
  id: entityId("event", text),
  text,
  provenance,
  by: by as ExchangeId,
});
const correct = (was: string, text: string): BoardAction => ({ type: "correctCard", id: entityId("event", was), text });

const PICKUP = "Carrier 3 picks up load 7815 2h late.";
const FIXED = "Carrier 3 picks up load 7815 50 min late.";

describe("correcting a card (#95)", () => {
  it("takes the visitor's wording in place, keeps the coach's as corrected-from, and isn't a coach turn", () => {
    const board = [add(PICKUP, "x1"), correct(PICKUP, FIXED)].reduce(applyAction, emptyBoard);

    expect(board.cards).toMatchObject([{ id: entityId("event", PICKUP), text: FIXED, correctedFrom: PICKUP }]);
    expect(board.latest).toBe("x1");
  });

  it("keeps the visitor's wording when a later reply restates the coach's original event", () => {
    const board = [add(PICKUP, "x1"), correct(PICKUP, FIXED), add(PICKUP.toLowerCase(), "x2", "guess")].reduce(applyAction, emptyBoard);

    expect(board.cards).toMatchObject([{ text: FIXED, correctedFrom: PICKUP }]);
  });

  it("adds no second card when a later reply uses the visitor's corrected wording", () => {
    const board = [add(PICKUP, "x1"), correct(PICKUP, FIXED), add(`${FIXED} `, "x2")].reduce(applyAction, emptyBoard);

    expect(board.cards).toHaveLength(1);
    expect(board.cards[0]).toMatchObject({ text: FIXED, correctedFrom: PICKUP });
  });

  it("labels a corrected card YOU SAID and strikes the coach's words through only until the next turn", () => {
    const corrected = [add(PICKUP, "x1", "guess"), correct(PICKUP, FIXED)].reduce(applyAction, emptyBoard);
    const nextTurn = applyAction(corrected, add("Billing issues a credit.", "x2"));

    expect(labelOf(corrected.cards[0]!)).toBe("YOU SAID");
    expect(struckWordsOf(corrected, corrected.cards[0]!)).toBe(PICKUP);
    expect(struckWordsOf(nextTurn, nextTurn.cards[0]!)).toBeNull();
    expect(labelOf(nextTurn.cards[1]!)).toBe("FROM THREAD");
  });

  it("remembers the coach's original words when the visitor corrects a card twice", () => {
    const board = [add(PICKUP, "x1"), correct(PICKUP, FIXED), correct(PICKUP, "Carrier 3 picks up 7815 late.")].reduce(applyAction, emptyBoard);

    expect(board.cards[0]).toMatchObject({ text: "Carrier 3 picks up 7815 late.", correctedFrom: PICKUP });
  });
});
