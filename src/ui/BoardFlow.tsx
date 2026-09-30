import { Handle, type Node, type NodeProps, Position, ReactFlow, ReactFlowProvider, type Edge, MarkerType } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useLayoutEffect, useMemo, useRef } from "react";
import type { EventCard } from "../domain/board.ts";
import { BoardCard } from "./BoardCard.tsx";
import type { BoardView } from "./EventBoard.tsx";
import { LANE_INSET, lanePosition } from "./boardLayout.ts";
import { usePanToChanges } from "./usePanToChanges.ts";
import type { RestoreNames } from "./ReplyView.tsx";

export const BOARD_LANE_ID = "event-board-lane";
const GHOST_SLOTS = [1, 2, 3];

type EventData = { card: EventCard; view: BoardView; restoreNames: RestoreNames; index: number; total: number };
type EventNodeType = Node<EventData, "event">;
type GhostNodeType = Node<Record<string, never>, "ghost">;

function EventNode({ data: { card, view, restoreNames, index, total } }: NodeProps<EventNodeType>) {
  return (
    <>
      <Handle type="target" position={Position.Left} isConnectable={false} />
      <BoardCard card={card} view={view} restoreNames={restoreNames} place={{ index, total }} />
      <Handle type="source" position={Position.Right} isConnectable={false} />
    </>
  );
}

const GhostNode = () => <div className="ghost-card" />;

const NODE_TYPES = { event: EventNode, ghost: GhostNode };

type LaneProps = { view: BoardView; thinking: boolean; restoreNames: RestoreNames };

function nodesOf({ view, thinking, restoreNames }: LaneProps): (EventNodeType | GhostNodeType)[] {
  const { cards } = view.board;
  const events: EventNodeType[] = cards.map((card, index) => ({
    id: card.id,
    type: "event",
    position: lanePosition(index),
    ariaRole: "listitem",
    data: { card, view, restoreNames, index: index + 1, total: cards.length },
  }));
  const ghosts: GhostNodeType[] = thinking
    ? GHOST_SLOTS.map((slot) => ({ id: `ghost-${slot}`, type: "ghost", className: "board-ghost", position: lanePosition(cards.length + slot - 1), data: {}, domAttributes: { "aria-hidden": true } }))
    : [];
  return [...events, ...ghosts];
}

const thenEdgesOf = (cards: readonly EventCard[]): Edge[] =>
  cards.slice(1).map((card, index) => ({
    id: `then-${cards[index]!.id}-${card.id}`,
    source: cards[index]!.id,
    target: card.id,
    type: "straight",
    markerEnd: { type: MarkerType.ArrowClosed },
    className: "then-edge",
    domAttributes: { "aria-hidden": true },
  }));

export function BoardFlow(props: LaneProps) {
  return (
    <ReactFlowProvider>
      <Lane {...props} />
    </ReactFlowProvider>
  );
}

function Lane(props: LaneProps) {
  const root = useRef<HTMLDivElement>(null);
  const nodes = useMemo(() => nodesOf(props), [props]);
  const edges = useMemo(() => thenEdgesOf(props.view.board.cards), [props.view.board.cards]);
  usePanToChanges(props.view.board);
  useLayoutEffect(() => asList(root.current), [nodes.length]);
  return (
    <div ref={root} className="board-lane">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        defaultViewport={{ x: LANE_INSET, y: 16, zoom: 1 }}
        nodesDraggable={false}
        nodesConnectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        elementsSelectable={false}
        onNodeClick={keepPointerEvents}
        panOnScroll
        zoomOnScroll={false}
        zoomOnDoubleClick={false}
        minZoom={0.5}
        maxZoom={1.5}
      />
    </div>
  );
}

const keepPointerEvents = () => {};

function asList(root: HTMLDivElement | null): void {
  root?.querySelector(".react-flow")?.removeAttribute("role");
  const list = root?.querySelector(".react-flow__nodes");
  if (!list) return;
  list.setAttribute("role", "list");
  list.setAttribute("aria-label", "Events on the board");
  list.setAttribute("id", BOARD_LANE_ID);
  list.setAttribute("tabindex", "0");
}
