import { useEffect, useId, useRef, useState } from "react";
import type { LineMatch } from "../domain/sourceLine.ts";
import { previewOf } from "./promptPreview.ts";

type PromptTextProps = { prompt: string; highlight?: LineMatch | null };

export function PromptText({ prompt, highlight = null }: PromptTextProps) {
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  const { preview, hidden } = previewOf(prompt);
  if (highlight !== null) return <HighlightedPrompt prompt={prompt} highlight={highlight} />;
  if (hidden === 0) return <p>{prompt}</p>;

  return (
    <p id={id}>
      {expanded ? prompt : `${preview}…`}
      <button
        type="button"
        className="more"
        aria-expanded={expanded}
        aria-controls={id}
        onClick={() => setExpanded((open) => !open)}
      >
        {expanded ? "Show less" : "Show more"}
      </button>
    </p>
  );
}

function HighlightedPrompt({ prompt, highlight: { start, end } }: { prompt: string; highlight: LineMatch }) {
  const mark = useRef<HTMLElement>(null);
  useEffect(() => mark.current?.scrollIntoView({ block: "center" }), [start, end]);
  return (
    <p>
      {prompt.slice(0, start)}
      <mark ref={mark}>{prompt.slice(start, end)}</mark>
      {prompt.slice(end)}
    </p>
  );
}
