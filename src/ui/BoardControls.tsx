import { useReactFlow, useViewport } from "@xyflow/react";
import { prefersReducedMotion } from "./motion.ts";

type BoardControlsProps = { following: boolean; onFollowChange: (following: boolean) => void };

export function BoardControls({ following, onFollowChange }: BoardControlsProps) {
  const flow = useReactFlow();
  const { zoom } = useViewport();
  const touching = (move: (options: { duration: number }) => unknown) => () => {
    onFollowChange(false);
    void move({ duration: prefersReducedMotion() ? 0 : 200 });
  };
  return (
    <div className="board-controls">
      <button type="button" aria-label="Zoom out" onClick={touching(flow.zoomOut)}>
        −
      </button>
      <span className="zoom-level">{`${Math.round(zoom * 100)}%`}</span>
      <button type="button" aria-label="Zoom in" onClick={touching(flow.zoomIn)}>
        +
      </button>
      <button type="button" aria-label="Fit the board" onClick={touching(flow.fitView)}>
        Fit
      </button>
      <button type="button" className="follow-coach" aria-pressed={following} onClick={() => onFollowChange(!following)}>
        <span className="switch-track" aria-hidden="true">
          <span className="switch-knob" />
        </span>
        Follow coach
      </button>
    </div>
  );
}
