import type { Exchange } from "../domain/exchange.ts";

type Shown = (text: string) => string;

const asSent: Shown = (text) => text;

export function conversationText(exchanges: readonly Exchange[], shown: Shown = asSent): string {
  return exchanges.map((exchange) => turnText(exchange, shown)).join("\n\n");
}

function turnText(exchange: Exchange, shown: Shown): string {
  const you = `You: ${shown(exchange.prompt)}`;
  return exchange.status === "replied" ? `${you}\nCoach: ${shown(exchange.reply)}` : you;
}
