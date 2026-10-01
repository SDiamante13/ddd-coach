import { type Node, useReactFlow } from "@xyflow/react";
import { useEffect } from "react";
import type { BoardView } from "./EventBoard.tsx";
import { CARD_HEIGHT, CARD_WIDTH, BOTTOM_CLEARANCE, EDGE_CHIP_SAFE, LANE_INSET, ROW_TOP } from "./boardLayout.ts";
import { prefersReducedMotion } from "./motion.ts";
import type { LaneSize } from "./useLaneSize.ts";

type Span = { start: number; end: number };

export function useRevealItem({ focusedId, selected }: Pick<BoardView, "focusedId" | "selected">, lane: LaneSize, nodes: readonly Node[]): void {
  const flow = useReactFlow();
  useEffect(() => {
    const node = nodes.find(({ id }) => id === (focusedId ?? selected));
    if (node === undefined || lane.width === 0) return;
    const { x, y, zoom } = flow.getViewport();
    const across = spanOf(node.position.x, node.width ?? CARD_WIDTH, x, zoom);
    const down = spanOf(node.position.y, node.height ?? CARD_HEIGHT, y, zoom);
    const dx = alongShift(across, lane.width);
    const dy = downShift(down, lane.height);
    if (dx !== 0 || dy !== 0) void flow.setViewport({ x: x + dx, y: y + dy, zoom }, { duration: prefersReducedMotion() ? 0 : 200 });
  }, [focusedId, selected]);
}

const spanOf = (at: number, size: number, offset: number, zoom: number): Span => ({ start: at * zoom + offset, end: (at + size) * zoom + offset });

function alongShift({ start, end }: Span, width: number): number {
  if (start < LANE_INSET) return EDGE_CHIP_SAFE - start;
  if (end > width - LANE_INSET) return Math.max(width - EDGE_CHIP_SAFE - end, EDGE_CHIP_SAFE - start);
  return 0;
}

function downShift({ start, end }: Span, height: number): number {
  if (height === 0) return 0;
  if (start < ROW_TOP) return ROW_TOP - start;
  if (end > height - BOTTOM_CLEARANCE) return Math.max(height - BOTTOM_CLEARANCE - end, ROW_TOP - start);
  return 0;
}
