import type { ExchangeId } from "./exchange.ts";

export type CardKind = "event";
export type CardId = string & { readonly __brand: "CardId" };
export type Provenance = "thread" | "guess";
export type EventCard = {
  readonly id: CardId;
  readonly kind: "event";
  readonly text: string;
  readonly provenance: Provenance;
  readonly placedBy: ExchangeId;
  readonly changedBy: ExchangeId;
};
export type Board = { readonly cards: readonly EventCard[]; readonly latest: ExchangeId | null };
export type BoardAction = { type: "addEvent"; id: CardId; text: string; provenance: Provenance; by: ExchangeId };
export type CardChange = "added" | "updated" | null;

export type RenameCard = { type: "renameCard"; id: CardId; text: string }; // #95
export type ConnectCards = { type: "connectCards"; from: CardId; to: CardId }; // #96
export type AddQuestion = { type: "addQuestion"; id: string; text: string; about?: CardId }; // #97
export type LaterBoardAction = RenameCard | ConnectCards | AddQuestion;

export const PROVENANCE_LABEL: Record<Provenance, "FROM THREAD" | "GUESS"> = { thread: "FROM THREAD", guess: "GUESS" };

export const emptyBoard: Board = { cards: [], latest: null };

export function cardIdOf(kind: CardKind, text: string): CardId {
  const normalised = text.toLowerCase().replace(/\s+/g, " ").trim().replace(/[.!?]+$/, "");
  return `${kind}:${normalised}` as CardId;
}

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
