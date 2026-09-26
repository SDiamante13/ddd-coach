import type { EntityId } from "./entityId.ts";
import type { ExchangeId } from "./exchange.ts";

export type Provenance = "thread" | "guess";
export type EventCard = {
  readonly id: EntityId;
  readonly kind: "event";
  readonly text: string;
  readonly previousText?: string;
  readonly provenance: Provenance;
  readonly previousProvenance?: Provenance;
  readonly placedBy: ExchangeId;
  readonly changedBy: ExchangeId;
};
export type Board = { readonly cards: readonly EventCard[]; readonly latest: ExchangeId | null };
export type BoardAction = { type: "addEvent"; id: EntityId; text: string; provenance: Provenance; by: ExchangeId };
export type CardChange = "added" | "updated" | null;

export const PROVENANCE_LABEL: Record<Provenance, "FROM THREAD" | "GUESS"> = { thread: "FROM THREAD", guess: "GUESS" };

export const emptyBoard: Board = { cards: [], latest: null };

export function applyAction(board: Board, action: BoardAction): Board {
  return { cards: cardsAfter(board.cards, action), latest: action.by };
}

function cardsAfter(cards: readonly EventCard[], action: BoardAction): readonly EventCard[] {
  const known = cards.find((card) => card.id === action.id);
  if (known === undefined) return [...cards, placed(action)];
  const restated = restatement(known, action);
  return restated === known ? cards : cards.map((card) => (card === known ? restated : card));
}

function placed({ id, text, provenance, by }: BoardAction): EventCard {
  return { id, kind: "event", text, provenance, placedBy: by, changedBy: by };
}

function restatement(card: EventCard, { text, provenance, by }: BoardAction): EventCard {
  if (provenance !== card.provenance) {
    return { ...card, text, previousText: undefined, provenance, previousProvenance: card.provenance, changedBy: by };
  }
  return wording(text) === wording(card.text) ? card : { ...card, text };
}

const wording = (text: string): string => text.replace(/\s+/g, " ").trim();

export function changeOf(board: Board, card: EventCard): CardChange {
  if (card.placedBy === board.latest) return "added";
  return changedByLatest(board, card) ? "updated" : null;
}

export function previousTextOf(board: Board, card: EventCard): string | null {
  return changedByLatest(board, card) ? (card.previousText ?? null) : null;
}

export function previousProvenanceOf(board: Board, card: EventCard): Provenance | null {
  return changedByLatest(board, card) ? (card.previousProvenance ?? null) : null;
}

const changedByLatest = (board: Board, card: EventCard): boolean => card.changedBy === board.latest;

export function boardSummary({ cards }: Board): string {
  const guesses = cards.filter((card) => card.provenance === "guess").length;
  const events = `${cards.length} ${cards.length === 1 ? "event" : "events"}`;
  return guesses === 0 ? events : `${events} · ${guesses} ${guesses === 1 ? "guess" : "guesses"}`;
}
