import { Handle, type Node, type NodeProps, Position, ReactFlow, ReactFlowProvider, type Edge, MarkerType } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useLayoutEffect, useMemo, useRef } from "react";
import type { EventCard } from "../domain/board.ts";
import type { EntityId } from "../domain/entityId.ts";
import { titleOf } from "./linkLines.ts";
import { BoardCard } from "./BoardCard.tsx";
import { BOARD_ZOOM } from "../domain/session.ts";
import type { BoardSession, BoardView } from "./EventBoard.tsx";
import { CARD_HEIGHT, CARD_WIDTH, LANE_INSET, lanePosition } from "./boardLayout.ts";
import { NewEventsChip } from "./NewEventsChip.tsx";
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
    </>
  );
}

const GhostNode = () => <div className="ghost-card" />;

const NODE_TYPES = { event: EventNode, ghost: GhostNode };

type LaneProps = { view: BoardView; thinking: boolean; restoreNames: RestoreNames; session: BoardSession };

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

const LINK_DROP = 28;
const LINK_STACK = 12;

const linkEdgesOf = ({ view, restoreNames }: LaneProps): Edge[] =>
  view.board.links.map(({ from, to }, index) => ({
    ...(isJustDrawn(view, from, to) && { label: "Just drawn" }),
    id: `link-${from}-${to}`,
    source: from,
    target: to,
    sourceHandle: "link-out",
    targetHandle: "link-in",
    type: "smoothstep",
    pathOptions: { offset: LINK_DROP + LINK_STACK * index, borderRadius: 16 },
    className: isJustDrawn(view, from, to) ? "link-edge just-drawn" : "link-edge",
    markerEnd: { type: MarkerType.ArrowClosed, color: isJustDrawn(view, from, to) ? "var(--color-coach)" : "var(--color-ink)" },
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
  const newEvents = usePanToChanges(props.view);
  useLayoutEffect(() => asList(root.current), [nodes.length]);
  return (
    <div ref={root} className="board-lane">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        defaultViewport={props.session.viewport ?? START_VIEWPORT}
        onMoveEnd={(_event, viewport) => props.session.keepViewport(viewport)}
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
        minZoom={BOARD_ZOOM.min}
        maxZoom={BOARD_ZOOM.max}
      />
      <NewEventsChip events={newEvents} />
    </div>
  );
}

const keepPointerEvents = () => {};
const START_VIEWPORT = { x: LANE_INSET, y: 16, zoom: 1 };

function asList(root: HTMLDivElement | null): void {
  root?.querySelector(".react-flow")?.removeAttribute("role");
  const list = root?.querySelector(".react-flow__nodes");
  if (!list) return;
  list.setAttribute("role", "list");
  list.setAttribute("aria-label", "Events on the board");
  list.setAttribute("id", BOARD_LANE_ID);
  list.setAttribute("tabindex", "0");
}
