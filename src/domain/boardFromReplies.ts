import { applyAction, type Board, type BoardAction, emptyBoard, type Provenance } from "./board.ts";
import { entityId } from "./entityId.ts";
import type { Exchange, ExchangeId } from "./exchange.ts";
import { type Claim, parseReply, type Source } from "./replyBlocks.ts";

const PROVENANCE_OF: Record<Source, Provenance> = { "From thread": "thread", Guess: "guess" };

export function boardOf(exchanges: readonly Exchange[]): Board {
  return exchanges
    .flatMap((exchange) => (exchange.status === "replied" ? eventActionsOf(exchange.reply, exchange.id) : []))
    .reduce(applyAction, emptyBoard);
}

export function eventActionsOf(reply: string, by: ExchangeId): BoardAction[] {
  return parseReply(reply)
    .flatMap((block) => (block.kind === "events" ? block.items : []))
    .map((claim) => addEventOf(claim, by));
}

function addEventOf({ source, text }: Claim, by: ExchangeId): BoardAction {
  return { type: "addEvent", id: entityId("event", text), text, provenance: PROVENANCE_OF[source], by };
}
