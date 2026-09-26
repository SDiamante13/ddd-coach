import { useEffect, type RefObject } from "react";

const RESERVE = "--pinned-reserve";

export function usePinnedReserve(pinned: RefObject<HTMLElement | null>, shown: boolean): void {
  useEffect(() => {
    const card = pinned.current;
    if (!shown || card === null || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      const height = entry?.borderBoxSize?.[0]?.blockSize ?? entry?.contentRect.height ?? 0;
      document.documentElement.style.setProperty(RESERVE, `${Math.round(height)}px`);
    });
    observer.observe(card);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty(RESERVE);
    };
  }, [pinned, shown]);
}
