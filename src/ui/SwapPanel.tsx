import { useId, useState, type KeyboardEvent } from "react";
import type { Swaps } from "./useSwaps.ts";

export function SwapPanel({ swaps, add, remove }: Swaps) {
  return (
    <details className="swaps">
      <summary>Your swaps ({swaps.length})</summary>
      <ul>
        {swaps.map(({ from, to }) => (
          <li key={from}>
            <span>
              {from} → {to}
            </span>
            <button type="button" aria-label={`Remove swap ${from}`} onClick={() => remove(from)}>
              ×
            </button>
          </li>
        ))}
      </ul>
      <AddSwapRow add={add} />
    </details>
  );
}

function AddSwapRow({ add }: Pick<Swaps, "add">) {
  const id = useId();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  function submit() {
    if (!add(from, to).ok) return;
    setFrom("");
    setTo("");
  }
  const addOnEnter = (event: KeyboardEvent) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    submit();
  };

  return (
    <div className="addswap">
      <label htmlFor={`${id}-from`}>Replace</label>
      <input id={`${id}-from`} value={from} onChange={(e) => setFrom(e.target.value)} onKeyDown={addOnEnter} />
      <label htmlFor={`${id}-to`}>With</label>
      <input id={`${id}-to`} value={to} onChange={(e) => setTo(e.target.value)} onKeyDown={addOnEnter} />
      <button type="button" onClick={submit}>
        Add swap
      </button>
    </div>
  );
}
