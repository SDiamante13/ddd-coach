import { type Edge, Handle, type Node, type NodeProps, Position } from "@xyflow/react";
import type { BoardView } from "./EventBoard.tsx";
import { CARD_HEIGHT, CARD_WIDTH, lanePosition } from "./boardLayout.ts";
import { useState } from "react";
import type { EntityId } from "../domain/entityId.ts";
import { type Hotspot, hotspotNameOf } from "./hotspot.ts";
import { unplacedLabel } from "./unplacedQuotes.ts";

const DROP = CARD_HEIGHT + 96;

type QuestionData = { hotspot: Hotspot; fresh: boolean; roving: Roving };
export type Roving = { tabIndex: 0 | -1; onFocus: () => void };
export type QuestionNodeType = Node<QuestionData, "question">;

export function QuestionNode({ data: { hotspot, fresh, roving } }: NodeProps<QuestionNodeType>) {
  return (
    <>
      <Handle id="relates-in" type="target" position={Position.Top} isConnectable={false} />
      <Handle id="relates-below" type="target" position={Position.Bottom} isConnectable={false} />
      <div className="card hotspot-card" tabIndex={roving.tabIndex} onFocus={roving.onFocus} data-board-item data-lane="question">
        <span className="card-kind">QUESTION</span>
        <span className="card-source">OPEN</span>
        <span className="card-title">{hotspot.text}</span>
        {hotspot.unplaced.length > 0 && <UnplacedQuotes quotes={hotspot.unplaced} tabIndex={roving.tabIndex} />}
        {fresh && (
          <>
            <span className="card-ring" aria-hidden="true" />
            <span className="card-tag">JUST ADDED</span>
          </>
        )}
      </div>
    </>
  );
}

function UnplacedQuotes({ quotes, tabIndex }: { quotes: readonly string[]; tabIndex: 0 | -1 }) {
  const [shown, setShown] = useState(false);
  return (
    <span className="hotspot-unplaced nodrag">
      <button type="button" aria-expanded={shown} tabIndex={tabIndex} onClick={() => setShown(!shown)}>
        {unplacedLabel(quotes.length)}
      </button>
      {shown && quotes.map((quote) => <span key={quote} className="hotspot-quote">{`“${quote}”`}</span>)}
    </span>
  );
}

export function questionNodesOf(view: BoardView): QuestionNodeType[] {
  const { hotspot, board } = view;
  if (hotspot === null) return [];
  const fresh = hotspot.askedIn === board.latest && !view.atRest && !view.quietRings;
  return [{ id: hotspot.id, type: "question", position: view.positions.get(hotspot.id) ?? placeOf(hotspot, view), width: CARD_WIDTH, height: CARD_HEIGHT, ariaRole: "listitem", ariaLabel: hotspotNameOf(hotspot, board), data: { hotspot, fresh, roving: rovingOf(view, hotspot.id) } }];
}

function placeOf({ links }: Hotspot, { board }: BoardView) {
  const indices = links.map((id) => board.cards.findIndex((card) => card.id === id));
  const around = indices.length === 0 ? [board.cards.length - 1] : indices;
  const x = around.reduce((sum, index) => sum + lanePosition(index).x, 0) / around.length;
  return { x, y: DROP };
}

export const rovingOf = (view: BoardView, id: EntityId): Roving => ({ tabIndex: view.rovingId === id ? 0 : -1, onFocus: () => view.setRovingId(id) });

const relates = (id: string, source: string, sourceHandle: string, target: string, targetHandle: string): Edge => ({
  id,
  source,
  sourceHandle,
  target,
  targetHandle,
  className: "relates-edge",
  zIndex: RELATES_ABOVE_CARDS,
  interactionWidth: 0,
  style: { pointerEvents: "none" },
  domAttributes: { "aria-hidden": true },
});

const RELATES_ABOVE_CARDS = 20;

export function relatesEdgesOf({ hotspot }: BoardView, nodes: readonly Node[]): Edge[] {
  if (hotspot === null) return [];
  const centre = (id: string) => {
    const node = nodes.find((each) => each.id === id);
    return node ? node.position.x + (node.width ?? CARD_WIDTH) / 2 : 0;
  };
  const sideOf = (term: string) => (centre(term) < centre(hotspot.id) ? "right" : "left");
  return [
    ...hotspot.links.map((link) => relates(`relates-${link}`, link, "link-out", hotspot.id, "relates-in")),
    ...hotspot.rows.map(({ term, row }) => relates(`relates-${row}`, term, `${row}|${sideOf(term)}`, hotspot.id, "relates-below")),
  ];
}
