import { useReactFlow } from "@xyflow/react";
import { useEffect } from "react";
import { BOARD_ZOOM } from "../domain/session.ts";
import type { BoardView } from "./EventBoard.tsx";
import { fittedViewport } from "./boardLayout.ts";
import { prefersReducedMotion } from "./motion.ts";
import type { LaneSize } from "./useLaneSize.ts";

export function useFitBoard({ fitRequests }: Pick<BoardView, "fitRequests">, lane: LaneSize): void {
  const flow = useReactFlow();
  useEffect(() => {
    const nodes = flow.getNodes();
    if (fitRequests === 0 || nodes.length === 0 || lane.width === 0 || lane.height === 0) return;
    void flow.setViewport(fittedViewport(flow.getNodesBounds(nodes), lane, BOARD_ZOOM), { duration: prefersReducedMotion() ? 0 : 200 });
  }, [fitRequests]);
}
