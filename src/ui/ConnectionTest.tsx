import { UNLOCKED_FOR } from "../shared/accessContract.ts";
import { AccessGate } from "./AccessGate.tsx";
import { ComposerActions } from "./ComposerActions.tsx";
import { ExchangeLog } from "./ExchangeLog.tsx";
import { MessageForm } from "./MessageForm.tsx";
import { NewReplyButton } from "./NewReplyButton.tsx";
import { SentPreview } from "./SentPreview.tsx";
import { SwapPanel } from "./SwapPanel.tsx";
import type { Unlock } from "./useAccess.ts";
import { type Composer, useComposer } from "./useComposer.ts";

type ConnectionTestProps = { unlock: Unlock; justUnlocked: boolean };

export function ConnectionTest({ unlock, justUnlocked }: ConnectionTestProps) {
  const composer = useComposer(unlock);
  const { access } = composer;

  return (
    <>
      <ExchangeLog
        exchanges={composer.exchanges}
        busy={composer.busy}
        onRetry={composer.retry}
        conversation={composer.conversation}
        onStartNew={composer.confirmation.ask}
        logRef={composer.follow.logRef}
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
        draftBlank={box.blank}
        busy={busy}
        confirmation={composer.confirmation}
        conversation={composer.conversation}
        onTryExample={box.tryExample}
      />
      <SwapPanel {...box.swaps} thread={box.draft} />
      {!box.blank && <SentPreview swaps={box.swaps.swaps} draft={box.draft} />}
    </MessageForm>
  );
}
