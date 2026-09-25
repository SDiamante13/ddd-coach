import type { ReactNode } from "react";
import { isRefused, type Exchange } from "../domain/exchange.ts";
import { PromptText } from "./PromptText.tsx";

export function ExchangeEntry({ exchange, children }: { exchange: Exchange; children: ReactNode }) {
  return (
    <li data-status={shownStatus(exchange)} tabIndex={-1}>
      <PromptText prompt={exchange.prompt} />
      {children}
    </li>
  );
}

function shownStatus(exchange: Exchange): string {
  return isRefused(exchange) ? "refused" : exchange.status;
}
