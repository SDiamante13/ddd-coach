import { isRefused, type Exchange, type FailedExchange } from "../domain/exchange.ts";
import { COACH_TOO_LONG, COACH_UNVERIFIED } from "../shared/chatContract.ts";
import { CopyConversationButton } from "./CopyConversationButton.tsx";

const FIXED_BY_A_NEW_CONVERSATION: readonly string[] = [COACH_TOO_LONG, COACH_UNVERIFIED];

type ExchangeOutcomeProps = {
  exchange: Exchange;
  busy: boolean;
  onRetry: (failed: FailedExchange) => void;
  conversation: () => string;
  onStartNew: () => void;
};

export function ExchangeOutcome({ exchange, busy, onRetry, conversation, onStartNew }: ExchangeOutcomeProps) {
  switch (exchange.status) {
    case "pending":
      return <p>Coach is thinking…</p>;
    case "replied":
      return <p>{exchange.reply}</p>;
    case "failed":
      return (
        <>
          <p role="alert">{exchange.error}</p>
          {isRefused(exchange) ? (
            <RefusalActions
              conversation={conversation}
              onStartNew={FIXED_BY_A_NEW_CONVERSATION.includes(exchange.error) ? onStartNew : undefined}
            />
          ) : (
            <button type="button" disabled={busy} onClick={() => onRetry(exchange)}>
              Retry
            </button>
          )}
        </>
      );
  }
}

type RefusalActionsProps = { conversation: () => string; onStartNew: (() => void) | undefined };

function RefusalActions({ conversation, onStartNew }: RefusalActionsProps) {
  return (
    <span className="refusal-actions">
      <CopyConversationButton text={conversation} />
      {onStartNew && (
        <button type="button" onClick={onStartNew}>
          Start a new one
        </button>
      )}
    </span>
  );
}
