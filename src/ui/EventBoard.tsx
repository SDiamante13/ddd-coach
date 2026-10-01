import { type Board, boardSummary, type Link } from "../domain/board.ts";
import "../styles/board.css";
import type { EntityId } from "../domain/entityId.ts";
import { ReactFlowProvider } from "@xyflow/react";
import { useState } from "react";
import { BoardFlow } from "./BoardFlow.tsx";
import { BoardControls } from "./BoardControls.tsx";
import { PickedUpLine } from "./PickedUpLine.tsx";
import type { Hotspot } from "./hotspot.ts";
import type { WordsLane } from "../domain/words.ts";
import { wordsSummaryOf } from "./TermNode.tsx";
import type { Position } from "../domain/cardMoves.ts";
import type { OffScreenOffer } from "./useOffScreenOffer.ts";
import type { Viewport } from "../domain/session.ts";
import type { RestoreNames } from "./ReplyView.tsx";

export { BOARD_LANE_ID } from "./BoardFlow.tsx";

export type BoardView = {
  board: Board;
  selected: EntityId | null;
  toggle: (id: EntityId) => void;
  correct: (id: EntityId, text: string) => void;
  connect: (from: EntityId, to: EntityId) => void;
  justDrawn: Link | null;
  undo: () => void;
  undoable: EntityId | null;
  highlightedLine: string | null;
  followingCoach: boolean;
  positions: ReadonlyMap<EntityId, Position>;
  move: (id: EntityId, position: Position) => void;
  newOffScreen: OffScreenOffer | null;
  offerNew: (offer: OffScreenOffer | null) => void;
  newReveals: number;
  revealNew: () => void;
  atRest: boolean;
  freshCount: number;
  quietRings: boolean;
  hotspot: Hotspot | null;
  words: WordsLane;
  rovingId: EntityId | null;
  focusedId: EntityId | null;
  setRovingId: (id: EntityId) => void;
  questionReveals: number;
  revealQuestion: () => void;
  setFollowingCoach: (following: boolean) => void;
};
export type BoardSession = { pickedUpAt: string | null; viewport: Viewport | null; keepViewport: (viewport: Viewport) => void; saving: boolean };

export const NOT_SAVING = "This browser isn't saving your session, so a reload will lose the conversation and board.";
type EventBoardProps = { view: BoardView; thinking: boolean; restoreNames: RestoreNames; session?: BoardSession };

const NO_SESSION: BoardSession = { pickedUpAt: null, viewport: null, keepViewport: () => {}, saving: true };

export function EventBoard({ view, thinking, restoreNames, session = NO_SESSION }: EventBoardProps) {
  const hasEvents = view.board.cards.length > 0 || thinking;
  const empty = !hasEvents && view.words.terms.length === 0;
  const [overview, setOverview] = useState(wideEnoughForOverview);
  return (
    <ReactFlowProvider>
      <BoardSection view={view} thinking={thinking} restoreNames={restoreNames} session={session} hasEvents={hasEvents} empty={empty} overview={overview} setOverview={setOverview} />
    </ReactFlowProvider>
  );
}

type BoardSectionProps = Required<EventBoardProps> & { hasEvents: boolean; empty: boolean; overview: boolean; setOverview: (shown: boolean) => void };

function BoardSection({ view, thinking, restoreNames, session, hasEvents, empty, overview, setOverview }: BoardSectionProps) {
  return (
    <section className="event-board" aria-label="Event board">
      {!session.saving && (
        <p className="not-saving" role="status">
          {NOT_SAVING}
        </p>
      )}
      <PickedUpLine savedAt={session.pickedUpAt} />
      {empty ? (
        <p className="board-empty">Events from your paste land here, left to right, in order.</p>
      ) : (
        <>
          <div className="board-header-row">
            <p className="board-header">
              {hasEvents && (
                <>
                  <span className="board-label">Timeline · Events</span> <span>{`${boardSummary(view.board)}${view.hotspot ? " · 1 open question" : ""}`}</span>
                </>
              )}
              {wordsSummaryOf(view.words) && <span className={hasEvents ? "board-words" : "board-words alone"}>{wordsSummaryOf(view.words)}</span>}
              {view.quietRings && <span className="many-new">{`${view.freshCount} new on the board`}</span>}
            </p>
            <BoardControls following={view.followingCoach} onFollowChange={view.setFollowingCoach} overview={overview} onOverviewChange={setOverview} />
          </div>
          <BoardFlow view={view} thinking={thinking} restoreNames={restoreNames} session={session} overview={overview} />
        </>
      )}
    </section>
  );
}

const wideEnoughForOverview = (): boolean => window.matchMedia?.("(min-width: 900px)").matches ?? true;
