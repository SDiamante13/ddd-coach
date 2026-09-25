import { useId, type FormEvent, type KeyboardEvent } from "react";
import { parsePrompt, type Prompt } from "../domain/exchange.ts";
import { DraftFoot } from "./DraftFoot.tsx";
import { PASTE_EXAMPLE } from "./PurposeLine.tsx";

const SAFARI_COMPOSITION_KEY_CODE = 229;

type MessageFormProps = {
  busy: boolean;
  draft: string;
  onDraftChange: (text: string) => void;
  onSend: (prompt: Prompt) => void;
};

export function MessageForm({ busy, draft, onDraftChange, onSend }: MessageFormProps) {
  const id = useId();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const prompt = parsePrompt(draft);
    if (busy || prompt === null) return;
    onDraftChange("");
    onSend(prompt);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (!sendsOnEnter(event)) return;
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor={`${id}-box`}>Message</label>
      <div className="row">
        <textarea
          id={`${id}-box`}
          autoFocus
          rows={2}
          placeholder={PASTE_EXAMPLE}
          aria-describedby={`${id}-hint ${id}-limit`}
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button type="submit" disabled={busy}>
          Send
        </button>
      </div>
      <DraftFoot hintId={`${id}-hint`} limitId={`${id}-limit`} />
    </form>
  );
}

function sendsOnEnter(event: KeyboardEvent): boolean {
  return event.key === "Enter" && !event.shiftKey && !isComposing(event) && !hasTouchPointer();
}

function isComposing(event: KeyboardEvent): boolean {
  return event.nativeEvent.isComposing || event.keyCode === SAFARI_COMPOSITION_KEY_CODE;
}

function hasTouchPointer(): boolean {
  return window.matchMedia?.("(pointer: coarse)").matches ?? false;
}
