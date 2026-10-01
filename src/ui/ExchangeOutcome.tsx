import { useEffect, useState } from "react";
import type { ReplyCounts } from "../domain/replyChip.ts";
import { isRefused, type Exchange, type FailedExchange } from "../domain/exchange.ts";
import { CopyConversationButton } from "./CopyConversationButton.tsx";
import { ReplyView, type RestoreNames } from "./ReplyView.tsx";
import type { KeepReply } from "./useGlossary.ts";
import type { RowFacts } from "../domain/rfcExport.ts";

const MS_PER_SECOND = 1_000;

type ExchangeOutcomeProps = {
  exchange: Exchange;
  busy: boolean;
  onRetry: (failed: FailedExchange) => void;
  conversation: () => string;
  onStartNew: () => void;
  restoreNames: RestoreNames;
  onKeep: KeepReply;
  rowFacts: RowFacts;
  questionPinned: boolean;
  counts: ReplyCounts;
  revealOffScreen?: (() => void) | undefined;
};

export function ExchangeOutcome({ exchange, busy, onRetry, conversation, onStartNew, restoreNames, onKeep, rowFacts, questionPinned, counts, revealOffScreen }: ExchangeOutcomeProps) {
  switch (exchange.status) {
    case "pending":
      return <p>Coach is thinking…</p>;
    case "replied":
      return <ReplyView reply={exchange.reply} restoreNames={restoreNames} onKeep={onKeep} rowFacts={rowFacts} questionPinned={questionPinned} counts={counts} revealOffScreen={revealOffScreen} />;
    case "failed":
      return (
        <>
          <p role="alert">{exchange.error}</p>
          {isRefused(exchange) ? (
            <RefusalActions
              conversation={conversation}
              onStartNew={exchange.remedy === "startOver" ? onStartNew : undefined}
            />
          ) : (
            <RetryButton disabled={busy} waitSeconds={exchange.retryAfterSeconds} onRetry={() => onRetry(exchange)} />
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
          New conversation
        </button>
      )}
    </span>
  );
}

type RetryButtonProps = { disabled: boolean; waitSeconds: number | undefined; onRetry: () => void };

function RetryButton({ disabled, waitSeconds, onRetry }: RetryButtonProps) {
  const waiting = useWaiting(waitSeconds);
  return (
    <button
      type="button"
      disabled={disabled || waiting}
      onClick={(event) => {
        focusEntryOf(event.currentTarget);
        onRetry();
      }}
    >
      Retry
    </button>
  );
}

function useWaiting(seconds: number | undefined): boolean {
  const [waiting, setWaiting] = useState(seconds !== undefined);
  useEffect(() => {
    if (seconds === undefined) return;
    const timer = setTimeout(() => setWaiting(false), seconds * MS_PER_SECOND);
    return () => clearTimeout(timer);
  }, [seconds]);
  return waiting;
}

function focusEntryOf(button: HTMLElement) {
  button.closest("li")?.focus();
}
