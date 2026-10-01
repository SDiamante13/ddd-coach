import { useState } from "react";
import type { ExchangeId } from "../domain/exchange.ts";

export type ChangeCounts = { added: number; updated: number };
export type OffScreenOffer = ChangeCounts & { index: number; at: ExchangeId | null };

export function useOffScreenOffer(latest: ExchangeId | null) {
  const [offer, offerNew] = useState<OffScreenOffer | null>(null);
  const [newReveals, setNewReveals] = useState(0);
  return {
    newOffScreen: offer !== null && offer.at === latest ? offer : null,
    offerNew,
    newReveals,
    revealNew: () => setNewReveals((count) => count + 1),
  };
}
