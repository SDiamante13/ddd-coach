import { Handle, type Node, type NodeProps, Position, ReactFlow, ReactFlowProvider, type Edge, MarkerType } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useLayoutEffect, useMemo, useRef } from "react";
import type { EventCard } from "../domain/board.ts";
import type { EntityId } from "../domain/entityId.ts";
import { titleOf } from "./linkLines.ts";
import { BoardCard } from "./BoardCard.tsx";
import type { BoardView } from "./EventBoard.tsx";
import { CARD_HEIGHT, CARD_WIDTH, LANE_INSET, lanePosition } from "./boardLayout.ts";
import { usePanToChanges } from "./usePanToChanges.ts";
import type { RestoreNames } from "./ReplyView.tsx";

export const BOARD_LANE_ID = "event-board-lane";
const GHOST_SLOTS = [1, 2, 3];
const LIFTED = 10;
const SLOT = { width: CARD_WIDTH, height: CARD_HEIGHT };

type EventData = { card: EventCard; view: BoardView; restoreNames: RestoreNames; index: number; total: number };
type EventNodeType = Node<EventData, "event">;
type GhostNodeType = Node<Record<string, never>, "ghost">;

function EventNode({ data: { card, view, restoreNames, index, total } }: NodeProps<EventNodeType>) {
  return (
    <>
      <Handle id="then-in" type="target" position={Position.Left} isConnectable={false} />
      <BoardCard card={card} view={view} restoreNames={restoreNames} place={{ index, total }} />
      <Handle id="then-out" type="source" position={Position.Right} isConnectable={false} />
      <Handle id="link-out" type="source" position={Position.Bottom} className="link-handle" aria-label="Drag to link this card" />
      <Handle id="link-in" type="target" position={Position.Bottom} className="link-handle link-in" />
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
    ...SLOT,
    zIndex: view.selected === card.id ? LIFTED : 0,
    ariaRole: "listitem",
    data: { card, view, restoreNames, index: index + 1, total: cards.length },
  }));
  const ghosts: GhostNodeType[] = thinking
    ? GHOST_SLOTS.map((slot) => ({ id: `ghost-${slot}`, type: "ghost", className: "board-ghost", position: lanePosition(cards.length + slot - 1), ...SLOT, data: {}, domAttributes: { "aria-hidden": true } }))
    : [];
  return [...events, ...ghosts];
}

const thenEdgesOf = (cards: readonly EventCard[]): Edge[] =>
  cards.slice(1).map((card, index) => ({
    id: `then-${cards[index]!.id}-${card.id}`,
    source: cards[index]!.id,
    target: card.id,
    sourceHandle: "then-out",
    targetHandle: "then-in",
    type: "straight",
    markerEnd: { type: MarkerType.ArrowClosed, color: "var(--color-ink)" },
    className: "then-edge",
    domAttributes: { "aria-hidden": true },
  }));

const linkEdgesOf = ({ view, restoreNames }: LaneProps): Edge[] =>
  view.board.links.map(({ from, to }) => ({
    ...(isJustDrawn(view, from, to) && { label: "Just drawn" }),
    id: `link-${from}-${to}`,
    source: from,
    target: to,
    sourceHandle: "link-out",
    targetHandle: "link-in",
    type: "smoothstep",
    pathOptions: { offset: 28, borderRadius: 16 },
    className: isJustDrawn(view, from, to) ? "link-edge just-drawn" : "link-edge",
    markerEnd: { type: MarkerType.ArrowClosed, color: "var(--color-coach)" },
    ariaLabel: `Link from “${titleOf(view.board, from, restoreNames)}” to “${titleOf(view.board, to, restoreNames)}”`,
  }));

const isJustDrawn = ({ justDrawn }: BoardView, from: EntityId, to: EntityId): boolean => justDrawn?.from === from && justDrawn.to === to;

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
  const edges = useMemo(() => [...thenEdgesOf(props.view.board.cards), ...linkEdgesOf(props)], [props]);
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
        onConnect={({ source, target }) => props.view.connect(source as EntityId, target as EntityId)}
        isValidConnection={({ source, target }) => source !== target}
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
