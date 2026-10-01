import { describe, expect, it } from "vitest";
import { boardOf, type VisitorAction } from "./boardFromReplies.ts";
import { compactMoves, lastEdit, positionsOf } from "./cardMoves.ts";
import { entityId } from "./entityId.ts";
import type { Exchange, ExchangeId, Prompt } from "./exchange.ts";

const e1 = "e1" as ExchangeId;
const a = entityId("event", "Customer submits a bkg on the portal.");
const b = entityId("event", "The carrier rejects the booking.");
const move = (id: typeof a, x: number, y: number): VisitorAction => ({ kind: "move", id, x, y, after: e1 });
const link: VisitorAction = { kind: "connect", from: a, to: b, after: e1 };

describe("card moves", () => {
  it("places each card where it was last moved", () => {
    expect(positionsOf([move(a, 1, 2), move(b, 5, 6), move(a, 3, 4)])).toEqual(new Map([[a, { x: 3, y: 4 }], [b, { x: 5, y: 6 }]]));
  });

  it("keeps only each card's last move, leaving the other edits in order", () => {
    expect(compactMoves([move(a, 1, 2), link, move(a, 3, 4), move(b, 5, 6)])).toEqual([link, move(a, 3, 4), move(b, 5, 6)]);
  });

  it("finds the last edit Undo can take back, skipping moves", () => {
    expect(lastEdit([link, move(a, 1, 2)])).toBe(link);
  });

  it("leaves the board's events untouched by moves", () => {
    const exchanges: Exchange[] = [{ id: e1, prompt: "x" as Prompt, status: "replied", reply: "Events, in order\n1. From thread: Customer submits a bkg on the portal.", signature: "s" }];
    expect(boardOf(exchanges, [move(a, 9, 9)])).toEqual(boardOf(exchanges));
  });
});
