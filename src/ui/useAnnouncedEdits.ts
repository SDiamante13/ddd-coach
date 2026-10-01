import { useEffect, useState } from "react";
import { lastEdit } from "../domain/cardMoves.ts";
import { type Board, canLink } from "../domain/board.ts";
import type { EntityId } from "../domain/entityId.ts";
import type { ExchangeId } from "../domain/exchange.ts";
import { correctionLineText } from "./CorrectionLines.tsx";
import { linkLineText, titleOf } from "./linkLines.ts";
import type { RestoreNames } from "./ReplyView.tsx";
import type { useVisitorActions } from "./useVisitorActions.ts";

export const CORRECTION_UNDONE = "Correction undone.";
export const LINK_UNDONE = "Link undone.";
export const ALREADY_LINKED = "Already linked.";
const SPOKEN_FOR_MS = 5000;

export function useAnnouncedEdits(board: Board, edits: ReturnType<typeof useVisitorActions>, restoreNames: RestoreNames) {
  const [announcement, setAnnouncement] = useTurnAnnouncement(board.latest);
  const correct = (id: EntityId, text: string) => {
    const card = board.cards.find((each) => each.id === id);
    if (board.latest === null || card === undefined) return;
    edits.correct(id, text, board.latest);
    setAnnouncement(correctionLineText({ was: restoreNames(card.text).text, now: text }));
  };
  const connect = (from: EntityId, to: EntityId) => {
    if (board.latest === null) return;
    if (!canLink(board, from, to)) return setAnnouncement(ALREADY_LINKED);
    edits.connect(from, to, board.latest);
    setAnnouncement(linkLineText({ from: titleOf(board, from, restoreNames), to: titleOf(board, to, restoreNames) }));
  };
  const undo = () => {
    setAnnouncement(lastEdit(edits.actions)?.kind === "connect" ? LINK_UNDONE : CORRECTION_UNDONE);
    edits.undo();
  };
  return { correct, connect, undo, announcement, announce: setAnnouncement };
}

function useTurnAnnouncement(turn: ExchangeId | null): [string, (text: string) => void] {
  const [said, setSaid] = useState({ text: "", at: turn });
  useEffect(() => {
    const timer = setTimeout(() => setSaid((current) => (current === said ? { ...said, text: "" } : current)), SPOKEN_FOR_MS);
    return () => clearTimeout(timer);
  }, [said]);
  return [said.at === turn ? said.text : "", (text) => setSaid({ text, at: turn })];
}
