import type { Exchange, FailedExchange } from "../domain/exchange.ts";
import { ExchangeEntry } from "./ExchangeEntry.tsx";
import { ExchangeOutcome } from "./ExchangeOutcome.tsx";

type ExchangeLogProps = {
  exchanges: readonly Exchange[];
  busy: boolean;
  onRetry: (failed: FailedExchange) => void;
  conversation: () => string;
  onStartNew: () => void;
};

export function ExchangeLog({ exchanges, busy, onRetry, conversation, onStartNew }: ExchangeLogProps) {
  return (
    <ol role="log">
      {exchanges.map((exchange) => (
        <ExchangeEntry key={exchange.id} exchange={exchange}>
          <ExchangeOutcome
            exchange={exchange}
            busy={busy}
            onRetry={onRetry}
            conversation={conversation}
            onStartNew={onStartNew}
          />
        </ExchangeEntry>
      ))}
    </ol>
  );
}
