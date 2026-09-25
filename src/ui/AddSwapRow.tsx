import { useId, useState, type KeyboardEvent } from "react";
import { placeholderClash, type SwapField, type SwapRefusal } from "../domain/swaps.ts";
import { clashWarning, type ClashContext } from "./clashWarning.ts";
import type { Swaps } from "./useSwaps.ts";

type FieldNote = { text: string; kind: "refusal" | "warning" };

type AddSwapRowProps = Pick<Swaps, "add" | "swaps"> & { thread: string };

export function AddSwapRow({ add, swaps, thread }: AddSwapRowProps) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [refusal, setRefusal] = useState<SwapRefusal | null>(null);

  function submit() {
    const result = add(from, to);
    setRefusal(result.ok ? null : result);
    if (!result.ok) return;
    setFrom("");
    setTo("");
  }
  const addOnEnter = (event: KeyboardEvent) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    submit();
  };
  const noteFor = (field: SwapField): FieldNote | undefined =>
    refusal?.field === field ? { text: refusal.reason, kind: "refusal" } : undefined;

  return (
    <div className="addswap">
      <SwapInput label="Replace" value={from} onChange={setFrom} onKeyDown={addOnEnter} note={noteFor("from")} />
      <SwapInput
        label="With"
        value={to}
        onChange={setTo}
        onKeyDown={addOnEnter}
        note={noteFor("to") ?? clashNote(to, { swaps, thread })}
      />
      <button type="button" onClick={submit}>
        Add swap
      </button>
    </div>
  );
}

function clashNote(to: string, context: ClashContext): FieldNote | undefined {
  const clash = placeholderClash(to, context.thread);
  if (clash === null) return undefined;
  return {
    kind: "warning",
    text: clashWarning(to.trim(), clash, context),
  };
}

type SwapInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent) => void;
  note: FieldNote | undefined;
};

function SwapInput({ label, value, onChange, onKeyDown, note }: SwapInputProps) {
  const id = useId();
  return (
    <span className="swapfield">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        value={value}
        aria-invalid={note?.kind === "refusal" || undefined}
        aria-describedby={note && `${id}-note`}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
      />
      {note && (
        <span id={`${id}-note`} className={note.kind}>
          {note.text}
        </span>
      )}
    </span>
  );
}
