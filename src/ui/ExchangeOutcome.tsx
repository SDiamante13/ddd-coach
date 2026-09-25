import { isRefused, type Exchange, type FailedExchange } from "../domain/exchange.ts";
import { CopyConversationButton } from "./CopyConversationButton.tsx";

type ExchangeOutcomeProps = {
  exchange: Exchange;
  busy: boolean;
  onRetry: (failed: FailedExchange) => void;
  conversation: () => string;
  onStartNew: () => void;
};

export function ExchangeOutcome({ exchange, busy, onRetry, conversation, onStartNew }: ExchangeOutcomeProps) {
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
            {isRefused(exchange) && (
              <span className="refusal-actions">
                <CopyConversationButton text={conversation} />
                <button type="button" onClick={onStartNew}>
                  Start a new one
                </button>
              </span>
            )}
          </p>
          {!isRefused(exchange) && (
            <button type="button" disabled={busy} onClick={() => onRetry(exchange)}>
              Retry
            </button>
          )}
        </>
      );
  }
}
