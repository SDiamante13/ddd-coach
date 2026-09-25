import { useCallback, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { isBusy, type Prompt } from "../domain/exchange.ts";
import { applySwaps, restoreSwaps, type SwappedText } from "../domain/swaps.ts";
import { EXAMPLE_THREAD } from "../shared/exampleThread.ts";
import { conversationText } from "./conversationText.ts";
import { restoredDraft } from "./draftLimit.ts";
import type { Unlock } from "./useAccess.ts";
import { useAccessRecovery } from "./useAccessRecovery.ts";
import { useClearConfirmation } from "./useClearConfirmation.ts";
import { useComposerReserve } from "./useComposerReserve.ts";
import { useExchanges } from "./useExchanges.ts";
import { useLogFollow } from "./useLogFollow.ts";
import { useSwaps } from "./useSwaps.ts";

export type Composer = ReturnType<typeof useComposer>;

export function useComposer(unlock: Unlock) {
  const box = useDraftBox();
  const access = useAccessRecovery(unlock, box.focus);
  const { exchanges, send, retry, clear } = useExchanges({
    onRefused: box.restore,
    onAccessLost: access.loseAccess,
  });
  const confirmation = useClearConfirmation(() => {
    clear();
    box.focus();
  });
  const follow = useLogFollow(exchanges.at(-1), box.form);
  useComposerReserve(box.form);
  const submit = (prompt: Prompt) => {
    send(prompt);
    box.swapsPanel.setOpen(false);
    box.focus();
  };
  const conversation = () => conversationText(exchanges, (text) => box.restoreNames(text).text);
  return { box, access, exchanges, retry, confirmation, follow, submit, conversation, busy: isBusy(exchanges) };
}

function useDraftBox() {
  const [draft, setDraft] = useState("");
  const boxRef = useRef<HTMLTextAreaElement>(null);
  const swaps = useSwaps();
  const form = useCallback(() => boxRef.current?.form ?? null, []);
  const focus = () => boxRef.current?.focus();
  const restore = (prompt: Prompt) => setDraft((current) => restoredDraft(current, prompt));
  const tryExample = () => {
    flushSync(() => setDraft(EXAMPLE_THREAD));
    showFromTop(boxRef.current);
  };
  const outgoing = (text: string) => applySwaps(swaps.swaps, text).text;
  const restoreNames = (text: string): SwappedText => restoreSwaps(swaps.swaps, text);
  const [swapsOpen, setSwapsOpen] = useState(false);
  const swapsPanel = { open: swapsOpen, setOpen: setSwapsOpen };
  return { draft, setDraft, boxRef, swaps, swapsPanel, form, focus, restore, tryExample, outgoing, restoreNames, blank: draft.trim() === "" };
}

function showFromTop(box: HTMLTextAreaElement | null) {
  if (!box) return;
  box.focus();
  box.setSelectionRange(0, 0);
  box.scrollTop = 0;
}
