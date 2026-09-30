import { useState } from "react";
import type { Board } from "../domain/board.ts";
import type { EntityId } from "../domain/entityId.ts";
import { correctionLineText } from "./CorrectionLines.tsx";
import type { RestoreNames } from "./ReplyView.tsx";
import type { useVisitorActions } from "./useVisitorActions.ts";

export const CORRECTION_UNDONE = "Correction undone.";

export function useAnnouncedEdits(board: Board, edits: ReturnType<typeof useVisitorActions>, restoreNames: RestoreNames) {
  const [announcement, setAnnouncement] = useState("");
  const correct = (id: EntityId, text: string) => {
    const card = board.cards.find((each) => each.id === id);
    if (board.latest === null || card === undefined) return;
    edits.correct(id, text, board.latest);
    setAnnouncement(correctionLineText({ was: restoreNames(card.text).text, now: text }));
  };
  const undo = () => {
    edits.undo();
    setAnnouncement(CORRECTION_UNDONE);
  };
  return { correct, undo, announcement };
}
