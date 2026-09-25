import { ExchangeOutcome, type ExchangeProps } from "./ExchangeOutcome.tsx";

export function ExchangeEntry({ exchange, busy, onRetry }: ExchangeProps) {
  return (
    <li>
      <p>{exchange.prompt}</p>
      <ExchangeOutcome exchange={exchange} busy={busy} onRetry={onRetry} />
    </li>
  );
}
