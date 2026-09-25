import { useId, useState, type MouseEvent } from "react";

type Step = "offered" | "confirming" | "kept";

export function NewConversation({ busy, onClear }: { busy: boolean; onClear: () => void }) {
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
    <span className="confirm" role="group" aria-labelledby={questionId}>
      <span id={questionId}>Clear this conversation?</span>
      <button type="button" disabled={busy} onClick={clear}>
        Clear
      </button>
      <button type="button" autoFocus onClick={() => setStep("kept")}>
        Keep
      </button>
    </span>
  );
}
