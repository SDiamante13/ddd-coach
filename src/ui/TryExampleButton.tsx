import type { MouseEvent } from "react";

// Safari doesn't focus a pressed button, so the box would lose focus on mousedown and the resting composer would fold this button away before the click lands.
const keepFocusInBox = (event: MouseEvent) => event.preventDefault();

export function TryExampleButton({ onTry }: { onTry: () => void }) {
  return (
    <button type="button" className="example" onMouseDown={keepFocusInBox} onClick={onTry}>
      Try an example thread
    </button>
  );
}
