import { ExchangeOutcome, type ExchangeProps } from "./ExchangeOutcome.tsx";

export function ExchangeEntry({ exchange, busy, onRetry }: ExchangeProps) {
  return (
    <li data-status={exchange.status}>
      <p>{exchange.prompt}</p>
      <ExchangeOutcome exchange={exchange} busy={busy} onRetry={onRetry} />
    </li>
  );
}
