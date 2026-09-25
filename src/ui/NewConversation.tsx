import { useState } from "react";

export function NewConversation({ onClear }: { onClear: () => void }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button type="button" className="new" onClick={() => setConfirming(true)}>
        New conversation
      </button>
    );
  }

  return (
    <span className="confirm">
      Clear this conversation?
      <button type="button" onClick={onClear}>
        Clear
      </button>
      <button type="button" onClick={() => setConfirming(false)}>
        Keep
      </button>
    </span>
  );
}
