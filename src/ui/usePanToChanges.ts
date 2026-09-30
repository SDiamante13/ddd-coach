import { useReactFlow } from "@xyflow/react";
import { useEffect, useState } from "react";
import { changeOf } from "../domain/board.ts";
import type { ExchangeId } from "../domain/exchange.ts";
import type { BoardView } from "./EventBoard.tsx";
import { LANE_INSET, lanePosition } from "./boardLayout.ts";
import { prefersReducedMotion } from "./motion.ts";

export type ChangeCounts = { added: number; updated: number };
type Offer = ChangeCounts & { index: number; at: ExchangeId | null };
export type NewEvents = (ChangeCounts & { reveal: () => void }) | null;

type PanView = Pick<BoardView, "board" | "panHeld" | "releasePan" | "atRest">;

export function usePanToChanges({ board, panHeld: held, releasePan: release, atRest }: PanView): NewEvents {
  const flow = useReactFlow();
  const [offer, setOffer] = useState<Offer | null>(null);
  const panTo = (index: number) => {
    const { y, zoom } = flow.getViewport();
    void flow.setViewport({ x: LANE_INSET - lanePosition(index).x * zoom, y, zoom }, { duration: prefersReducedMotion() ? 0 : 300 });
  };
  useEffect(() => {
    const changes = board.cards.map((card) => changeOf(board, card));
    const changed = changes.flatMap((change, index) => (change === null ? [] : [index]));
    release();
    if (atRest || changed.length === 0) return;
    if (held) setOffer({ index: changed[0]!, added: countOf(changes, "added"), updated: countOf(changes, "updated"), at: board.latest });
    else panTo(changed[0]!);
  }, [board.latest]);
  if (offer === null || offer.at !== board.latest) return null;
  return {
    added: offer.added,
    updated: offer.updated,
    reveal: () => {
      panTo(offer.index);
      setOffer(null);
    },
  };
}

const countOf = (changes: readonly (string | null)[], kind: string): number => changes.filter((change) => change === kind).length;
