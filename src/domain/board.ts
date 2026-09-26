import { type EntityId, entityId } from "./entityId.ts";
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
  readonly correctedFrom?: string;
  readonly correctedAt?: ExchangeId | null;
};
export type Board = { readonly cards: readonly EventCard[]; readonly latest: ExchangeId | null };
export type AddEvent = { type: "addEvent"; id: EntityId; text: string; provenance: Provenance; by: ExchangeId };
export type CorrectCard = { type: "correctCard"; id: EntityId; text: string };
export type BoardAction = AddEvent | CorrectCard;
export type CardChange = "added" | "updated" | null;

export const PROVENANCE_LABEL: Record<Provenance, "FROM THREAD" | "GUESS"> = { thread: "FROM THREAD", guess: "GUESS" };

export const emptyBoard: Board = { cards: [], latest: null };

export function applyAction(board: Board, action: BoardAction): Board {
  if (action.type === "correctCard") return { ...board, cards: board.cards.map((card) => correctedCard(card, action, board.latest)) };
  return { cards: cardsAfter(board.cards, action), latest: action.by };
}

function correctedCard(card: EventCard, { id, text }: CorrectCard, latest: ExchangeId | null): EventCard {
  return card.id === id ? { ...card, text, correctedFrom: card.correctedFrom ?? card.text, correctedAt: latest } : card;
}

function cardsAfter(cards: readonly EventCard[], action: AddEvent): readonly EventCard[] {
  const known = cards.find((card) => answersTo(card, action.id));
  if (known === undefined) return [...cards, placed(action)];
  if (known.correctedFrom !== undefined) return cards;
  const restated = restatement(known, action);
  return restated === known ? cards : cards.map((card) => (card === known ? restated : card));
}

const answersTo = (card: EventCard, id: EntityId): boolean =>
  card.id === id || (card.correctedFrom !== undefined && entityId("event", card.text) === id);

function placed({ id, text, provenance, by }: AddEvent): EventCard {
  return { id, kind: "event", text, provenance, placedBy: by, changedBy: by };
}

function restatement(card: EventCard, { text, provenance, by }: AddEvent): EventCard {
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

export const cardsPlacedBy = ({ cards }: Board, by: ExchangeId): number => cards.filter((card) => card.placedBy === by).length;

export function boardSummary({ cards }: Board): string {
  const guesses = cards.filter((card) => card.provenance === "guess").length;
  const events = `${cards.length} ${cards.length === 1 ? "event" : "events"}`;
  return guesses === 0 ? events : `${events} · ${guesses} ${guesses === 1 ? "guess" : "guesses"}`;
}

export type CardLabel = (typeof PROVENANCE_LABEL)[Provenance] | "YOU SAID";

export const labelOf = (card: EventCard): CardLabel => (card.correctedFrom !== undefined ? "YOU SAID" : PROVENANCE_LABEL[card.provenance]);

export function struckWordsOf(board: Board, card: EventCard): string | null {
  return card.correctedFrom !== undefined && card.correctedAt === board.latest ? card.correctedFrom : null;
}

export type SentCorrection = { was: string; now: string };

export const sentCorrectionsOf = ({ cards }: Board): SentCorrection[] =>
  cards.flatMap(({ correctedFrom, text }) => (correctedFrom === undefined ? [] : [{ was: correctedFrom, now: text }]));
