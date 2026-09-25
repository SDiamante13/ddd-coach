import type { FormEvent } from "react";
import { parsePrompt, type Prompt } from "../domain/exchange.ts";

type MessageFormProps = {
  busy: boolean;
  draft: string;
  onDraftChange: (text: string) => void;
  onSend: (prompt: Prompt) => void;
};

export function MessageForm({ busy, draft, onDraftChange, onSend }: MessageFormProps) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const prompt = parsePrompt(draft);
    if (prompt === null) return;
    onDraftChange("");
    onSend(prompt);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Message
        <input type="text" autoFocus value={draft} onChange={(e) => onDraftChange(e.target.value)} />
      </label>
      <button type="submit" disabled={busy}>
        Send
      </button>
    </form>
  );
}
