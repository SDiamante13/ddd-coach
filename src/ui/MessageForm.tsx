import { useId, useState, type FocusEvent, type FormEvent, type ReactNode, type Ref } from "react";
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
  restsAtStart?: boolean;
};

const asTyped = (draft: string) => draft;

export const MESSAGE_BOX_ID = "message-box";

export function MessageForm(props: MessageFormProps) {
  const { busy, draft, onDraftChange, onSend, children, boxRef, notice, outgoing = asTyped, restsAtStart = false } = props;
  const id = useId();
  const keyHint = !hasTouchPointer();
  const sent = outgoing(draft);
  const length = messageLength(sent);
  const limit = draftLimit(length, MAX_MESSAGE_CHARS);
  const over = limit === "over";
  const rest = useRestAfterSend(restsAtStart);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const prompt = parsePrompt(sent);
    if (busy || over) return;
    onDraftChange("");
    rest.start();
    if (prompt !== null) onSend(prompt);
  }

  return (
    <form onSubmit={handleSubmit} onBlur={rest.endOnLeave} data-resting={rest.resting || undefined}>
      {notice}
      <label htmlFor={MESSAGE_BOX_ID}>Message</label>
      <div className="row">
        <MessageBox
          id={MESSAGE_BOX_ID}
          draft={draft}
          describedBy={keyHint ? `${id}-hint ${id}-limit` : `${id}-limit`}
          invalid={over}
          onDraftChange={(text) => {
            rest.end();
            onDraftChange(text);
          }}
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

function useRestAfterSend(restsAtStart: boolean) {
  const [resting, setResting] = useState(restsAtStart);
  const end = () => setResting(false);
  return {
    resting,
    start: () => setResting(true),
    end,
    endOnLeave: (event: FocusEvent<HTMLFormElement>) => event.currentTarget.contains(event.relatedTarget) || end(),
  };
}
