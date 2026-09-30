import { describe, expect, it } from "vitest";
import { applyAction, type BoardAction, emptyBoard } from "./board.ts";
import { entityId } from "./entityId.ts";
import type { ExchangeId } from "./exchange.ts";

const add = (text: string, by: string): BoardAction => ({ type: "addEvent", id: entityId("event", text), text, provenance: "thread", by: by as ExchangeId });
const connect = (from: string, to: string): BoardAction => ({ type: "connectCards", from: entityId("event", from), to: entityId("event", to) });

const LATE = "Load 7731 delivers past the appointment.";
const CREDIT = "Billing issues Customer D a service credit.";
const REPORT = "The weekly late report lists 7731.";

describe("linking two cards (#96)", () => {
  it("links two cards on the board by their ids, and isn't a coach turn", () => {
    const board = [add(LATE, "x1"), add(CREDIT, "x1"), connect(LATE, CREDIT)].reduce(applyAction, emptyBoard);

    expect(board.links).toEqual([{ from: entityId("event", LATE), to: entityId("event", CREDIT) }]);
    expect(board.latest).toBe("x1");
  });

  it.each([
    ["a card to itself", [connect(LATE, LATE)]],
    ["the same link twice", [connect(LATE, CREDIT), connect(LATE, CREDIT)]],
    ["a card that isn't on the board", [connect(LATE, "Nothing like this was said.")]],
  ])("adds no link for %s", (_case, links) => {
    const board = [add(LATE, "x1"), add(CREDIT, "x1"), ...links].reduce(applyAction, emptyBoard);

    expect(board.links.length).toBeLessThanOrEqual(1);
    expect(board.links.every(({ from, to }) => from !== to && board.cards.some((card) => card.id === to))).toBe(true);
  });

  it("keeps a link when later replies restate or add cards", () => {
    const board = [add(LATE, "x1"), add(CREDIT, "x1"), connect(LATE, CREDIT), add(REPORT, "x2"), add(LATE.toLowerCase(), "x2")].reduce(applyAction, emptyBoard);

    expect(board.links).toEqual([{ from: entityId("event", LATE), to: entityId("event", CREDIT) }]);
  });
});
