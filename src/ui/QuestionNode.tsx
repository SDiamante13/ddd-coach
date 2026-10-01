import { type Edge, Handle, type Node, type NodeProps, Position } from "@xyflow/react";
import type { BoardView } from "./EventBoard.tsx";
import { CARD_HEIGHT, CARD_WIDTH, lanePosition } from "./boardLayout.ts";
import { useState } from "react";
import { type Hotspot, hotspotNameOf } from "./hotspot.ts";
import { unplacedLabel } from "./unplacedQuotes.ts";

const DROP = CARD_HEIGHT + 96;

type QuestionData = { hotspot: Hotspot; fresh: boolean };
export type QuestionNodeType = Node<QuestionData, "question">;

export function QuestionNode({ data: { hotspot, fresh } }: NodeProps<QuestionNodeType>) {
  return (
    <>
      <Handle id="relates-in" type="target" position={Position.Top} isConnectable={false} />
      <div className="card hotspot-card" tabIndex={-1}>
        <span className="card-kind">QUESTION</span>
        <span className="card-source">OPEN</span>
        <span className="card-title">{hotspot.text}</span>
        {hotspot.unplaced.length > 0 && <UnplacedQuotes quotes={hotspot.unplaced} />}
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

function UnplacedQuotes({ quotes }: { quotes: readonly string[] }) {
  const [shown, setShown] = useState(false);
  return (
    <span className="hotspot-unplaced nodrag">
      <button type="button" aria-expanded={shown} onClick={() => setShown(!shown)}>
        {unplacedLabel(quotes.length)}
      </button>
      {shown && quotes.map((quote) => <span key={quote} className="hotspot-quote">{`“${quote}”`}</span>)}
    </span>
  );
}

export function questionNodesOf(view: BoardView): QuestionNodeType[] {
  const { hotspot, board } = view;
  if (hotspot === null) return [];
  const fresh = hotspot.askedIn === board.latest && !view.atRest;
  return [{ id: hotspot.id, type: "question", position: view.positions.get(hotspot.id) ?? placeOf(hotspot, view), width: CARD_WIDTH, height: CARD_HEIGHT, ariaRole: "listitem", ariaLabel: hotspotNameOf(hotspot, board), data: { hotspot, fresh } }];
}

function placeOf({ links }: Hotspot, { board }: BoardView) {
  const indices = links.map((id) => board.cards.findIndex((card) => card.id === id));
  const around = indices.length === 0 ? [board.cards.length - 1] : indices;
  const x = around.reduce((sum, index) => sum + lanePosition(index).x, 0) / around.length;
  return { x, y: DROP };
}

export const relatesEdgesOf = ({ hotspot, board }: BoardView): Edge[] =>
  hotspot === null
    ? []
    : hotspot.links.map((link) => ({
        id: `relates-${link}`,
        source: link,
        sourceHandle: "link-out",
        target: hotspot.id,
        targetHandle: "relates-in",
        className: "relates-edge",
        domAttributes: { "aria-hidden": true },
      }));
