import { useState } from "react";
import type { Board } from "../domain/board.ts";
import type { EntityId } from "../domain/entityId.ts";
import { correctionLineText } from "./CorrectionLines.tsx";
import { linkLineText, titleOf } from "./linkLines.ts";
import type { RestoreNames } from "./ReplyView.tsx";
import type { useVisitorActions } from "./useVisitorActions.ts";

export const CORRECTION_UNDONE = "Correction undone.";
export const LINK_UNDONE = "Link undone.";

export function useAnnouncedEdits(board: Board, edits: ReturnType<typeof useVisitorActions>, restoreNames: RestoreNames) {
  const [announcement, setAnnouncement] = useState("");
  const correct = (id: EntityId, text: string) => {
    const card = board.cards.find((each) => each.id === id);
    if (board.latest === null || card === undefined) return;
    edits.correct(id, text, board.latest);
    setAnnouncement(correctionLineText({ was: restoreNames(card.text).text, now: text }));
  };
  const connect = (from: EntityId, to: EntityId) => {
    if (board.latest === null) return;
    edits.connect(from, to, board.latest);
    setAnnouncement(linkLineText({ from: titleOf(board, from, restoreNames), to: titleOf(board, to, restoreNames) }));
  };
  const undo = () => {
    setAnnouncement(edits.actions.at(-1)?.kind === "connect" ? LINK_UNDONE : CORRECTION_UNDONE);
    edits.undo();
  };
  return { correct, connect, undo, announcement };
}
