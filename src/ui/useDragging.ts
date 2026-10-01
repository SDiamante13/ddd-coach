import type { Node, NodeChange, OnNodeDrag, XYPosition } from "@xyflow/react";
import { useCallback, useState } from "react";
import type { EntityId } from "../domain/entityId.ts";
import type { BoardView } from "./EventBoard.tsx";

export function useDragging({ move }: Pick<BoardView, "move">) {
  const [held, setHeld] = useState<ReadonlyMap<string, XYPosition>>(new Map());
  const onNodesChange = (changes: NodeChange[]) => {
    const moving = changes.flatMap((change) => (change.type === "position" && change.dragging && change.position ? [[change.id, change.position] as const] : []));
    if (moving.length > 0) setHeld((current) => new Map([...current, ...moving]));
  };
  const onNodeDragStop: OnNodeDrag = (_event, node) => {
    move(node.id as EntityId, node.position);
    setHeld(new Map());
  };
  const at = useCallback(<N extends Node>(node: N): N => {
    const position = held.get(node.id);
    return position ? { ...node, position } : node;
  }, [held]);
  return { onNodesChange, onNodeDragStop, at };
}
