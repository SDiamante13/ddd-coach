export const CORRECTED_ON_BOARD = "Corrected on your board.";

export function CorrectionNote({ shown }: { shown: boolean }) {
  if (!shown) return null;
  return (
    <p role="status" aria-label="Board correction" className="correction-note">
      {CORRECTED_ON_BOARD}
    </p>
  );
}
