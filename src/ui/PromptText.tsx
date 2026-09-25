import { useId, useState } from "react";
import { previewOf } from "./promptPreview.ts";

export function PromptText({ prompt }: { prompt: string }) {
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  const { preview, hidden } = previewOf(prompt);
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
