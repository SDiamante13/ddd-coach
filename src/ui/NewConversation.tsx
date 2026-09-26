import { useId, useState } from "react";
import { CopyConversationButton } from "./CopyConversationButton.tsx";
import { formatCount } from "./draftLimit.ts";
import type { ClearConfirmation } from "./useClearConfirmation.ts";

type NewConversationProps = {
  busy: boolean;
  confirmation: ClearConfirmation;
  conversation: () => string;
  pastedThread: string | undefined;
  draft: string;
};

export function NewConversation(props: NewConversationProps) {
  const { step, askCount, ask } = props.confirmation;
  if (step !== "confirming") {
    return (
      <button type="button" className="new" autoFocus={step === "kept"} onClick={ask}>
        New conversation
      </button>
    );
  }
  return <ClearQuestion key={askCount} {...props} />;
}

type StartWith = "thread" | "draft";

function ClearQuestion({ busy, confirmation, conversation, pastedThread, draft }: NewConversationProps) {
  const questionId = useId();
  const [startWith, setStartWith] = useState<StartWith>("thread");
  const offersThread = pastedThread !== undefined;
  return (
    <span className="confirm" role="group" aria-labelledby={questionId} aria-describedby={`${questionId}-effect`}>
      <span>
        <span id={questionId}>Clear this conversation?</span>{" "}
        <span id={`${questionId}-effect`}>{offersThread ? "The log and history go." : "The log and history go; your draft stays."}</span>
      </span>
      {offersThread && <StartWithChoice thread={pastedThread} draft={draft} chosen={startWith} onChoose={setStartWith} />}
      <CopyConversationButton text={conversation} label="Copy first" />
      <button type="button" className="clear" disabled={busy} onClick={() => confirmation.clear(startWith === "thread" ? pastedThread : undefined)}>
        Clear
      </button>
      <button type="button" autoFocus onClick={confirmation.keep}>
        Keep
      </button>
    </span>
  );
}

type StartWithChoiceProps = { thread: string; draft: string; chosen: StartWith; onChoose: (choice: StartWith) => void };

function StartWithChoice({ thread, draft, chosen, onChoose }: StartWithChoiceProps) {
  const labelId = useId();
  const name = `${labelId}-start-with`;
  return (
    <span className="start-with" role="radiogroup" aria-labelledby={labelId}>
      <span id={labelId}>Start the new one with:</span>
      <label>
        <input type="radio" name={name} checked={chosen === "thread"} onChange={() => onChoose("thread")} />
        {threadLabel(thread)}
      </label>
      <label>
        <input type="radio" name={name} checked={chosen === "draft"} onChange={() => onChoose("draft")} />
        {draftLabel(draft)}
      </label>
    </span>
  );
}

const PREVIEW_CHARS = 40;

function threadLabel(thread: string): string {
  return `Your pasted thread (${formatCount(thread.length)} characters, "${previewOf(thread)}")`;
}

function draftLabel(draft: string): string {
  return draft.trim() === "" ? "An empty box" : `Just your draft ("${previewOf(draft)}")`;
}

function previewOf(text: string): string {
  const firstLine = text.trim().split("\n")[0] ?? "";
  const cut = firstLine.length > PREVIEW_CHARS || firstLine.length < text.trim().length;
  return cut ? `${firstLine.slice(0, PREVIEW_CHARS)}…` : firstLine;
}
