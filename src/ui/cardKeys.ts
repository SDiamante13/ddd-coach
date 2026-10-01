import type { KeyboardEvent } from "react";
import type { Position } from "../domain/cardMoves.ts";

const NUDGE = 16;
const NUDGES: Record<string, Position> = { ArrowLeft: { x: -NUDGE, y: 0 }, ArrowRight: { x: NUDGE, y: 0 }, ArrowUp: { x: 0, y: -NUDGE }, ArrowDown: { x: 0, y: NUDGE } };

export type CardKeyActions = { nudge: (by: Position) => void; edit: () => void };

export function nudgeOf(event: KeyboardEvent): Position | undefined {
  return event.shiftKey ? NUDGES[event.key] : undefined;
}

export function onCardKey(event: KeyboardEvent<HTMLButtonElement>, { nudge, edit }: CardKeyActions): void {
  const by = NUDGES[event.key];
  if (event.shiftKey && by) return handled(event, () => nudge(by));
  if (event.key === "Enter") handled(event, edit);
}

function handled(event: KeyboardEvent, act: () => void): void {
  event.preventDefault();
  act();
}
