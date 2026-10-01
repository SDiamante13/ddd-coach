import { type AddEvent, applyAction, type Board, type BoardAction, emptyBoard, keptWordingCount, type Provenance } from "./board.ts";
import { type EntityId, entityId } from "./entityId.ts";
import type { Exchange, ExchangeId } from "./exchange.ts";
import type { ReplyCounts } from "./replyChip.ts";
import { type Claim, parseReply, type Source } from "./replyBlocks.ts";

const PROVENANCE_OF: Record<Source, Provenance> = { "From thread": "thread", Guess: "guess" };

export type Correction = { kind: "correct"; id: EntityId; text: string; after: ExchangeId };
export type Connection = { kind: "connect"; from: EntityId; to: EntityId; after: ExchangeId };
export type Move = { kind: "move"; id: EntityId; x: number; y: number; after: ExchangeId };
export type Verdict = "holds" | "wrong" | "unknown";
export type Check = { kind: "check"; row: EntityId; verdict: Verdict; where?: string; at: string; after: ExchangeId };
export type ClearCheck = { kind: "clearCheck"; row: EntityId; after: ExchangeId };
export type VisitorAction = Correction | Connection | Move | Check | ClearCheck;

export function boardOf(exchanges: readonly Exchange[], edits: readonly VisitorAction[] = []): Board {
  return exchanges.flatMap((exchange) => actionsOf(exchange, edits)).reduce(applyAction, emptyBoard);
}

function actionsOf(exchange: Exchange, edits: readonly VisitorAction[]): BoardAction[] {
  if (exchange.status !== "replied") return [];
  return [...eventActionsOf(exchange.reply, exchange.id), ...editsAfter(exchange.id, edits)];
}

export function replyCountsOf(exchanges: readonly Exchange[], edits: readonly VisitorAction[] = []): Map<ExchangeId, ReplyCounts> {
  const counts = new Map<ExchangeId, ReplyCounts>();
  exchanges.reduce((board, exchange) => {
    if (exchange.status !== "replied") return board;
    const events = eventActionsOf(exchange.reply, exchange.id);
    const afterEvents = events.reduce(applyAction, board);
    counts.set(exchange.id, countsOf(afterEvents, exchange.id, events));
    return editsAfter(exchange.id, edits).reduce(applyAction, afterEvents);
  }, emptyBoard);
  return counts;
}

function countsOf(board: Board, by: ExchangeId, events: readonly AddEvent[]): ReplyCounts {
  const added = board.cards.filter((card) => card.placedBy === by).length;
  const updated = board.cards.filter((card) => card.changedBy === by && card.placedBy !== by).length;
  const ids = [...new Set(events.map((event) => event.id))];
  return { added, updated, already: Math.max(ids.length - added - updated, 0), kept: keptWordingCount(board, ids) };
}

const editsAfter = (by: ExchangeId, edits: readonly VisitorAction[]): BoardAction[] =>
  edits.filter((edit): edit is Correction | Connection => edit.after === by && (edit.kind === "correct" || edit.kind === "connect")).map(boardActionOf);

const boardActionOf = (edit: Correction | Connection): BoardAction =>
  edit.kind === "correct" ? { type: "correctCard", id: edit.id, text: edit.text } : { type: "connectCards", from: edit.from, to: edit.to };

export function eventActionsOf(reply: string, by: ExchangeId): AddEvent[] {
  return parseReply(reply)
    .flatMap((block) => (block.kind === "events" ? block.items : []))
    .map((claim) => addEventOf(claim, by));
}

function addEventOf({ source, text }: Claim, by: ExchangeId): AddEvent {
  return { type: "addEvent", id: entityId("event", text), text, provenance: PROVENANCE_OF[source], by };
}
