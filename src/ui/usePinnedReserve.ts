import { useLayoutEffect, type RefObject } from "react";

const RESERVE = "--pinned-reserve";

const reserve = (height: number) => document.documentElement.style.setProperty(RESERVE, `${Math.round(height)}px`);

export const reservedHeight = (entry: ResizeObserverEntry): number =>
  entry.borderBoxSize?.[0]?.blockSize ?? entry.target.getBoundingClientRect().height;

export function usePinnedReserve(pinned: RefObject<HTMLElement | null>, shown: boolean): void {
  useLayoutEffect(() => {
    const card = pinned.current;
    if (!shown || card === null) return;
    reserve(card.getBoundingClientRect().height);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(([entry]) => entry && reserve(reservedHeight(entry)));
    observer?.observe(card);
    return () => {
      observer?.disconnect();
      document.documentElement.style.removeProperty(RESERVE);
    };
  }, [pinned, shown]);
}
