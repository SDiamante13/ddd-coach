import { useId } from "react";
import { CopyConversationButton } from "./CopyConversationButton.tsx";
import type { ClearConfirmation } from "./useClearConfirmation.ts";

type NewConversationProps = { busy: boolean; confirmation: ClearConfirmation; conversation: () => string };

export function NewConversation({ busy, confirmation, conversation }: NewConversationProps) {
  const questionId = useId();
  const { step, askCount, ask, keep, clear } = confirmation;

  if (step !== "confirming") {
    return (
      <button type="button" className="new" autoFocus={step === "kept"} onClick={ask}>
        New conversation
      </button>
    );
  }

  return (
    <span key={askCount} className="confirm" role="group" aria-labelledby={questionId} aria-describedby={`${questionId}-effect`}>
      <span>
        <span id={questionId}>Clear this conversation?</span>{" "}
        <span id={`${questionId}-effect`}>The log and history go; your draft stays.</span>
      </span>
      <CopyConversationButton text={conversation} label="Copy first" />
      <button type="button" className="clear" disabled={busy} onClick={clear}>
        Clear
      </button>
      <button type="button" autoFocus onClick={keep}>
        Keep
      </button>
    </span>
  );
}
