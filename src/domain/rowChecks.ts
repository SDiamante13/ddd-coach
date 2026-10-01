import type { Check, Verdict, VisitorAction } from "./boardFromReplies.ts";
import type { EntityId } from "./entityId.ts";

export type RowCheck = { verdict: Verdict; where?: string; at: string };

export function checksOf(actions: readonly VisitorAction[]): Map<EntityId, RowCheck> {
  return actions.reduce((checks, action) => {
    if (action.kind === "clearCheck") checks.delete(action.row);
    if (action.kind === "check") checks.set(action.row, rowCheckOf(action));
    return checks;
  }, new Map<EntityId, RowCheck>());
}

const rowCheckOf = ({ verdict, where, at }: Check): RowCheck => ({ verdict, at, ...(where !== undefined && { where }) });
