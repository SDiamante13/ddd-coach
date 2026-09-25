import { useRef, useState } from "react";
import { isBusy } from "../domain/exchange.ts";
import { UNLOCKED_FOR } from "../shared/accessContract.ts";
import { AccessGate } from "./AccessGate.tsx";
import { ComposerActions } from "./ComposerActions.tsx";
import { conversationText } from "./conversationText.ts";
import { restoredDraft } from "./draftLimit.ts";
import { ExchangeEntry } from "./ExchangeEntry.tsx";
import { ExchangeOutcome } from "./ExchangeOutcome.tsx";
import { MessageForm } from "./MessageForm.tsx";
import type { Unlock } from "./useAccess.ts";
import { useAccessRecovery } from "./useAccessRecovery.ts";
import { useClearConfirmation } from "./useClearConfirmation.ts";
import { useExchanges } from "./useExchanges.ts";

type ConnectionTestProps = { unlock: Unlock; justUnlocked: boolean };

export function ConnectionTest({ unlock, justUnlocked }: ConnectionTestProps) {
  const [draft, setDraft] = useState("");
  const boxRef = useRef<HTMLTextAreaElement>(null);
  const { accessLost, loseAccess, unlockAgain } = useAccessRecovery(unlock, () => boxRef.current?.focus());
  const { exchanges, send, retry, clear } = useExchanges({
    onRefused: (prompt) => setDraft((current) => restoredDraft(current, prompt)),
    onAccessLost: loseAccess,
  });
  const confirmation = useClearConfirmation(() => {
    clear();
    boxRef.current?.focus();
  });
  const busy = isBusy(exchanges);
  const conversation = () => conversationText(exchanges);

  return (
    <>
      <ol role="log">
        {exchanges.map((exchange) => (
          <ExchangeEntry key={exchange.id} exchange={exchange}>
            <ExchangeOutcome
              exchange={exchange}
              busy={busy}
              onRetry={retry}
              conversation={conversation}
              onStartNew={confirmation.ask}
            />
          </ExchangeEntry>
        ))}
      </ol>
      {accessLost && <AccessGate onUnlock={unlockAgain} />}
      {justUnlocked && (
        <p role="status" className="unlocked">
          {UNLOCKED_FOR}
        </p>
      )}
      <MessageForm busy={busy} draft={draft} onDraftChange={setDraft} onSend={send} boxRef={boxRef}>
        <ComposerActions
          started={exchanges.length > 0}
          busy={busy}
          confirmation={confirmation}
          conversation={conversation}
        />
      </MessageForm>
    </>
  );
}
