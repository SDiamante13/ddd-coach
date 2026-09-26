import { applyAction, type Board, type BoardAction, emptyBoard, type Provenance } from "./board.ts";
import { type EntityId, entityId } from "./entityId.ts";
import type { Exchange, ExchangeId } from "./exchange.ts";
import type { ReplyCounts } from "./replyChip.ts";
import { type Claim, parseReply, type Source } from "./replyBlocks.ts";

const PROVENANCE_OF: Record<Source, Provenance> = { "From thread": "thread", Guess: "guess" };

export type Correction = { id: EntityId; text: string; after: ExchangeId };

export function boardOf(exchanges: readonly Exchange[], corrections: readonly Correction[] = []): Board {
  return exchanges.flatMap((exchange) => actionsOf(exchange, corrections)).reduce(applyAction, emptyBoard);
}

function actionsOf(exchange: Exchange, corrections: readonly Correction[]): BoardAction[] {
  if (exchange.status !== "replied") return [];
  return [...eventActionsOf(exchange.reply, exchange.id), ...correctionsAfter(exchange.id, corrections)];
}

export function replyCountsOf(exchanges: readonly Exchange[], corrections: readonly Correction[] = []): Map<ExchangeId, ReplyCounts> {
  const counts = new Map<ExchangeId, ReplyCounts>();
  exchanges.reduce((board, exchange) => {
    if (exchange.status !== "replied") return board;
    const events = eventActionsOf(exchange.reply, exchange.id);
    const after = [...events, ...correctionsAfter(exchange.id, corrections)].reduce(applyAction, board);
    counts.set(exchange.id, countsOf(after, exchange.id, events));
    return after;
  }, emptyBoard);
  return counts;
}

function countsOf({ cards }: Board, by: ExchangeId, events: readonly BoardAction[]): ReplyCounts {
  const added = cards.filter((card) => card.placedBy === by).length;
  const updated = cards.filter((card) => card.changedBy === by && card.placedBy !== by).length;
  const distinct = new Set(events.map((event) => event.id)).size;
  return { added, updated, already: Math.max(distinct - added - updated, 0) };
}

const correctionsAfter = (by: ExchangeId, corrections: readonly Correction[]): BoardAction[] =>
  corrections.filter(({ after }) => after === by).map(({ id, text }) => ({ type: "correctCard", id, text }));

export function eventActionsOf(reply: string, by: ExchangeId): BoardAction[] {
  return parseReply(reply)
    .flatMap((block) => (block.kind === "events" ? block.items : []))
    .map((claim) => addEventOf(claim, by));
}

function addEventOf({ source, text }: Claim, by: ExchangeId): BoardAction {
  return { type: "addEvent", id: entityId("event", text), text, provenance: PROVENANCE_OF[source], by };
}
