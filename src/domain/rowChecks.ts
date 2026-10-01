import type { Check, Verdict, VisitorAction } from "./boardFromReplies.ts";
import type { EntityId } from "./entityId.ts";

export type RowCheck = { verdict: Verdict; where?: string; at: string };

const isCheck = (action: VisitorAction): action is Check => action.kind === "check";

export function checksOf(actions: readonly VisitorAction[]): Map<EntityId, RowCheck> {
  return new Map(actions.filter(isCheck).map(({ row, verdict, where, at }) => [row, { verdict, at, ...(where !== undefined && { where }) }]));
}
