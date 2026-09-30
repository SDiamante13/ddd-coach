import { CORRECTIONS_ENABLED } from "../shared/features.ts";

export type CorrectionLine = { was: string; now: string };

const NEXT_TURN = ". The coach's next turn uses your wording.";

const lineText = ({ was, now }: CorrectionLine): string => `You corrected a sticky: “${was}” → “${now}”${CORRECTIONS_ENABLED ? NEXT_TURN : ""}`;

export function CorrectionLines({ lines }: { lines: readonly CorrectionLine[] }) {
  return lines.map((line, index) => (
    <p key={index} role="status" className="correction-line">
      {lineText(line)}
    </p>
  ));
}
