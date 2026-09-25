import { useId, useState, type ReactNode } from "react";
import { applySwaps, placeholderClash, type SwapList, type SwappedText } from "../domain/swaps.ts";
import { clashWarning } from "./clashWarning.ts";

export function SentPreview({ swaps, draft }: { swaps: SwapList; draft: string }) {
  const id = useId();
  const swapped = applySwaps(swaps, draft);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        Show what's sent
      </button>
      <section id={id} aria-label="What's sent" className="sent" hidden={!open}>
        <p>{marked(swapped)}</p>
        <p>{appliedLine(swapped.spans.length)}</p>
        {placeholdersIn(swaps, draft).map((placeholder) => (
          <p key={placeholder} className="warning">
            {clashWarning(placeholder, "in-thread", { swaps, thread: draft })}
          </p>
        ))}
      </section>
    </>
  );
}

function marked({ text, spans }: SwappedText): ReactNode[] {
  const pieces: ReactNode[] = [];
  let shownUpTo = 0;
  for (const { start, end } of spans) {
    pieces.push(text.slice(shownUpTo, start), <mark key={start}>{text.slice(start, end)}</mark>);
    shownUpTo = end;
  }
  return [...pieces, text.slice(shownUpTo)];
}

function appliedLine(count: number): string {
  if (count === 0) return "No swaps applied";
  return `${count} ${count === 1 ? "swap" : "swaps"} applied`;
}

function placeholdersIn(swaps: SwapList, draft: string): string[] {
  const placeholders = new Set(swaps.map((swap) => swap.to));
  return [...placeholders].filter((placeholder) => placeholderClash(placeholder, draft) === "in-thread");
}
