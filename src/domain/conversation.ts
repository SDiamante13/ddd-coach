import type { Exchange, ExchangeId, Prompt, RepliedExchange } from "./exchange.ts";
import type { KeptGlossaryRow } from "./glossary.ts";

export type Turn = { prompt: Prompt; reply: string; signature: string };
export type Conversation = { history: readonly Turn[]; prompt: Prompt; glossary: readonly KeptGlossaryRow[] };

export function turnsOf(exchanges: readonly Exchange[]): Turn[] {
  return exchanges.filter(isReplied).map(({ prompt, reply, signature }) => ({ prompt, reply, signature }));
}

export function historyBefore(exchanges: readonly Exchange[], id: ExchangeId): Turn[] {
  const position = exchanges.findIndex((exchange) => exchange.id === id);
  return turnsOf(position === -1 ? exchanges : exchanges.slice(0, position));
}

export const LONG_PASTE_CHARS = 1_000;

export function lastLongPaste(exchanges: readonly Exchange[]): Prompt | undefined {
  return [...exchanges].reverse().find(({ prompt }) => prompt.length >= LONG_PASTE_CHARS)?.prompt;
}

function isReplied(exchange: Exchange): exchange is RepliedExchange {
  return exchange.status === "replied";
}
