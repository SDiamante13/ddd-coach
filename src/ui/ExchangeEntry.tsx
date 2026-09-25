import type { ReactNode } from "react";
import type { Exchange } from "../domain/exchange.ts";
import { PromptText } from "./PromptText.tsx";

export function ExchangeEntry({ exchange, children }: { exchange: Exchange; children: ReactNode }) {
  return (
    <li data-status={shownStatus(exchange)}>
      <PromptText prompt={exchange.prompt} />
      {children}
    </li>
  );
}

function shownStatus(exchange: Exchange): string {
  return exchange.status === "failed" && !exchange.retryable ? "refused" : exchange.status;
}
