import { useId, type FormEvent, type ReactNode } from "react";
import { messageLength, parsePrompt, type Prompt } from "../domain/exchange.ts";
import { MAX_MESSAGE_CHARS } from "../shared/chatContract.ts";
import { DraftFoot } from "./DraftFoot.tsx";
import { draftLimit } from "./draftLimit.ts";
import { MessageBox } from "./MessageBox.tsx";
import { hasTouchPointer } from "./pointer.ts";

type MessageFormProps = {
  busy: boolean;
  draft: string;
  onDraftChange: (text: string) => void;
  onSend: (prompt: Prompt) => void;
  children?: ReactNode;
};

export function MessageForm({ busy, draft, onDraftChange, onSend, children }: MessageFormProps) {
  const id = useId();
  const keyHint = !hasTouchPointer();
  const length = messageLength(draft);
  const limit = draftLimit(length, MAX_MESSAGE_CHARS);
  const over = limit === "over";

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const prompt = parsePrompt(draft);
    if (busy || over || prompt === null) return;
    onDraftChange("");
    onSend(prompt);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor={`${id}-box`}>Message</label>
      <div className="row">
        <MessageBox
          id={`${id}-box`}
          draft={draft}
          describedBy={keyHint ? `${id}-hint ${id}-limit` : `${id}-limit`}
          invalid={over}
          onDraftChange={onDraftChange}
        />
        <button type="submit" disabled={busy || over}>
          Send
        </button>
      </div>
      <DraftFoot length={length} limit={limit} keyHint={keyHint} hintId={`${id}-hint`} limitId={`${id}-limit`}>
        {children}
      </DraftFoot>
    </form>
  );
}
