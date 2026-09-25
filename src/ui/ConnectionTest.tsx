import { useState } from "react";
import { isBusy } from "../domain/exchange.ts";
import { ExchangeEntry } from "./ExchangeEntry.tsx";
import { MessageForm } from "./MessageForm.tsx";
import { useExchanges } from "./useExchanges.ts";

export function ConnectionTest() {
  const { exchanges, send, retry } = useExchanges();
  const busy = isBusy(exchanges);
  const [draft, setDraft] = useState("");

  return (
    <>
      <ol role="log">
        {exchanges.map((exchange) => (
          <ExchangeEntry key={exchange.id} exchange={exchange} busy={busy} onRetry={retry} />
        ))}
      </ol>
      <MessageForm busy={busy} draft={draft} onDraftChange={setDraft} onSend={send} />
    </>
  );
}
