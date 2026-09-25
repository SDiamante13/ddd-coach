import { useEffect, useState } from "react";

const COPIED_MS = 2000;

type CopyState = "ready" | "copied" | "failed";

const LABELS: Record<Exclude<CopyState, "ready">, string> = {
  copied: "Copied",
  failed: "Couldn't copy. Select the text in the log instead.",
};

type CopyConversationButtonProps = { text: () => string; label?: string };

export function CopyConversationButton({ text, label = "Copy the conversation" }: CopyConversationButtonProps) {
  const [state, setState] = useState<CopyState>("ready");

  useEffect(() => {
    if (state !== "copied") return;
    const timer = setTimeout(() => setState("ready"), COPIED_MS);
    return () => clearTimeout(timer);
  }, [state]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text());
      setState("copied");
    } catch {
      setState("failed");
    }
  }

  return (
    <>
      <button type="button" className="copy" onClick={() => void copy()}>
        {state === "ready" ? label : LABELS[state]}
      </button>
      <span role="status" className="visually-hidden">
        {state === "ready" ? "" : LABELS[state]}
      </span>
    </>
  );
}
