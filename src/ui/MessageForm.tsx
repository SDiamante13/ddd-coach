import { useState, type FormEvent } from "react";
import { parsePrompt, type Prompt } from "../domain/exchange.ts";

type MessageFormProps = { busy: boolean; onSend: (prompt: Prompt) => void };

export function MessageForm({ busy, onSend }: MessageFormProps) {
  const [draft, setDraft] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const prompt = parsePrompt(draft);
    if (prompt === null) return;
    setDraft("");
    onSend(prompt);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Message
        <input type="text" autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} />
      </label>
      <button type="submit" disabled={busy}>
        Send
      </button>
    </form>
  );
}
