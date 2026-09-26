import { CORRECTIONS_ENABLED } from "../shared/features.ts";

const CORRECTED_ON_BOARD = "Corrected on your board.";
export const CORRECTION_NOTE = CORRECTIONS_ENABLED ? `${CORRECTED_ON_BOARD} The coach's next turn uses your wording.` : CORRECTED_ON_BOARD;

export function CorrectionNote({ shown }: { shown: boolean }) {
  if (!shown) return null;
  return (
    <p role="status" aria-label="Board correction" className="correction-note">
      {CORRECTION_NOTE}
    </p>
  );
}
