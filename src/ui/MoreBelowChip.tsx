import { useReactFlow, useViewport } from "@xyflow/react";
import { BOTTOM_CLEARANCE } from "./boardLayout.ts";
import { prefersReducedMotion } from "./motion.ts";

const plural = (count: number) => (count === 1 ? "term" : "terms");

export function MoreBelowChip({ height, onPan }: { height: number; onPan: () => void }) {
  const { x, y, zoom } = useViewport();
  const flow = useReactFlow();
  const nodes = flow.getNodes();
  const bottomOf = (node: (typeof nodes)[number]) => {
    const { y: top, height: tall } = flow.getNodesBounds([node]);
    return top + tall;
  };
  const below = nodes.filter((node) => node.type === "term" && bottomOf(node) * zoom + y > height).length;
  if (height === 0 || below === 0) return null;
  const panDown = () => {
    onPan();
    const bottom = Math.max(...nodes.map(bottomOf));
    void flow.setViewport({ x, y: height - BOTTOM_CLEARANCE - bottom * zoom, zoom }, { duration: prefersReducedMotion() ? 0 : 300 });
  };
  return (
    <button type="button" className="edge-chip below" aria-label={`Show the ${below} ${plural(below)} below`} onClick={panDown}>
      {`more below ▾ (${below} ${plural(below)})`}
    </button>
  );
}
