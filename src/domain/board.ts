import type { EntityId } from "./entityId.ts";
import type { ExchangeId } from "./exchange.ts";

export type Provenance = "thread" | "guess";
export type EventCard = {
  readonly id: EntityId;
  readonly kind: "event";
  readonly text: string;
  readonly provenance: Provenance;
  readonly placedBy: ExchangeId;
  readonly changedBy: ExchangeId;
};
export type Board = { readonly cards: readonly EventCard[]; readonly latest: ExchangeId | null };
export type BoardAction = { type: "addEvent"; id: EntityId; text: string; provenance: Provenance; by: ExchangeId };
export type CardChange = "added" | "updated" | null;

export type RenameCard = { type: "renameCard"; id: EntityId; text: string }; // #95
export type ConnectCards = { type: "connectCards"; from: EntityId; to: EntityId }; // #96
export type AddQuestion = { type: "addQuestion"; id: string; text: string; about?: EntityId }; // #97
export type LaterBoardAction = RenameCard | ConnectCards | AddQuestion;

export const PROVENANCE_LABEL: Record<Provenance, "FROM THREAD" | "GUESS"> = { thread: "FROM THREAD", guess: "GUESS" };

export const emptyBoard: Board = { cards: [], latest: null };

export function applyAction(board: Board, action: BoardAction): Board {
  return { cards: cardsAfter(board.cards, action), latest: action.by };
}

function cardsAfter(cards: readonly EventCard[], { id, text, provenance, by }: BoardAction): readonly EventCard[] {
  const known = cards.find((card) => card.id === id);
  if (known === undefined) return [...cards, { id, kind: "event", text, provenance, placedBy: by, changedBy: by }];
  if (known.provenance === provenance) return cards;
  return cards.map((card) => (card === known ? { ...card, provenance, changedBy: by } : card));
}

export function changeOf(board: Board, card: EventCard): CardChange {
  if (card.placedBy === board.latest) return "added";
  return card.changedBy === board.latest ? "updated" : null;
}
