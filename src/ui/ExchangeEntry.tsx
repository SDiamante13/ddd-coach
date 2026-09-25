import type { Exchange } from "../domain/exchange.ts";
import { ExchangeOutcome, type ExchangeProps } from "./ExchangeOutcome.tsx";
import { PromptText } from "./PromptText.tsx";

export function ExchangeEntry({ exchange, busy, onRetry }: ExchangeProps) {
  return (
    <li data-status={shownStatus(exchange)}>
      <PromptText prompt={exchange.prompt} />
      <ExchangeOutcome exchange={exchange} busy={busy} onRetry={onRetry} />
    </li>
  );
}

function shownStatus(exchange: Exchange): string {
  return exchange.status === "failed" && !exchange.retryable ? "refused" : exchange.status;
}
