import { useEffect, useState } from "react";

const COPIED_MS = 2000;

export function CopyConversationButton({ text }: { text: () => string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    await navigator.clipboard.writeText(text());
    setCopied(true);
  }

  return (
    <button type="button" className="copy" onClick={() => void copy()}>
      {copied ? "Copied" : "Copy the conversation"}
    </button>
  );
}
