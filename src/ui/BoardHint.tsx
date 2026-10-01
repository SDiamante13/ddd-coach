import { type FocusEvent, useState } from "react";

export const BOARD_KEYS_HINT = "← → move between cards · Shift + arrows nudge · Enter corrects · Esc leaves";

type Hint = "unseen" | "showing" | "seen";

export function useBoardHint() {
  const [hint, setHint] = useState<Hint>("unseen");
  const onFocus = (event: FocusEvent<HTMLElement>) => {
    if (hint === "unseen" && event.target.matches("button.card")) setHint("showing");
  };
  const onBlur = (event: FocusEvent<HTMLElement>) => {
    if (hint === "showing" && !event.currentTarget.contains(event.relatedTarget)) setHint("seen");
  };
  return { shown: hint === "showing", onFocus, onBlur };
}

export const BoardHint = () => (
  <p className="board-hint">
    {BOARD_KEYS_HINT}
  </p>
);
