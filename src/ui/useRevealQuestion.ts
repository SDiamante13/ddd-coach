import { useReactFlow } from "@xyflow/react";
import { type RefObject, useEffect } from "react";
import type { BoardView } from "./EventBoard.tsx";
import { LANE_INSET } from "./boardLayout.ts";
import { prefersReducedMotion } from "./motion.ts";
import { questionNodesOf } from "./QuestionNode.tsx";

export function useRevealQuestion(view: BoardView, root: RefObject<HTMLElement | null>): void {
  const flow = useReactFlow();
  useEffect(() => {
    const node = questionNodesOf(view)[0];
    if (view.questionReveals === 0 || node === undefined) return;
    const { y, zoom } = flow.getViewport();
    void flow.setViewport({ x: LANE_INSET - node.position.x * zoom, y, zoom }, { duration: prefersReducedMotion() ? 0 : 300 });
    root.current?.querySelector<HTMLElement>(".hotspot-card")?.focus({ preventScroll: true });
  }, [view.questionReveals]);
}
