import { useReactFlow } from "@xyflow/react";
import { useEffect } from "react";
import { type Board, changeOf } from "../domain/board.ts";
import { LANE_INSET, lanePosition } from "./boardLayout.ts";
import { prefersReducedMotion } from "./motion.ts";

export function usePanToChanges(board: Board): void {
  const flow = useReactFlow();
  useEffect(() => {
    const index = board.cards.findIndex((card) => changeOf(board, card) !== null);
    if (index < 0) return;
    const { y, zoom } = flow.getViewport();
    void flow.setViewport({ x: LANE_INSET - lanePosition(index).x * zoom, y, zoom }, { duration: prefersReducedMotion() ? 0 : 300 });
  }, [board.latest]);
}
