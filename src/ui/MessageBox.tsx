import type { KeyboardEvent, Ref } from "react";
import { hasTouchPointer } from "./pointer.ts";

const SAFARI_COMPOSITION_KEY_CODE = 229;

export const PASTE_EXAMPLE =
  "e.g. Ops: a booking exists the moment the customer submits\n" +
  "Finance: not for us, it's a booking once it's invoiceable";

type MessageBoxProps = {
  id: string;
  draft: string;
  describedBy: string;
  invalid: boolean;
  onDraftChange: (text: string) => void;
  boxRef?: Ref<HTMLTextAreaElement>;
};

export function MessageBox({ id, draft, describedBy, invalid, onDraftChange, boxRef }: MessageBoxProps) {
  return (
    <textarea
      ref={boxRef}
      id={id}
      autoFocus
      rows={2}
      placeholder={PASTE_EXAMPLE}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      value={draft}
      onChange={(e) => onDraftChange(e.target.value)}
      onKeyDown={submitOnEnter}
    />
  );
}

function submitOnEnter(event: KeyboardEvent<HTMLTextAreaElement>) {
  if (!sendsOnEnter(event)) return;
  event.preventDefault();
  event.currentTarget.form?.requestSubmit();
}

function sendsOnEnter(event: KeyboardEvent): boolean {
  return event.key === "Enter" && !event.shiftKey && !isComposing(event) && !hasTouchPointer();
}

function isComposing(event: KeyboardEvent): boolean {
  return event.nativeEvent.isComposing || event.keyCode === SAFARI_COMPOSITION_KEY_CODE;
}
