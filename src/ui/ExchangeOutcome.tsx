import type { Exchange, FailedExchange } from "../domain/exchange.ts";

export type ExchangeProps = { exchange: Exchange; onRetry: (failed: FailedExchange) => void };

export function ExchangeOutcome({ exchange, onRetry }: ExchangeProps) {
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
