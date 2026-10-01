import { useReactFlow, useViewport } from "@xyflow/react";
import type { BoardView } from "./EventBoard.tsx";
import { CARD_WIDTH, EDGE_CHIP_SAFE, lanePosition } from "./boardLayout.ts";
import { prefersReducedMotion } from "./motion.ts";
import { MoreBelowChip } from "./MoreBelowChip.tsx";
import { NewEventsChip } from "./NewEventsChip.tsx";
import type { LaneSize } from "./useLaneSize.ts";

const plural = (count: number) => (count === 1 ? "event" : "events");

export function EdgeChips({ view, lane: { width, height } }: { view: BoardView; lane: LaneSize }) {
  const { x, zoom } = useViewport();
  const flow = useReactFlow();
  const lefts = view.board.cards.map((_card, index) => lanePosition(index).x * zoom + x);
  const earlier = lefts.flatMap((left, index) => (left < 0 ? [index] : []));
  const later = lefts.flatMap((left, index) => (left + CARD_WIDTH * zoom > width ? [index] : []));
  const glideTo = (viewportX: number) => {
    view.pauseFollow();
    void flow.setViewport({ x: viewportX, y: flow.getViewport().y, zoom }, { duration: prefersReducedMotion() ? 0 : 300 });
  };
  const showEarlier = () => glideTo(width - EDGE_CHIP_SAFE - (lanePosition(earlier.at(-1)!).x + CARD_WIDTH) * zoom);
  const showLater = () => glideTo(EDGE_CHIP_SAFE - lanePosition(later[0]!).x * zoom);
  return (
    <>
      {earlier.length > 0 && (
        <button type="button" className="edge-chip earlier" aria-label={`Show the ${earlier.length} earlier ${plural(earlier.length)}`} onClick={showEarlier}>
          ◂ {earlier.length} earlier
        </button>
      )}
      {view.newOffScreen ? (
        <NewEventsChip events={view.newOffScreen} onReveal={view.revealNew} />
      ) : (
        later.length > 0 && (
          <button type="button" className="edge-chip later" aria-label={`Show the ${later.length} later ${plural(later.length)}`} onClick={showLater}>
            {later.length} later ▸
          </button>
        )
      )}
      <MoreBelowChip height={height} onPan={view.pauseFollow} />
    </>
  );
}
