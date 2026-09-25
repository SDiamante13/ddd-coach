import { AddSwapRow } from "./AddSwapRow.tsx";
import type { Swaps } from "./useSwaps.ts";

export const SWAPS_NOTE =
  "Swaps run in this browser before anything is sent. They hide only the words you list: rates, " +
  "load IDs and contract terms you haven't listed still go. They don't make an unapproved vendor approved.";

export function SwapPanel({ swaps, add, remove, clear, thread }: Swaps & { thread: string }) {
  return (
    <details className="swaps">
      <summary>Your swaps ({swaps.length})</summary>
      <p className="swapsnote">{SWAPS_NOTE}</p>
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
      <AddSwapRow add={add} swaps={swaps} thread={thread} />
      {swaps.length > 0 && (
        <button type="button" className="clearswaps" onClick={clear}>
          Clear swaps
        </button>
      )}
    </details>
  );
}
