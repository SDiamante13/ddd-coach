import { useId, useState, type MouseEvent } from "react";
import { CopyConversationButton } from "./CopyConversationButton.tsx";

type Step = "offered" | "confirming" | "kept";

type NewConversationProps = { busy: boolean; onClear: () => void; conversation: () => string };

export function NewConversation({ busy, onClear, conversation }: NewConversationProps) {
  const questionId = useId();
  const [step, setStep] = useState<Step>("offered");

  function clear(event: MouseEvent<HTMLButtonElement>) {
    event.currentTarget.form?.querySelector("textarea")?.focus();
    onClear();
  }

  if (step !== "confirming") {
    return (
      <button type="button" className="new" autoFocus={step === "kept"} onClick={() => setStep("confirming")}>
        New conversation
      </button>
    );
  }

  return (
    <span className="confirm" role="group" aria-labelledby={questionId} aria-describedby={`${questionId}-effect`}>
      <span>
        <span id={questionId}>Clear this conversation?</span>{" "}
        <span id={`${questionId}-effect`}>The log and history go; your draft stays.</span>
      </span>
      <CopyConversationButton text={conversation} label="Copy first" />
      <button type="button" disabled={busy} onClick={clear}>
        Clear
      </button>
      <button type="button" autoFocus onClick={() => setStep("kept")}>
        Keep
      </button>
    </span>
  );
}
