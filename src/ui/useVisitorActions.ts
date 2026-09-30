import { useState } from "react";
import type { VisitorAction } from "../domain/boardFromReplies.ts";
import type { EntityId } from "../domain/entityId.ts";
import type { ExchangeId } from "../domain/exchange.ts";

export function useVisitorActions(outgoing: (text: string) => string, initial: readonly VisitorAction[] = []) {
  const [actions, setActions] = useState<readonly VisitorAction[]>(initial);
  const correct = (id: EntityId, text: string, after: ExchangeId) =>
    setActions((list) => [...list, { kind: "correct", id, text: outgoing(text), after }]);
  const connect = (from: EntityId, to: EntityId, after: ExchangeId) => setActions((list) => [...list, { kind: "connect", from, to, after }]);
  const undo = () => setActions((list) => list.slice(0, -1));
  return { actions, correct, connect, undo, clear: () => setActions([]) };
}
