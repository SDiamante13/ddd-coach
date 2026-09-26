import { useState } from "react";
import type { Correction } from "../domain/boardFromReplies.ts";
import type { EntityId } from "../domain/entityId.ts";
import type { ExchangeId } from "../domain/exchange.ts";

export function useCorrections(outgoing: (text: string) => string) {
  const [corrections, setCorrections] = useState<readonly Correction[]>([]);
  const correct = (id: EntityId, text: string, after: ExchangeId) =>
    setCorrections((list) => [...list, { id, text: outgoing(text), after }]);
  const undo = () => setCorrections((list) => list.slice(0, -1));
  return { corrections, correct, undo };
}
