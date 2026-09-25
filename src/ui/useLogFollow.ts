import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Exchange, ExchangeId } from "../domain/exchange.ts";
import { isFollowing, revealOptions } from "./logFollow.ts";
import { prefersReducedMotion } from "./motion.ts";

export function useLogFollow(newest: Exchange | undefined, composer: () => Element | null) {
  const logRef = useRef<HTMLOListElement>(null);
  const following = useRef(true);
  const shownId = useRef<ExchangeId | undefined>(undefined);
  const [newReply, setNewReply] = useState(false);

  useEffect(
    () =>
      onWindowScroll(() => {
        following.current = followingNow(logRef.current, composer());
        if (following.current) setNewReply(false);
      }),
    [composer],
  );

  const revealNewest = () => {
    newestOutcomeOf(logRef.current)?.scrollIntoView(revealOptions({ reducedMotion: prefersReducedMotion() }));
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

function newestOutcomeOf(log: HTMLOListElement | null): Element | null | undefined {
  return log?.lastElementChild?.lastElementChild;
}
