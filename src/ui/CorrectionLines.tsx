import { CORRECTIONS_ENABLED } from "../shared/features.ts";

export type CorrectionLine = { was: string; now: string };

const NEXT_TURN = ". The coach's next turn uses your wording.";

export const correctionLineText = ({ was, now }: CorrectionLine): string => `You corrected a sticky: “${was}” → “${now}”${CORRECTIONS_ENABLED ? NEXT_TURN : ""}`;

export function CorrectionLines({ lines }: { lines: readonly CorrectionLine[] }) {
  return lines.map((line, index) => (
    <p key={index} className="correction-line">
      {correctionLineText(line)}
    </p>
  ));
}
