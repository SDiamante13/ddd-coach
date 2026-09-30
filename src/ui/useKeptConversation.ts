import { useEffect, useState } from "react";
import { sentCorrectionsOf } from "../domain/board.ts";
import { boardOf } from "../domain/boardFromReplies.ts";
import type { ExchangeId, Prompt } from "../domain/exchange.ts";
import type { KeptGlossaryRow } from "../domain/glossary.ts";
import { CORRECTIONS_ENABLED } from "../shared/features.ts";
import type { Session } from "../domain/session.ts";
import { keepSession, keptSession } from "./sessionStore.ts";
import { useExchanges } from "./useExchanges.ts";
import { useVisitorActions } from "./useVisitorActions.ts";

export type RestorePoint = { turn: ExchangeId | null; actions: number; savedAt: string | null };

type KeptConversationOptions = {
  outgoing: (text: string) => string;
  onRefused: (prompt: Prompt) => void;
  onAccessLost: () => void;
  glossary: () => readonly KeptGlossaryRow[];
};

export function useKeptConversation({ outgoing, ...callbacks }: KeptConversationOptions) {
  const [kept] = useState(keptSession);
  const [restorePoint] = useState(() => restorePointOf(kept));
  const [viewport, keepViewport] = useState(kept.viewport);
  const edits = useVisitorActions(outgoing, kept.visitorActions);
  const chat = useExchanges({
    ...callbacks,
    corrections: () => (CORRECTIONS_ENABLED ? sentCorrectionsOf(boardOf(chat.exchanges, edits.actions)) : []),
    initial: kept.exchanges,
  });
  useEffect(() => keepSession({ exchanges: chat.exchanges, visitorActions: edits.actions, viewport }), [chat.exchanges, edits.actions, viewport]);
  const clear = () => {
    chat.clear();
    edits.clear();
    keepViewport(null);
  };
  return { ...chat, edits, clear, restorePoint, viewport, keepViewport };
}

const restorePointOf = (kept: Session): RestorePoint => ({
  turn: boardOf(kept.exchanges, kept.visitorActions).latest,
  actions: kept.visitorActions.length,
  savedAt: kept.exchanges.length > 0 ? kept.savedAt : null,
});
