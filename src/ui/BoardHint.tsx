import { type FocusEvent, useEffect, useRef, useState } from "react";

export const BOARD_KEYS_HINT = "← → along a row · ↑ ↓ between rows · Shift + arrows nudge · Enter corrects · Esc to the controls";
export const BOARD_KEYS_ID = "board-keys";

const SEEN_KEY = "ddd-coach.board-hint-seen";

type Hint = "unseen" | "showing" | "seen";

export function useBoardHint() {
  const [hint, setHint] = useState<Hint>(() => (seenBefore() ? "seen" : "unseen"));
  const byKeyboard = useKeyboardModality();
  const onFocus = (event: FocusEvent<HTMLElement>) => {
    if (hint === "unseen" && byKeyboard.current && event.target.matches("button.card")) setHint("showing");
  };
  const onBlur = (event: FocusEvent<HTMLElement>) => {
    if (hint !== "showing" || event.currentTarget.contains(event.relatedTarget)) return;
    setHint("seen");
    rememberSeen();
  };
  return { shown: hint === "showing", onFocus, onBlur };
}

function useKeyboardModality() {
  const byKeyboard = useRef(false);
  useEffect(() => {
    const keyboard = () => (byKeyboard.current = true);
    const pointer = () => (byKeyboard.current = false);
    document.addEventListener("keydown", keyboard, true);
    document.addEventListener("pointerdown", pointer, true);
    return () => {
      document.removeEventListener("keydown", keyboard, true);
      document.removeEventListener("pointerdown", pointer, true);
    };
  }, []);
  return byKeyboard;
}

function seenBefore(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberSeen(): void {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {
    return;
  }
}

export const BoardHint = ({ shown }: { shown: boolean }) => (
  <>
    <p id={BOARD_KEYS_ID} className="visually-hidden">
      {BOARD_KEYS_HINT}
    </p>
    {shown && (
      <p className="board-hint" aria-hidden="true">
        {BOARD_KEYS_HINT}
      </p>
    )}
  </>
);
