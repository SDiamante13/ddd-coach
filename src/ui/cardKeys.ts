import type { KeyboardEvent } from "react";
import type { Position } from "../domain/cardMoves.ts";
import { MESSAGE_BOX_ID } from "./MessageForm.tsx";

const NUDGE = 16;
const NUDGES: Record<string, Position> = { ArrowLeft: { x: -NUDGE, y: 0 }, ArrowRight: { x: NUDGE, y: 0 }, ArrowUp: { x: 0, y: -NUDGE }, ArrowDown: { x: 0, y: NUDGE } };
const STEPS: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1 };

export type CardKeyActions = { nudge: (by: Position) => void; edit: () => void };

export function nudgeOf(event: KeyboardEvent): Position | undefined {
  return event.shiftKey ? NUDGES[event.key] : undefined;
}

export function onCardKey(event: KeyboardEvent<HTMLButtonElement>, { nudge, edit }: CardKeyActions): void {
  const by = NUDGES[event.key];
  if (event.shiftKey && by) return handled(event, () => nudge(by));
  const step = STEPS[event.key];
  if (step !== undefined) return handled(event, () => focusCard(event.currentTarget, step));
  if (event.key === "Enter") return handled(event, edit);
  if (event.key === "Escape") document.getElementById(MESSAGE_BOX_ID)?.focus();
}

function handled(event: KeyboardEvent, act: () => void): void {
  event.preventDefault();
  act();
}

function focusCard(from: HTMLElement, step: number): void {
  const cards = [...(from.closest(".board-lane")?.querySelectorAll<HTMLElement>("button.card") ?? [])];
  cards[cards.indexOf(from) + step]?.focus();
}
