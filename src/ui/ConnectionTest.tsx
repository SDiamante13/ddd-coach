import { useCallback, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { isBusy, type Prompt } from "../domain/exchange.ts";
import { applySwaps } from "../domain/swaps.ts";
import { UNLOCKED_FOR } from "../shared/accessContract.ts";
import { EXAMPLE_THREAD } from "../shared/exampleThread.ts";
import { AccessGate } from "./AccessGate.tsx";
import { ComposerActions } from "./ComposerActions.tsx";
import { conversationText } from "./conversationText.ts";
import { restoredDraft } from "./draftLimit.ts";
import { ExchangeLog } from "./ExchangeLog.tsx";
import { MessageForm } from "./MessageForm.tsx";
import { NewReplyButton } from "./NewReplyButton.tsx";
import { SentPreview } from "./SentPreview.tsx";
import { SwapPanel } from "./SwapPanel.tsx";
import type { Unlock } from "./useAccess.ts";
import { useAccessRecovery } from "./useAccessRecovery.ts";
import { useClearConfirmation } from "./useClearConfirmation.ts";
import { useExchanges } from "./useExchanges.ts";
import { useLogFollow } from "./useLogFollow.ts";
import { useSwaps } from "./useSwaps.ts";

type ConnectionTestProps = { unlock: Unlock; justUnlocked: boolean };

export function ConnectionTest({ unlock, justUnlocked }: ConnectionTestProps) {
  const [draft, setDraft] = useState("");
  const boxRef = useRef<HTMLTextAreaElement>(null);
  const swaps = useSwaps();
  const { accessLost, loseAccess, unlockAgain } = useAccessRecovery(unlock, () => boxRef.current?.focus());
  const { exchanges, send, retry, clear } = useExchanges({
    onRefused: (prompt) => setDraft((current) => restoredDraft(current, prompt)),
    onAccessLost: loseAccess,
  });
  const confirmation = useClearConfirmation(() => {
    clear();
    boxRef.current?.focus();
  });
  const composer = useCallback(() => boxRef.current?.form ?? null, []);
  const follow = useLogFollow(exchanges.at(-1), composer);
  const busy = isBusy(exchanges);
  const draftBlank = draft.trim() === "";
  const sendFromBox = (prompt: Prompt) => {
    send(prompt);
    boxRef.current?.focus();
  };
  const conversation = () => conversationText(exchanges);
  const tryExample = () => {
    flushSync(() => setDraft(EXAMPLE_THREAD));
    showFromTop(boxRef.current);
  };

  return (
    <>
      <ExchangeLog
        exchanges={exchanges}
        busy={busy}
        onRetry={retry}
        conversation={conversation}
        onStartNew={confirmation.ask}
        logRef={follow.logRef}
      />
      {accessLost && <AccessGate onUnlock={unlockAgain} />}
      {justUnlocked && (
        <p role="status" className="unlocked">
          {UNLOCKED_FOR}
        </p>
      )}
      <MessageForm
        busy={busy}
        draft={draft}
        onDraftChange={setDraft}
        onSend={sendFromBox}
        outgoing={(text) => applySwaps(swaps.swaps, text).text}
        boxRef={boxRef}
        notice={follow.newReply && <NewReplyButton onReveal={follow.revealNewest} />}
      >
        <ComposerActions
          started={exchanges.length > 0}
          draftBlank={draftBlank}
          busy={busy}
          confirmation={confirmation}
          conversation={conversation}
          onTryExample={tryExample}
        />
        <SwapPanel {...swaps} thread={draft} />
        {!draftBlank && <SentPreview swaps={swaps.swaps} draft={draft} />}
      </MessageForm>
    </>
  );
}

function showFromTop(box: HTMLTextAreaElement | null) {
  if (!box) return;
  box.focus();
  box.setSelectionRange(0, 0);
  box.scrollTop = 0;
}
