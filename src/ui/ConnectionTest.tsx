import { UNLOCKED_FOR } from "../shared/accessContract.ts";
import { GLOSSARY_ENABLED } from "../shared/features.ts";
import { AccessGate } from "./AccessGate.tsx";
import { BoardAnnouncer } from "./BoardAnnouncer.tsx";
import { ComposerActions } from "./ComposerActions.tsx";
import { EventBoard } from "./EventBoard.tsx";
import { ExchangeLog } from "./ExchangeLog.tsx";
import { MessageForm } from "./MessageForm.tsx";
import { NewReplyButton } from "./NewReplyButton.tsx";
import { PinnedQuestion } from "./PinnedQuestion.tsx";
import { settleByText } from "./SettleByLine.tsx";
import { SentPreview } from "./SentPreview.tsx";
import { GlossaryPanel } from "./GlossaryPanel.tsx";
import { SwapPanel } from "./SwapPanel.tsx";
import type { Unlock } from "./useAccess.ts";
import { useBoardView } from "./useBoardView.ts";
import { rowFactsOf } from "../domain/rowFacts.ts";
import { type Composer, useComposer } from "./useComposer.ts";
import { useWhosWho, type WhosWho } from "./useWhosWho.ts";
import { WhosWhoPanel } from "./WhosWhoPanel.tsx";
import { WhosWhoOffer } from "./WhosWhoOffer.tsx";
import { speakersOf } from "../domain/pasteSpeakers.ts";
import { sourceGapOf } from "../domain/sourceGap.ts";

type ConnectionTestProps = { unlock: Unlock; justUnlocked: boolean };

export function ConnectionTest({ unlock, justUnlocked }: ConnectionTestProps) {
  const composer = useComposer(unlock);
  const { access } = composer;
  const whosWho = useWhosWho();
  const view = useBoardView(composer.exchanges, composer.box.restoreNames, composer.edits, composer.place, composer.restorePoint, whosWho.whoIsWho);
  const { settleBy } = composer.board;
  const settleByLine = settleBy ? settleByText(settleBy, composer.box.restoreNames) : undefined;
  const rowFacts = rowFactsOf(view.words, view.checks, (text) => composer.box.restoreNames(text).text, settleByLine);

  return (
    <>
      <EventBoard view={view} thinking={composer.busy} restoreNames={composer.box.restoreNames} session={composer.board} />
      <PinnedQuestion question={view.question} onBoard={view.hotspot && { linked: view.hotspot.links.length, rows: view.hotspot.rows.length, unplaced: view.hotspot.unplaced.length, reveal: view.revealQuestion }} expert={view.expert} rung={view.justChecked !== null} before={settleByLine ? `Before ${settleByLine}.` : null} />
      <ExchangeLog
        exchanges={composer.exchanges}
        busy={composer.busy}
        onRetry={composer.retry}
        conversation={composer.conversation}
        onStartNew={composer.confirmation.ask}
        logRef={composer.follow.logRef}
        restoreNames={composer.box.restoreNames}
        onKeep={composer.glossary.keepReply}
        rowFacts={rowFacts}
        pinnedQuestionOf={view.question?.exchangeId ?? null}
        highlight={view.highlight}
        countsOf={view.countsOf}
        offScreenOf={view.offScreenOf}
        correctionsOf={view.correctionsOf}
        checkLinesOf={view.checkLinesOf}
        linksOf={view.linksOf}
        whosWhoOf={(exchange) =>
          exchange.status === "replied" && (
            <WhosWhoOffer gap={sourceGapOf(view.words, exchange.id)} speakers={speakersOf(exchange.prompt)} entries={whosWho.entries} onKeep={whosWho.keep} shown={(text) => composer.box.restoreNames(text).text} outgoing={composer.box.outgoing} />
          )
        }
        onUndo={view.undo}
      />
      <BoardAnnouncer message={view.announcement} />
      {access.accessLost && <AccessGate onUnlock={access.unlockAgain} />}
      {justUnlocked && (
        <p role="status" className="unlocked">
          {UNLOCKED_FOR}
        </p>
      )}
      <ComposerForm composer={composer} whosWho={whosWho} />
    </>
  );
}

function ComposerForm({ composer, whosWho }: { composer: Composer; whosWho: WhosWho }) {
  const { box, busy, follow } = composer;
  return (
    <MessageForm
      busy={busy}
      draft={box.draft}
      onDraftChange={box.setDraft}
      onSend={composer.submit}
      outgoing={box.outgoing}
      restsAtStart={composer.exchanges.length > 0}
      boxRef={box.boxRef}
      notice={follow.newReply && <NewReplyButton onReveal={follow.revealNewest} />}
    >
      <ComposerActions
        started={composer.exchanges.length > 0}
        draft={box.draft}
        busy={busy}
        confirmation={composer.confirmation}
        conversation={composer.conversation}
        pastedThread={composer.pastedThread}
        onTryExample={box.tryExample}
      />
      {GLOSSARY_ENABLED && <GlossaryPanel {...composer.glossary} shown={(text) => box.restoreNames(text).text} />}
      <SwapPanel {...box.swaps} {...box.swapsPanel} thread={box.draft} />
      <WhosWhoPanel whosWho={whosWho} restoreNames={box.restoreNames} />
      {!box.blank && <SentPreview swaps={box.swaps.swaps} draft={box.draft} glossary={composer.glossary.rows} />}
    </MessageForm>
  );
}
