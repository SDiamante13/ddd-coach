import type { Exchange } from "../domain/exchange.ts";

export function conversationText(exchanges: readonly Exchange[]): string {
  return exchanges.map(turnText).join("\n\n");
}

function turnText(exchange: Exchange): string {
  const you = `You: ${exchange.prompt}`;
  return exchange.status === "replied" ? `${you}\nCoach: ${exchange.reply}` : you;
}
