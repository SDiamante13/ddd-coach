import type { Ref } from "react";
import type { Exchange, ExchangeId, FailedExchange } from "../domain/exchange.ts";
import type { ReplyCounts } from "../domain/replyChip.ts";
import type { LineMatch } from "../domain/sourceLine.ts";
import { type CorrectionLine, CorrectionLines } from "./CorrectionLines.tsx";
import { LinkLines } from "./LinkLines.tsx";
import type { LinkLine } from "./linkLines.ts";
import type { RestoreNames } from "./ReplyView.tsx";
import type { KeepReply } from "./useGlossary.ts";
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
  onKeep: KeepReply;
  pinnedQuestionOf: ExchangeId | null;
  highlight: LineMatch | null;
  countsOf: (id: ExchangeId) => ReplyCounts;
  offScreenOf: (id: ExchangeId) => (() => void) | undefined;
  correctionsOf: (id: ExchangeId) => readonly CorrectionLine[];
  linksOf: (id: ExchangeId) => readonly LinkLine[];
  onUndo: () => void;
};

export function ExchangeLog({ exchanges, logRef, pinnedQuestionOf, highlight, countsOf, offScreenOf, correctionsOf, linksOf, onUndo, ...outcome }: ExchangeLogProps) {
  return (
    <ol role="log" ref={logRef}>
      {exchanges.map((exchange) => (
        <ExchangeEntry key={exchange.id} exchange={exchange} highlight={highlight?.exchangeId === exchange.id ? highlight : null}>
          <ExchangeOutcome exchange={exchange} {...outcome} questionPinned={exchange.id === pinnedQuestionOf} counts={countsOf(exchange.id)} revealOffScreen={offScreenOf(exchange.id)} />
          <CorrectionLines lines={correctionsOf(exchange.id)} />
          <LinkLines lines={linksOf(exchange.id)} onUndo={onUndo} />
        </ExchangeEntry>
      ))}
    </ol>
  );
}
