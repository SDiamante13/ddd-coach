import { useCallback, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { lastLongPaste } from "../domain/conversation.ts";
import { isBusy, type Exchange, type Prompt } from "../domain/exchange.ts";
import { applySwaps, restoreSwaps, type SwappedText } from "../domain/swaps.ts";
import { EXAMPLE_THREAD } from "../shared/exampleThread.ts";
import { conversationText } from "./conversationText.ts";
import { restoredDraft } from "./draftLimit.ts";
import type { Unlock } from "./useAccess.ts";
import { useAccessRecovery } from "./useAccessRecovery.ts";
import { useClearConfirmation } from "./useClearConfirmation.ts";
import { useComposerReserve } from "./useComposerReserve.ts";
import { useGlossary } from "./useGlossary.ts";
import { outgoingGlossary } from "../domain/glossary.ts";
import { CORRECTIONS_ENABLED, GLOSSARY_ENABLED } from "../shared/features.ts";
import { sentCorrectionsOf } from "../domain/board.ts";
import { boardOf } from "../domain/boardFromReplies.ts";
import { useCorrections } from "./useCorrections.ts";
import { useExchanges } from "./useExchanges.ts";
import { useLogFollow } from "./useLogFollow.ts";
import { useSwaps } from "./useSwaps.ts";

export type Composer = ReturnType<typeof useComposer>;

export function useComposer(unlock: Unlock) {
  const box = useDraftBox();
  const glossary = useGlossary();
  const fixes = useCorrections(box.outgoing);
  const access = useAccessRecovery(unlock, box.focus);
  const { exchanges, send, retry, clear } = useExchanges({
    onRefused: box.restore,
    onAccessLost: access.loseAccess,
    glossary: () => (GLOSSARY_ENABLED ? outgoingGlossary(glossary.rows, box.swaps.swaps).sent : []),
    corrections: () => (CORRECTIONS_ENABLED ? sentCorrectionsOf(boardOf(exchanges, fixes.corrections)) : []),
  });
  const confirmation = useClearConfirmation((startWith) => {
    clear();
    if (startWith === undefined) box.focus();
    else box.startWith(startWith);
  });
  const follow = useLogFollow(exchanges.at(-1), box.form);
  useComposerReserve(box.form);
  const submit = (prompt: Prompt) => {
    send(prompt);
    box.swapsPanel.setOpen(false);
    box.focus();
  };
  const conversation = () => conversationText(exchanges, (text) => box.restoreNames(text).text);
  const pastedThread = pastedThreadOf(exchanges, box.restoreNames);
  return { box, access, exchanges, retry, confirmation, follow, submit, conversation, glossary, fixes, pastedThread, busy: isBusy(exchanges) };
}

function pastedThreadOf(exchanges: readonly Exchange[], restoreNames: (text: string) => SwappedText): string | undefined {
  const pasted = lastLongPaste(exchanges);
  return pasted === undefined ? undefined : restoreNames(pasted).text;
}

function useDraftBox() {
  const [draft, setDraft] = useState("");
  const boxRef = useRef<HTMLTextAreaElement>(null);
  const swaps = useSwaps();
  const form = useCallback(() => boxRef.current?.form ?? null, []);
  const focus = () => boxRef.current?.focus();
  const restore = (prompt: Prompt) => setDraft((current) => restoredDraft(current, prompt));
  const startWith = (text: string) => {
    flushSync(() => setDraft(text));
    focusAtEnd(boxRef.current);
  };
  const tryExample = () => {
    flushSync(() => setDraft(EXAMPLE_THREAD));
    showFromTop(boxRef.current);
  };
  const outgoing = (text: string) => applySwaps(swaps.swaps, text).text;
  const restoreNames = (text: string): SwappedText => restoreSwaps(swaps.swaps, text);
  const [swapsOpen, setSwapsOpen] = useState(false);
  const swapsPanel = { open: swapsOpen, setOpen: setSwapsOpen };
  return { draft, setDraft, boxRef, swaps, swapsPanel, form, focus, restore, startWith, tryExample, outgoing, restoreNames, blank: draft.trim() === "" };
}

function focusAtEnd(box: HTMLTextAreaElement | null) {
  if (!box) return;
  box.focus();
  box.setSelectionRange(box.value.length, box.value.length);
}

function showFromTop(box: HTMLTextAreaElement | null) {
  if (!box) return;
  box.focus();
  box.setSelectionRange(0, 0);
  box.scrollTop = 0;
}
