import type { EventCard } from "./board.ts";
import type { Exchange, ExchangeId } from "./exchange.ts";

export type PastedPrompt = { exchangeId: ExchangeId; text: string };
export type LineMatch = { exchangeId: ExchangeId; start: number; end: number };

const STOP_WORDS = new Set(["the", "and", "for", "with", "from", "that", "this", "its", "was", "are", "has", "have", "but", "not", "you", "our", "into", "then"]);
const MIN_SHARE = 0.5;
const MIN_SHARED = 2;

const tokensOf = (text: string): Set<string> =>
  new Set((text.toLowerCase().match(/[a-z]{3,}|\d+/g) ?? []).filter((token) => !STOP_WORDS.has(token)));

type Scored = LineMatch & { share: number };

export function closestLine(event: string, prompts: readonly PastedPrompt[]): LineMatch | null {
  const wanted = tokensOf(event);
  let best: Scored | null = null;
  for (const line of prompts.flatMap(linesOf)) {
    const shared = [...tokensOf(line.text)].filter((token) => wanted.has(token)).length;
    const share = shared / Math.max(wanted.size, 1);
    if (shared >= MIN_SHARED && share >= MIN_SHARE && share > (best?.share ?? 0)) best = { ...line.match, share };
  }
  return best && { exchangeId: best.exchangeId, start: best.start, end: best.end };
}

function linesOf({ exchangeId, text }: PastedPrompt): { text: string; match: LineMatch }[] {
  let start = 0;
  return text.split("\n").map((line) => {
    const match = { exchangeId, start, end: start + line.length };
    start += line.length + 1;
    return { text: line, match };
  });
}

export function lineOfCard(card: EventCard, exchanges: readonly Exchange[]): LineMatch | null {
  if (card.provenance === "guess") return null;
  const placing = exchanges.findIndex((exchange) => exchange.id === card.placedBy);
  const nearestFirst = exchanges.slice(0, placing + 1).reverse();
  return closestLine(card.text, nearestFirst.map(({ id, prompt }) => ({ exchangeId: id, text: prompt })));
}
