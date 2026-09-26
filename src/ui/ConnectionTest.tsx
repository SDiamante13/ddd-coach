import { UNLOCKED_FOR } from "../shared/accessContract.ts";
import { GLOSSARY_ENABLED } from "../shared/features.ts";
import { AccessGate } from "./AccessGate.tsx";
import { ComposerActions } from "./ComposerActions.tsx";
import { EventBoard } from "./EventBoard.tsx";
import { ExchangeLog } from "./ExchangeLog.tsx";
import { MessageForm } from "./MessageForm.tsx";
import { NewReplyButton } from "./NewReplyButton.tsx";
import { PinnedQuestion } from "./PinnedQuestion.tsx";
import { SentPreview } from "./SentPreview.tsx";
import { GlossaryPanel } from "./GlossaryPanel.tsx";
import { SwapPanel } from "./SwapPanel.tsx";
import type { Unlock } from "./useAccess.ts";
import { useBoardView } from "./useBoardView.ts";
import { type Composer, useComposer } from "./useComposer.ts";

type ConnectionTestProps = { unlock: Unlock; justUnlocked: boolean };

export function ConnectionTest({ unlock, justUnlocked }: ConnectionTestProps) {
  const composer = useComposer(unlock);
  const { access } = composer;
  const view = useBoardView(composer.exchanges, composer.box.restoreNames);

  return (
    <>
      <EventBoard view={view} thinking={composer.busy} restoreNames={composer.box.restoreNames} />
      <PinnedQuestion question={view.question} />
      <ExchangeLog
        exchanges={composer.exchanges}
        busy={composer.busy}
        onRetry={composer.retry}
        conversation={composer.conversation}
        onStartNew={composer.confirmation.ask}
        logRef={composer.follow.logRef}
        restoreNames={composer.box.restoreNames}
        onKeep={composer.glossary.keepReply}
        pinnedQuestionOf={view.question?.exchangeId ?? null}
        highlight={view.highlight}
        newCardsOf={view.newCardsOf}
      />
      {access.accessLost && <AccessGate onUnlock={access.unlockAgain} />}
      {justUnlocked && (
        <p role="status" className="unlocked">
          {UNLOCKED_FOR}
        </p>
      )}
      <ComposerForm composer={composer} />
    </>
  );
}

function ComposerForm({ composer }: { composer: Composer }) {
  const { box, busy, follow } = composer;
  return (
    <MessageForm
      busy={busy}
      draft={box.draft}
      onDraftChange={box.setDraft}
      onSend={composer.submit}
      outgoing={box.outgoing}
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
      {!box.blank && <SentPreview swaps={box.swaps.swaps} draft={box.draft} glossary={composer.glossary.rows} />}
    </MessageForm>
  );
}
