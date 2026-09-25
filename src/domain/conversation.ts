import type { Exchange, ExchangeId, Prompt, RepliedExchange } from "./exchange.ts";

export type Turn = { prompt: Prompt; reply: string; signature: string };
export type Conversation = { history: readonly Turn[]; prompt: Prompt };

export function turnsOf(exchanges: readonly Exchange[]): Turn[] {
  return exchanges.filter(isReplied).map(({ prompt, reply, signature }) => ({ prompt, reply, signature }));
}

export function historyBefore(exchanges: readonly Exchange[], id: ExchangeId): Turn[] {
  const position = exchanges.findIndex((exchange) => exchange.id === id);
  return turnsOf(position === -1 ? exchanges : exchanges.slice(0, position));
}

function isReplied(exchange: Exchange): exchange is RepliedExchange {
  return exchange.status === "replied";
}
