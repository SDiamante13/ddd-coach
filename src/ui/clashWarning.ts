import { madeUpPlaceholders, type PlaceholderClash, type SwapList } from "../domain/swaps.ts";

const CLASH_REASONS: Record<PlaceholderClash, string> = {
  "in-thread": "is already in your message, so the coach can't tell the two apart.",
  "role-name": "reads as a team or role name, so the coach may mix the two up.",
};

export type ClashContext = { swaps: SwapList; thread: string };

export function clashWarning(placeholder: string, clash: PlaceholderClash, { swaps, thread }: ClashContext): string {
  const [customer, person] = madeUpPlaceholders(swaps, thread);
  return `"${placeholder}" ${CLASH_REASONS[clash]} Try a made-up placeholder like "${customer}" or "${person}".`;
}
