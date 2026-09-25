import { useState, type FormEvent } from "react";
import { askCoach } from "./api/askCoach.ts";
import {
  fail,
  isBusy,
  parsePrompt,
  reply,
  retry,
  submit,
  type AskResult,
  type Exchange,
  type ExchangeId,
  type FailedExchange,
  type Prompt,
} from "./domain/exchange.ts";

export function App() {
  return (
    <main>
      <h1>DDD Coach</h1>
      <ConnectionTest />
    </main>
  );
}

function ConnectionTest() {
  const [draft, setDraft] = useState("");
  const [exchanges, setExchanges] = useState<readonly Exchange[]>([]);

  async function send(id: ExchangeId, prompt: Prompt) {
    const result = await askCoach(prompt);
    setExchanges((current) => settle(current, id, result));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const prompt = parsePrompt(draft);
    if (prompt === null) return;
    const id = crypto.randomUUID() as ExchangeId;
    setExchanges((current) => [...current, submit(id, prompt)]);
    setDraft("");
    void send(id, prompt);
  }

  function handleRetry(failed: FailedExchange) {
    setExchanges((current) => current.map((e) => (e.id === failed.id ? retry(e) : e)));
    void send(failed.id, failed.prompt);
  }

  return (
    <>
      <ol role="log">
        {exchanges.map((exchange) => (
          <ExchangeEntry key={exchange.id} exchange={exchange} onRetry={handleRetry} />
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

function settle(exchanges: readonly Exchange[], id: ExchangeId, result: AskResult) {
  return exchanges.map((exchange) => {
    if (exchange.id !== id || exchange.status !== "pending") return exchange;
    return result.ok ? reply(exchange, result.reply) : fail(exchange, result.error);
  });
}

type EntryProps = { exchange: Exchange; onRetry: (failed: FailedExchange) => void };

function ExchangeEntry({ exchange, onRetry }: EntryProps) {
  return (
    <li>
      <p>{exchange.prompt}</p>
      <ExchangeOutcome exchange={exchange} onRetry={onRetry} />
    </li>
  );
}

function ExchangeOutcome({ exchange, onRetry }: EntryProps) {
  switch (exchange.status) {
    case "pending":
      return <p>Coach is thinking…</p>;
    case "replied":
      return <p>{exchange.reply}</p>;
    case "failed":
      return (
        <>
          <p role="alert">{exchange.error}</p>
          <button type="button" onClick={() => onRetry(exchange)}>
            Retry
          </button>
        </>
      );
  }
}
