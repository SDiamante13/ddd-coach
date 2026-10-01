import { useReactFlow } from "@xyflow/react";
import { type RefObject, useEffect } from "react";
import { changeOf } from "../domain/board.ts";
import type { BoardView } from "./EventBoard.tsx";
import { CARD_WIDTH, LANE_INSET, lanePosition } from "./boardLayout.ts";
import { prefersReducedMotion } from "./motion.ts";

type PanView = Pick<BoardView, "board" | "followingCoach" | "atRest" | "newOffScreen" | "offerNew" | "newReveals">;

export function usePanToChanges(view: PanView, root: RefObject<HTMLElement | null>): void {
  const flow = useReactFlow();
  const { board } = view;
  const panTo = (index: number) => {
    const { y, zoom } = flow.getViewport();
    void flow.setViewport({ x: LANE_INSET - lanePosition(index).x * zoom, y, zoom }, { duration: prefersReducedMotion() ? 0 : 300 });
  };
  const onScreen = (index: number) => {
    const { x, zoom } = flow.getViewport();
    const left = lanePosition(index).x * zoom + x;
    return left >= 0 && left + CARD_WIDTH * zoom <= (root.current?.clientWidth ?? 0);
  };
  useEffect(() => {
    const changes = board.cards.map((card) => changeOf(board, card));
    const changed = changes.flatMap((change, index) => (change === null ? [] : [index]));
    if (view.atRest || changed.length === 0) return;
    if (view.followingCoach) return panTo(changed[0]!);
    const hidden = changed.filter((index) => !onScreen(index));
    if (hidden.length === 0) return;
    view.offerNew({ index: hidden[0]!, added: countOf(changes, "added"), updated: countOf(changes, "updated"), at: board.latest });
  }, [board.latest]);
  useEffect(() => {
    if (view.newReveals === 0 || view.newOffScreen === null) return;
    panTo(view.newOffScreen.index);
    view.offerNew(null);
  }, [view.newReveals]);
}

const countOf = (changes: readonly (string | null)[], kind: string): number => changes.filter((change) => change === kind).length;
