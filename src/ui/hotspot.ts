import type { Board } from "../domain/board.ts";
import { type EntityId, entityId } from "../domain/entityId.ts";
import type { Exchange, ExchangeId } from "../domain/exchange.ts";
import { latestQuestionOf } from "../domain/latestQuestion.ts";
import { questionTiesOf } from "../domain/questionLinks.ts";
import { unplacedLabel } from "./unplacedQuotes.ts";
import type { RestoreNames } from "./ReplyView.tsx";

export type Hotspot = { id: EntityId; text: string; links: readonly EntityId[]; unplaced: readonly string[]; askedIn: ExchangeId };

export function hotspotOf(exchanges: readonly Exchange[], board: Board, restoreNames: RestoreNames): Hotspot | null {
  const asked = latestQuestionOf(exchanges);
  if (asked === null || board.cards.length === 0) return null;
  const { links, unplaced } = questionTiesOf(asked, board, exchanges);
  const restored = (text: string) => restoreNames(text).text;
  return { id: entityId("question", asked.text), text: restored(asked.text), links, unplaced: unplaced.map(restored), askedIn: asked.exchangeId };
}

export function hotspotNameOf({ text, links, unplaced }: Hotspot, board: Board): string {
  const events = links.map((id) => `Event ${board.cards.findIndex((card) => card.id === id) + 1}`);
  const relates = events.length === 0 ? [] : [`relates to ${events.join(" and ")}`];
  const missing = unplaced.length === 0 ? [] : [unplacedLabel(unplaced.length)];
  return [`Open question: ${text}`, ...relates, ...missing].join(", ");
}
