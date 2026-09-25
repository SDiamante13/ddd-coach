import { useId, type FormEvent, type ReactNode, type Ref } from "react";
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
  boxRef?: Ref<HTMLTextAreaElement>;
  notice?: ReactNode;
  outgoing?: (draft: string) => string;
};

const asTyped = (draft: string) => draft;

export function MessageForm(props: MessageFormProps) {
  const { busy, draft, onDraftChange, onSend, children, boxRef, notice, outgoing = asTyped } = props;
  const id = useId();
  const keyHint = !hasTouchPointer();
  const sent = outgoing(draft);
  const length = messageLength(sent);
  const limit = draftLimit(length, MAX_MESSAGE_CHARS);
  const over = limit === "over";

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const prompt = parsePrompt(sent);
    if (busy || over) return;
    onDraftChange("");
    if (prompt !== null) onSend(prompt);
  }

  return (
    <form onSubmit={handleSubmit}>
      {notice}
      <label htmlFor={`${id}-box`}>Message</label>
      <div className="row">
        <MessageBox
          id={`${id}-box`}
          draft={draft}
          describedBy={keyHint ? `${id}-hint ${id}-limit` : `${id}-limit`}
          invalid={over}
          onDraftChange={onDraftChange}
          boxRef={boxRef}
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
