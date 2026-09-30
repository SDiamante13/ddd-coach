import type { Board } from "../domain/board.ts";
import { type EntityId, entityId } from "../domain/entityId.ts";
import type { Exchange, ExchangeId } from "../domain/exchange.ts";
import { latestQuestionOf } from "../domain/latestQuestion.ts";
import { questionLinksOf } from "../domain/questionLinks.ts";
import type { RestoreNames } from "./ReplyView.tsx";

export type Hotspot = { id: EntityId; text: string; links: readonly EntityId[]; askedIn: ExchangeId };

export function hotspotOf(exchanges: readonly Exchange[], board: Board, restoreNames: RestoreNames): Hotspot | null {
  const asked = latestQuestionOf(exchanges);
  if (asked === null) return null;
  return { id: entityId("question", asked.text), text: restoreNames(asked.text).text, links: questionLinksOf(asked, board, exchanges), askedIn: asked.exchangeId };
}

export function hotspotNameOf({ text, links }: Hotspot, board: Board): string {
  const events = links.map((id) => `Event ${board.cards.findIndex((card) => card.id === id) + 1}`);
  return events.length === 0 ? `Open question: ${text}` : `Open question: ${text}, relates to ${events.join(" and ")}`;
}
