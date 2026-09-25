import { useState, type MouseEvent } from "react";

type Step = "offered" | "confirming" | "kept";

export function NewConversation({ busy, onClear }: { busy: boolean; onClear: () => void }) {
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
    <span className="confirm">
      Clear this conversation?
      <button type="button" disabled={busy} onClick={clear}>
        Clear
      </button>
      <button type="button" autoFocus onClick={() => setStep("kept")}>
        Keep
      </button>
    </span>
  );
}
