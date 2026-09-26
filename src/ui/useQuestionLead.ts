import { useLayoutEffect, type RefObject } from "react";
import { questionLead } from "./questionLead.ts";

const LEAD = "--question-lead";

export function useQuestionLead(pinned: RefObject<HTMLElement | null>, expanded: boolean, questionKey: string | null): void {
  useLayoutEffect(() => {
    const box = pinned.current;
    const card = box?.querySelector<HTMLElement>(".question-card");
    if (!box || !card) return;
    const measure = () => box.style.setProperty(LEAD, `${leadOf(card)}px`);
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(card);
    return () => observer?.disconnect();
  }, [pinned, expanded, questionKey]);
}

function leadOf(card: HTMLElement): number {
  const anchor = card.querySelector(".question-sources li") ?? card.querySelector(".question-text");
  const style = getComputedStyle(card);
  return questionLead({
    cardTop: card.getBoundingClientRect().top,
    anchorBottom: anchor?.getBoundingClientRect().bottom ?? 0,
    scrollTop: card.scrollTop,
    bottomInset: pixels(style.paddingBottom) + pixels(style.borderBottomWidth),
  });
}

const pixels = (value: string): number => Number.parseFloat(value) || 0;
