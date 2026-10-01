import { useMemo, useState } from "react";
import { type Board, changeOf, struckWordsOf } from "../domain/board.ts";
import { boardOf, replyCountsOf, type VisitorAction } from "../domain/boardFromReplies.ts";
import type { ReplyCounts } from "../domain/replyChip.ts";
import type { EntityId } from "../domain/entityId.ts";
import type { Exchange, ExchangeId } from "../domain/exchange.ts";
import { latestQuestionOf } from "../domain/latestQuestion.ts";
import { lineOfCard, type LineMatch } from "../domain/sourceLine.ts";
import type { RestoreNames } from "./ReplyView.tsx";
import type { CorrectionLine } from "./CorrectionLines.tsx";
import { useAnnouncedEdits } from "./useAnnouncedEdits.ts";
import { type Hotspot, hotspotOf } from "./hotspot.ts";
import { type WordsLane, wordsOf } from "../domain/words.ts";
import { lastEdit, type Position, positionsOf } from "../domain/cardMoves.ts";
import { checksOf } from "../domain/rowChecks.ts";
import type { Verdict } from "../domain/boardFromReplies.ts";
import { useOffScreenOffer } from "./useOffScreenOffer.ts";
import { justDrawnOf, type LinkLine, linkLinesOf } from "./linkLines.ts";
import { useBoardSelection } from "./useBoardSelection.ts";
import type { useVisitorActions } from "./useVisitorActions.ts";
import type { RestorePoint } from "./useKeptConversation.ts";

const FRESH: RestorePoint = { turn: null, actions: 0, savedAt: null };

type FollowCoach = { followingCoach: boolean; setFollowingCoach: (following: boolean) => void };

export function useBoardView(exchanges: readonly Exchange[], restoreNames: RestoreNames, edits: ReturnType<typeof useVisitorActions>, follow: FollowCoach, restorePoint = FRESH) {
  const board = useMemo(() => boardOf(exchanges, edits.actions), [exchanges, edits.actions]);
  const counts = useMemo(() => replyCountsOf(exchanges, edits.actions), [exchanges, edits.actions]);
  const words = useMemo(() => wordsOf(exchanges), [exchanges]);
  const hotspot = hotspotOf(exchanges, board, restoreNames);
  const atRest = restorePoint.turn !== null && board.latest === restorePoint.turn;
  const freshCount = freshItemsOf(board, words, hotspot);
  const announced = useAnnouncedEdits(board, edits, restoreNames);
  const { selected, toggle } = useBoardSelection();
  const [questionReveals, setQuestionReveals] = useState(0);
  const [focused, setRovingId] = useState<EntityId | null>(null);
  const offScreen = useOffScreenOffer(board.latest);
  const touching = <A extends unknown[]>(act: (...args: A) => void) => (...args: A) => {
    follow.setFollowingCoach(false);
    act(...args);
  };
  const selectedCard = board.cards.find((card) => card.id === selected);
  const highlight = selectedCard ? lineOfCard(selectedCard, exchanges) : null;
  return {
    board,
    countsOf: (id: ExchangeId): ReplyCounts => counts.get(id) ?? NO_EVENTS,
    selected: selectedCard?.id ?? null,
    ...announced,
    toggle: touching(toggle),
    correct: touching(announced.correct),
    connect: touching(announced.connect),
    ...offScreen,
    offScreenOf: (id: ExchangeId) => (offScreen.newOffScreen?.at === id ? offScreen.revealNew : undefined),
    followingCoach: follow.followingCoach,
    setFollowingCoach: follow.setFollowingCoach,
    linksOf: (id: ExchangeId): LinkLine[] => linkLinesOf(board, edits.actions, id, restoreNames, restorePoint.actions),
    justDrawn: edits.actions.length > restorePoint.actions ? justDrawnOf(board, edits.actions) : null,
    atRest,
    freshCount,
    quietRings: !atRest && freshCount > RINGS_UP_TO,
    undoable: undoableOf(board, lastEdit(edits.actions)),
    positions: positionsOf(edits.actions),
    checks: checksOf(edits.actions),
    check: touching((row: EntityId, verdict: Verdict, where: string) => {
      const after = board.latest ?? words.latest;
      if (after !== null) edits.check(row, verdict, where, after);
    }),
    move: (id: EntityId, position: Position) => {
      follow.setFollowingCoach(false);
      const after = board.latest ?? words.latest;
      if (after !== null) edits.move(id, position, after);
    },
    correctionsOf: (id: ExchangeId): CorrectionLine[] => correctionLinesOf(board, id, restoreNames, keptCorrection(edits.actions, restorePoint)),
    highlight,
    highlightedLine: highlight && restoredLine(lineTextOf(highlight, exchanges), restoreNames),
    question: latestQuestionOf(exchanges, (text) => restoreNames(text).text),
    hotspot,
    words,
    rovingId: focused ?? board.cards[0]?.id ?? words.terms[0]?.id ?? null,
    focusedId: focused,
    setRovingId: touching(setRovingId),
    questionReveals,
    revealQuestion: () => setQuestionReveals((count) => count + 1),
  };
}

function correctionLinesOf(board: Board, id: ExchangeId, restoreNames: RestoreNames, settled: (card: EntityId) => boolean): CorrectionLine[] {
  const restored = (text: string) => restoreNames(text).text;
  return board.cards.flatMap(({ id: card, correctedFrom, correctedAt, text }) =>
    correctedFrom !== undefined && correctedAt === id ? [{ was: restored(correctedFrom), now: restored(text), settled: settled(card) }] : [],
  );
}

const keptCorrection =
  (actions: readonly VisitorAction[], { actions: kept }: RestorePoint) =>
  (card: EntityId): boolean =>
    actions.reduce((last, action, index) => (action.kind === "correct" && action.id === card ? index : last), -1) < kept;

const NO_EVENTS: ReplyCounts = { added: 0, updated: 0, already: 0 };

function undoableOf(board: Board, last: VisitorAction | undefined): EntityId | null {
  const corrected = last?.kind === "correct" ? last.id : undefined;
  const card = board.cards.find(({ id }) => id === corrected);
  return card && struckWordsOf(board, card) !== null ? card.id : null;
}

function lineTextOf({ exchangeId, start, end }: LineMatch, exchanges: readonly Exchange[]): string | null {
  return exchanges.find((exchange) => exchange.id === exchangeId)?.prompt.slice(start, end) ?? null;
}

const restoredLine = (line: string | null, restoreNames: RestoreNames): string | null => line && restoreNames(line).text;

const RINGS_UP_TO = 5;

function freshItemsOf(board: Board, words: WordsLane, hotspot: Hotspot | null): number {
  const cards = board.cards.filter((card) => changeOf(board, card) === "added").length;
  const terms = words.terms.filter((term) => term.placedBy === words.latest).length;
  return cards + terms + (hotspot !== null && hotspot.askedIn === board.latest ? 1 : 0);
}
