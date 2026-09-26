import type { ReactNode } from "react";
import { isRefused, type Exchange } from "../domain/exchange.ts";
import type { LineMatch } from "../domain/sourceLine.ts";
import { PromptText } from "./PromptText.tsx";

type ExchangeEntryProps = { exchange: Exchange; highlight?: LineMatch | null; children: ReactNode };

export function ExchangeEntry({ exchange, highlight = null, children }: ExchangeEntryProps) {
  return (
    <li data-status={shownStatus(exchange)} tabIndex={-1}>
      <PromptText prompt={exchange.prompt} highlight={highlight} />
      {children}
    </li>
  );
}

function shownStatus(exchange: Exchange): string {
  return isRefused(exchange) ? "refused" : exchange.status;
}
