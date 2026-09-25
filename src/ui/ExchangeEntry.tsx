import { ExchangeOutcome, type ExchangeProps } from "./ExchangeOutcome.tsx";

export function ExchangeEntry({ exchange, onRetry }: ExchangeProps) {
  return (
    <li>
      <p>{exchange.prompt}</p>
      <ExchangeOutcome exchange={exchange} onRetry={onRetry} />
    </li>
  );
}
