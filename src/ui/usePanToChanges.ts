import { useReactFlow } from "@xyflow/react";
import { useEffect, useState } from "react";
import { changeOf } from "../domain/board.ts";
import type { ExchangeId } from "../domain/exchange.ts";
import type { BoardView } from "./EventBoard.tsx";
import { LANE_INSET, lanePosition } from "./boardLayout.ts";
import { prefersReducedMotion } from "./motion.ts";

type Offer = { index: number; count: number; at: ExchangeId | null };
export type NewEvents = { count: number; reveal: () => void } | null;

type PanView = Pick<BoardView, "board" | "panHeld" | "releasePan" | "atRest">;

export function usePanToChanges({ board, panHeld: held, releasePan: release, atRest }: PanView): NewEvents {
  const flow = useReactFlow();
  const [offer, setOffer] = useState<Offer | null>(null);
  const panTo = (index: number) => {
    const { y, zoom } = flow.getViewport();
    void flow.setViewport({ x: LANE_INSET - lanePosition(index).x * zoom, y, zoom }, { duration: prefersReducedMotion() ? 0 : 300 });
  };
  useEffect(() => {
    const changed = board.cards.flatMap((card, index) => (changeOf(board, card) === null ? [] : [index]));
    release();
    if (atRest || changed.length === 0) return;
    if (held) setOffer({ index: changed[0]!, count: changed.length, at: board.latest });
    else panTo(changed[0]!);
  }, [board.latest]);
  if (offer === null || offer.at !== board.latest) return null;
  return {
    count: offer.count,
    reveal: () => {
      panTo(offer.index);
      setOffer(null);
    },
  };
}
