import type { Ref } from "react";
import type { Exchange, FailedExchange } from "../domain/exchange.ts";
import type { RestoreNames } from "./ReplyView.tsx";
import { ExchangeEntry } from "./ExchangeEntry.tsx";
import { ExchangeOutcome } from "./ExchangeOutcome.tsx";

type ExchangeLogProps = {
  exchanges: readonly Exchange[];
  busy: boolean;
  onRetry: (failed: FailedExchange) => void;
  conversation: () => string;
  onStartNew: () => void;
  logRef: Ref<HTMLOListElement>;
  restoreNames: RestoreNames;
};

export function ExchangeLog({ exchanges, logRef, ...outcome }: ExchangeLogProps) {
  return (
    <ol role="log" ref={logRef}>
      {exchanges.map((exchange) => (
        <ExchangeEntry key={exchange.id} exchange={exchange}>
          <ExchangeOutcome exchange={exchange} {...outcome} />
        </ExchangeEntry>
      ))}
    </ol>
  );
}
