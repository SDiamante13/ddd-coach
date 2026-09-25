import { useState } from "react";
import { askCoach } from "../api/askCoach.ts";
import {
  canRetry,
  retry,
  settle,
  submit,
  type Exchange,
  type ExchangeId,
  type FailedExchange,
  type Prompt,
} from "../domain/exchange.ts";

export function useExchanges() {
  const [exchanges, setExchanges] = useState<readonly Exchange[]>([]);

  async function ask(id: ExchangeId, prompt: Prompt) {
    const result = await askCoach(prompt);
    setExchanges((current) => settle(current, id, result));
  }

  function send(prompt: Prompt) {
    const id = crypto.randomUUID() as ExchangeId;
    setExchanges((current) => [...current, submit(id, prompt)]);
    void ask(id, prompt);
  }

  function retryFailed(failed: FailedExchange) {
    if (!canRetry(exchanges, failed.id)) return;
    setExchanges((current) => current.map((e) => (e.id === failed.id ? retry(e) : e)));
    void ask(failed.id, failed.prompt);
  }

  return { exchanges, send, retry: retryFailed };
}
