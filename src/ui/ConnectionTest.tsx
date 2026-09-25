import { useState, type FormEvent } from "react";
import { isBusy, parsePrompt } from "../domain/exchange.ts";
import { ExchangeEntry } from "./ExchangeEntry.tsx";
import { useExchanges } from "./useExchanges.ts";

export function ConnectionTest() {
  const [draft, setDraft] = useState("");
  const { exchanges, send, retry } = useExchanges();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const prompt = parsePrompt(draft);
    if (prompt === null) return;
    setDraft("");
    send(prompt);
  }

  return (
    <>
      <ol role="log">
        {exchanges.map((exchange) => (
          <ExchangeEntry key={exchange.id} exchange={exchange} onRetry={retry} />
        ))}
      </ol>
      <form onSubmit={handleSubmit}>
        <label>
          Message
          <input type="text" autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} />
        </label>
        <button type="submit" disabled={isBusy(exchanges)}>
          Send
        </button>
      </form>
    </>
  );
}
