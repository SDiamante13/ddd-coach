import { useState } from "react";
import type { Verdict, VisitorAction } from "../domain/boardFromReplies.ts";
import { isoDay } from "../domain/dates.ts";
import type { EntityId } from "../domain/entityId.ts";
import type { ExchangeId } from "../domain/exchange.ts";
import { lastEdit, type Position } from "../domain/cardMoves.ts";

export function useVisitorActions(outgoing: (text: string) => string, initial: readonly VisitorAction[] = []) {
  const [actions, setActions] = useState<readonly VisitorAction[]>(initial);
  const correct = (id: EntityId, text: string, after: ExchangeId) =>
    setActions((list) => [...list, { kind: "correct", id, text: outgoing(text), after }]);
  const connect = (from: EntityId, to: EntityId, after: ExchangeId) => setActions((list) => [...list, { kind: "connect", from, to, after }]);
  const move = (id: EntityId, { x, y }: Position, after: ExchangeId) => setActions((list) => [...list, { kind: "move", id, x, y, after }]);
  const check = (row: EntityId, verdict: Verdict, where: string, after: ExchangeId) =>
    setActions((list) => [...list, { kind: "check", row, verdict, at: isoDay(new Date()), after, ...(where !== "" && { where: outgoing(where) }) }]);
  const clearCheck = (row: EntityId, after: ExchangeId) => setActions((list) => [...list, { kind: "clearCheck", row, after }]);
  const undo = () =>
    setActions((list) => {
      const last = lastEdit(list);
      return last === undefined ? list : list.filter((action) => action !== last);
    });
  return { actions, correct, connect, move, check, clearCheck, undo, clear: () => setActions([]) };
}
