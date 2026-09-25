import { useId, useState, type KeyboardEvent } from "react";
import type { SwapField, SwapRefusal } from "../domain/swaps.ts";
import type { Swaps } from "./useSwaps.ts";

export function AddSwapRow({ add }: Pick<Swaps, "add">) {
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
  const refusalFor = (field: SwapField) => (refusal?.field === field ? refusal.reason : undefined);

  return (
    <div className="addswap">
      <SwapInput label="Replace" value={from} onChange={setFrom} onKeyDown={addOnEnter} refusal={refusalFor("from")} />
      <SwapInput label="With" value={to} onChange={setTo} onKeyDown={addOnEnter} refusal={refusalFor("to")} />
      <button type="button" onClick={submit}>
        Add swap
      </button>
    </div>
  );
}

type SwapInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent) => void;
  refusal: string | undefined;
};

function SwapInput({ label, value, onChange, onKeyDown, refusal }: SwapInputProps) {
  const id = useId();
  return (
    <span className="swapfield">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        value={value}
        aria-invalid={refusal !== undefined || undefined}
        aria-describedby={refusal === undefined ? undefined : `${id}-refusal`}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
      />
      {refusal !== undefined && (
        <span id={`${id}-refusal`} className="refusal">
          {refusal}
        </span>
      )}
    </span>
  );
}
