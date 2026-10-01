import type { Move, VisitorAction } from "./boardFromReplies.ts";
import type { EntityId } from "./entityId.ts";

export type Position = { x: number; y: number };

const isMove = (action: VisitorAction): action is Move => action.kind === "move";

export function positionsOf(actions: readonly VisitorAction[]): Map<EntityId, Position> {
  return new Map(actions.filter(isMove).map(({ id, x, y }) => [id, { x, y }]));
}

export function compactMoves(actions: readonly VisitorAction[]): VisitorAction[] {
  return actions.filter((action, index) => !isMove(action) || !actions.slice(index + 1).some((later) => isMove(later) && later.id === action.id));
}

export const lastEdit = (actions: readonly VisitorAction[]): VisitorAction | undefined => actions.filter((action) => !isMove(action)).at(-1);
