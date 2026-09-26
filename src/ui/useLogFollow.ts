import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import type { Exchange, ExchangeId } from "../domain/exchange.ts";
import { fitsAbove, inView, isFollowing, revealOptions } from "./logFollow.ts";
import { prefersReducedMotion } from "./motion.ts";
import { PINNED_QUESTION_ID } from "./PinnedQuestion.tsx";

export function useLogFollow(newest: Exchange | undefined, composer: () => Element | null) {
  const logRef = useRef<HTMLOListElement>(null);
  const shownId = useRef<ExchangeId | undefined>(undefined);
  const [newReply, setNewReply] = useState(false);
  const revealing = useRevealGuard();
  const following = useFollowing(logRef, composer, revealing, () => setNewReply(false));

  const revealNewest = () => {
    const outcome = newestOutcomeOf(logRef.current);
    if (!nothingToMove(outcome, composer())) revealing.start();
    const fits = fitsAboveComposer(outcome, composer());
    outcome?.scrollIntoView(revealOptions({ reducedMotion: prefersReducedMotion(), fits }));
    following.current = true;
    setNewReply(false);
  };

  useLayoutEffect(() => {
    const ownSend = newest?.id !== shownId.current;
    shownId.current = newest?.id;
    if (following.current || ownSend) revealNewest();
    else setNewReply(true);
  }, [newest]);

  return { logRef, newReply, revealNewest };
}

type RevealGuard = ReturnType<typeof useRevealGuard>;

function useFollowing(logRef: RefObject<HTMLOListElement | null>, composer: () => Element | null, revealing: RevealGuard, onBack: () => void) {
  const following = useRef(true);
  useEffect(
    () =>
      onWindowScroll(() => {
        if (revealing.active()) return;
        following.current = followingNow(logRef.current, composer());
        if (following.current) onBack();
      }),
    [composer, revealing],
  );
  return following;
}

const REVEAL_SETTLE_MS = 1000;

function useRevealGuard() {
  const until = useRef(0);
  const [guard] = useState(() => ({
    start: () => {
      until.current = performance.now() + REVEAL_SETTLE_MS;
    },
    active: () => performance.now() < until.current,
  }));
  useEffect(() => onWindowEvent("scrollend", () => (until.current = 0)), []);
  return guard;
}

function onWindowEvent(name: string, listener: () => void): () => void {
  window.addEventListener(name, listener);
  return () => window.removeEventListener(name, listener);
}

function onWindowScroll(listener: () => void): () => void {
  window.addEventListener("scroll", listener, { passive: true });
  return () => window.removeEventListener("scroll", listener);
}

function followingNow(log: HTMLOListElement | null, composer: Element | null): boolean {
  const newestEntry = log?.lastElementChild;
  if (!newestEntry || !composer) return true;
  return isFollowing({
    newestEntryBottom: newestEntry.getBoundingClientRect().bottom,
    composerTop: composer.getBoundingClientRect().top,
  });
}

function nothingToMove(outcome: Element | null | undefined, composer: Element | null): boolean {
  if (!outcome) return true;
  if (!composer) return false;
  const { top, bottom } = outcome.getBoundingClientRect();
  return inView({ top, bottom, composerTop: composer.getBoundingClientRect().top, topInset: pinnedBottom() });
}

function fitsAboveComposer(outcome: Element | null | undefined, composer: Element | null): boolean {
  if (!outcome || !composer) return true;
  const { height } = outcome.getBoundingClientRect();
  return fitsAbove({ height, composerTop: composer.getBoundingClientRect().top, topInset: pinnedBottom() });
}

function pinnedBottom(): number {
  return Math.max(0, document.getElementById(PINNED_QUESTION_ID)?.getBoundingClientRect().bottom ?? 0);
}

function newestOutcomeOf(log: HTMLOListElement | null): Element | null | undefined {
  return log?.lastElementChild?.lastElementChild;
}
