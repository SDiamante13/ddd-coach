import type { Move, VisitorAction } from "./boardFromReplies.ts";
import type { EntityId } from "./entityId.ts";

export type Position = { x: number; y: number };

const isMove = (action: VisitorAction): action is Move => action.kind === "move";

function latestKeyOf(action: VisitorAction): string | null {
  if (action.kind === "move") return `move|${action.id}`;
  return action.kind === "check" || action.kind === "clearCheck" ? `check|${action.row}` : null;
}

export function positionsOf(actions: readonly VisitorAction[]): Map<EntityId, Position> {
  return new Map(actions.filter(isMove).map(({ id, x, y }) => [id, { x, y }]));
}

export function compactMoves(actions: readonly VisitorAction[]): VisitorAction[] {
  return actions.filter((action, index) => {
    const key = latestKeyOf(action);
    return key === null || !actions.slice(index + 1).some((later) => latestKeyOf(later) === key);
  });
}

export const lastEdit = (actions: readonly VisitorAction[]): VisitorAction | undefined => actions.filter((action) => latestKeyOf(action) === null).at(-1);
