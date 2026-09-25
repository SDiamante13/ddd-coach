import type { PlaceholderClash } from "../domain/swaps.ts";

const CLASH_REASONS: Record<PlaceholderClash, string> = {
  "in-thread": "is already in your message, so the coach can't tell the two apart.",
  "role-name": "reads as a team or role name, so the coach may mix the two up.",
};

export function clashWarning(placeholder: string, clash: PlaceholderClash): string {
  return `"${placeholder}" ${CLASH_REASONS[clash]} Try a made-up placeholder like "Customer A" or "Person 1".`;
}
