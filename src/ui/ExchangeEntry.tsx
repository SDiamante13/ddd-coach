import { ExchangeOutcome, type ExchangeProps } from "./ExchangeOutcome.tsx";
import { PromptText } from "./PromptText.tsx";

export function ExchangeEntry({ exchange, busy, onRetry }: ExchangeProps) {
  return (
    <li data-status={exchange.status}>
      <PromptText prompt={exchange.prompt} />
      <ExchangeOutcome exchange={exchange} busy={busy} onRetry={onRetry} />
    </li>
  );
}
