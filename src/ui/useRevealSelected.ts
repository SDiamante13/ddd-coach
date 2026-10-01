import { useReactFlow } from "@xyflow/react";
import { useEffect } from "react";
import type { BoardView } from "./EventBoard.tsx";
import { CARD_WIDTH, EDGE_CHIP_SAFE, lanePosition } from "./boardLayout.ts";
import { prefersReducedMotion } from "./motion.ts";
import type { LaneSize } from "./useLaneSize.ts";

export function useRevealSelected({ selected, board, positions }: Pick<BoardView, "selected" | "board" | "positions">, { width }: LaneSize): void {
  const flow = useReactFlow();
  useEffect(() => {
    const index = board.cards.findIndex((card) => card.id === selected);
    if (selected === null || index < 0 || width === 0) return;
    const { x, y, zoom } = flow.getViewport();
    const left = (positions.get(selected) ?? lanePosition(index)).x * zoom + x;
    const shift = Math.max(EDGE_CHIP_SAFE - left, 0) || Math.min(width - EDGE_CHIP_SAFE - (left + CARD_WIDTH * zoom), 0);
    if (shift !== 0) void flow.setViewport({ x: x + shift, y, zoom }, { duration: prefersReducedMotion() ? 0 : 200 });
  }, [selected]);
}
