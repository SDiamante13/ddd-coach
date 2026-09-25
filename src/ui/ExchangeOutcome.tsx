import type { Exchange, FailedExchange } from "../domain/exchange.ts";

export type ExchangeProps = {
  exchange: Exchange;
  busy: boolean;
  onRetry: (failed: FailedExchange) => void;
};

export function ExchangeOutcome({ exchange, busy, onRetry }: ExchangeProps) {
  switch (exchange.status) {
    case "pending":
      return <p>Coach is thinking…</p>;
    case "replied":
      return <p>{exchange.reply}</p>;
    case "failed":
      return (
        <>
          <p role="alert">{exchange.error}</p>
          <button type="button" disabled={busy} onClick={() => onRetry(exchange)}>
            Retry
          </button>
        </>
      );
  }
}
