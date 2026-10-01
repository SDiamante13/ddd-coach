import type { KeyboardEvent } from "react";

const LANES = ["events", "question", "words"] as const;
const ACROSS: Record<string, number> = { ArrowUp: -1, ArrowDown: 1 };
const ALONG: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1 };

export function onBoardKey(event: KeyboardEvent<HTMLElement>): void {
  const item = (event.target as HTMLElement).closest<HTMLElement>("[data-board-item]");
  if (item === null || event.shiftKey || event.altKey || event.metaKey || event.ctrlKey) return;
  const next = event.key === "Escape" ? event.currentTarget.closest(".event-board")?.querySelector<HTMLElement>(".board-controls button") ?? null : neighbourOf(item, event.key, event.currentTarget);
  if (next === null || next === undefined) return;
  event.preventDefault();
  next.focus();
}

function neighbourOf(item: HTMLElement, key: string, board: HTMLElement): HTMLElement | undefined {
  const lanes = LANES.map((lane) => [...board.querySelectorAll<HTMLElement>(`[data-board-item][data-lane="${lane}"]`)]).filter((items) => items.length > 0);
  const lane = lanes.findIndex((items) => items.includes(item));
  if (ALONG[key] !== undefined) return lanes[lane]![lanes[lane]!.indexOf(item) + ALONG[key]!];
  if (ACROSS[key] !== undefined) return nearest(item, lanes[lane + ACROSS[key]!]);
  return undefined;
}

function nearest(item: HTMLElement, candidates: HTMLElement[] | undefined): HTMLElement | undefined {
  const centre = (element: HTMLElement) => {
    const { left, width } = element.getBoundingClientRect();
    return left + width / 2;
  };
  const from = centre(item);
  return candidates?.reduce((best, candidate) => (Math.abs(centre(candidate) - from) < Math.abs(centre(best) - from) ? candidate : best));
}
