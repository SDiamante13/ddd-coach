import { useEffect } from "react";

const RESERVE = "--composer-reserve";

export function useComposerReserve(form: () => HTMLFormElement | null): void {
  useEffect(() => {
    const composer = form();
    if (composer === null || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      const height = entry?.borderBoxSize?.[0]?.blockSize ?? entry?.contentRect.height ?? 0;
      document.documentElement.style.setProperty(RESERVE, `calc(${Math.round(height)}px + var(--space-4))`);
    });
    observer.observe(composer);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty(RESERVE);
    };
  }, [form]);
}
