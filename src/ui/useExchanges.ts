import type { SentCorrection } from "../domain/board.ts";
import { useRef, useState } from "react";
import { askCoach } from "../api/askCoach.ts";
import { historyBefore, turnsOf, type Conversation } from "../domain/conversation.ts";
import type { KeptGlossaryRow } from "../domain/glossary.ts";
import {
  canRetry,
  canSend,
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
  corrections?: () => readonly SentCorrection[];
  initial?: readonly Exchange[];
};

export function useExchanges({ onRefused, onAccessLost, glossary = () => [], corrections = () => [], initial = [] }: ExchangeCallbacks = {}) {
  const [exchanges, setExchanges] = useState<readonly Exchange[]>(initial);
  const latest = useRef(exchanges);
  latest.current = exchanges;
  const update = (change: (current: readonly Exchange[]) => readonly Exchange[]) => {
    latest.current = change(latest.current);
    setExchanges(change);
  };

  async function ask(id: ExchangeId, conversation: Conversation) {
    const result = await askCoach(conversation);
    setExchanges((current) => settle(current, id, result));
    if (isRefused(result)) onRefused?.(conversation.prompt);
    if (!result.ok && result.remedy === "unlock") onAccessLost?.();
  }

  function send(prompt: Prompt) {
    if (!canSend(latest.current)) return;
    const id = crypto.randomUUID() as ExchangeId;
    update((current) => [...current, submit(id, prompt)]);
    void ask(id, { history: turnsOf(exchanges), prompt, glossary: glossary(), corrections: corrections() });
  }

  function retryFailed(failed: FailedExchange) {
    if (!canRetry(latest.current, failed.id)) return;
    update((current) => current.map((e) => (e.id === failed.id ? retry(e) : e)));
    void ask(failed.id, { history: historyBefore(exchanges, failed.id), prompt: failed.prompt, glossary: glossary(), corrections: corrections() });
  }

  return { exchanges, send, retry: retryFailed, clear: () => setExchanges([]) };
}
