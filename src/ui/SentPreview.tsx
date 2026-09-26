import { useId, useState, type ReactNode } from "react";
import { applySwaps, placeholderClash, type SwapList, type SwappedText } from "../domain/swaps.ts";
import { clashWarning } from "./clashWarning.ts";
import { SentGlossary } from "./SentGlossary.tsx";
import type { Glossary } from "../domain/glossary.ts";
import { GLOSSARY_ENABLED } from "../shared/features.ts";

export function SentPreview({ swaps, draft, glossary }: { swaps: SwapList; draft: string; glossary: Glossary }) {
  const id = useId();
  const swapped = applySwaps(swaps, draft);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        Show what's sent
      </button>
      <section id={id} aria-labelledby={`${id}-title`} className="sent" hidden={!open}>
        <h2 id={`${id}-title`}>What's sent</h2>
        <p>{marked(swapped)}</p>
        <p>{appliedLine(swapped.spans.length)}</p>
        {GLOSSARY_ENABLED && <SentGlossary glossary={glossary} swaps={swaps} />}
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
