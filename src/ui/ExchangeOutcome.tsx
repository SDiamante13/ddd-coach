import type { Exchange, FailedExchange } from "../domain/exchange.ts";
import { CopyConversationButton } from "./CopyConversationButton.tsx";

export type ExchangeProps = {
  exchange: Exchange;
  busy: boolean;
  onRetry: (failed: FailedExchange) => void;
  conversation: () => string;
};

export function ExchangeOutcome({ exchange, busy, onRetry, conversation }: ExchangeProps) {
  switch (exchange.status) {
    case "pending":
      return <p>Coach is thinking…</p>;
    case "replied":
      return <p>{exchange.reply}</p>;
    case "failed":
      return (
        <>
          <p role="alert">
            {exchange.error}
            {!exchange.retryable && <CopyConversationButton text={conversation} />}
          </p>
          {exchange.retryable && (
            <button type="button" disabled={busy} onClick={() => onRetry(exchange)}>
              Retry
            </button>
          )}
        </>
      );
  }
}
