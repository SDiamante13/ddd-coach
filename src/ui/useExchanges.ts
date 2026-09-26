import { useState } from "react";
import { askCoach } from "../api/askCoach.ts";
import { historyBefore, turnsOf, type Conversation } from "../domain/conversation.ts";
import type { KeptGlossaryRow } from "../domain/glossary.ts";
import {
  canRetry,
  isRefused,
  retry,
  settle,
  submit,
  type Exchange,
  type ExchangeId,
  type FailedExchange,
  type Prompt,
} from "../domain/exchange.ts";

type ExchangeCallbacks = {
  onRefused?: (prompt: Prompt) => void;
  onAccessLost?: () => void;
  glossary?: () => readonly KeptGlossaryRow[];
};

export function useExchanges({ onRefused, onAccessLost, glossary = () => [] }: ExchangeCallbacks = {}) {
  const [exchanges, setExchanges] = useState<readonly Exchange[]>([]);

  async function ask(id: ExchangeId, conversation: Conversation) {
    const result = await askCoach(conversation);
    setExchanges((current) => settle(current, id, result));
    if (isRefused(result)) onRefused?.(conversation.prompt);
    if (!result.ok && result.remedy === "unlock") onAccessLost?.();
  }

  function send(prompt: Prompt) {
    const id = crypto.randomUUID() as ExchangeId;
    setExchanges((current) => [...current, submit(id, prompt)]);
    void ask(id, { history: turnsOf(exchanges), prompt, glossary: glossary() });
  }

  function retryFailed(failed: FailedExchange) {
    if (!canRetry(exchanges, failed.id)) return;
    setExchanges((current) => current.map((e) => (e.id === failed.id ? retry(e) : e)));
    void ask(failed.id, { history: historyBefore(exchanges, failed.id), prompt: failed.prompt, glossary: glossary() });
  }

  return { exchanges, send, retry: retryFailed, clear: () => setExchanges([]) };
}
