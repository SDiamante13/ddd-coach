import { useState } from "react";
import { isBusy } from "../domain/exchange.ts";
import { conversationText } from "./conversationText.ts";
import { restoredDraft } from "./draftLimit.ts";
import { ExchangeEntry } from "./ExchangeEntry.tsx";
import { ExchangeOutcome } from "./ExchangeOutcome.tsx";
import { MessageForm } from "./MessageForm.tsx";
import { NewConversation } from "./NewConversation.tsx";
import { useClearConfirmation } from "./useClearConfirmation.ts";
import { useExchanges } from "./useExchanges.ts";

export function ConnectionTest() {
  const [draft, setDraft] = useState("");
  const { exchanges, send, retry, clear } = useExchanges({
    onRefused: (prompt) => setDraft((current) => restoredDraft(current, prompt)),
  });
  const confirmation = useClearConfirmation(clear);
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
            />
          </ExchangeEntry>
        ))}
      </ol>
      <MessageForm busy={busy} draft={draft} onDraftChange={setDraft} onSend={send}>
        {exchanges.length > 0 && <NewConversation busy={busy} confirmation={confirmation} conversation={conversation} />}
      </MessageForm>
    </>
  );
}
