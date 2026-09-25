import { isRefused, type Exchange, type FailedExchange } from "../domain/exchange.ts";
import { COACH_TOO_LONG, COACH_UNVERIFIED } from "../shared/chatContract.ts";
import { CopyConversationButton } from "./CopyConversationButton.tsx";
import { ReplyView, type RestoreNames } from "./ReplyView.tsx";

const FIXED_BY_A_NEW_CONVERSATION: readonly string[] = [COACH_TOO_LONG, COACH_UNVERIFIED];

type ExchangeOutcomeProps = {
  exchange: Exchange;
  busy: boolean;
  onRetry: (failed: FailedExchange) => void;
  conversation: () => string;
  onStartNew: () => void;
  restoreNames: RestoreNames;
};

export function ExchangeOutcome({ exchange, busy, onRetry, conversation, onStartNew, restoreNames }: ExchangeOutcomeProps) {
  switch (exchange.status) {
    case "pending":
      return <p>Coach is thinking…</p>;
    case "replied":
      return <ReplyView reply={exchange.reply} restoreNames={restoreNames} />;
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
            <RetryButton disabled={busy} onRetry={() => onRetry(exchange)} />
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

function RetryButton({ disabled, onRetry }: { disabled: boolean; onRetry: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(event) => {
        focusEntryOf(event.currentTarget);
        onRetry();
      }}
    >
      Retry
    </button>
  );
}

function focusEntryOf(button: HTMLElement) {
  button.closest("li")?.focus();
}
