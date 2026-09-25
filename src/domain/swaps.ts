export type Swap = { readonly from: string; readonly to: string };
export type SwapList = readonly Swap[];
export type Span = { readonly start: number; readonly end: number };
export type SwappedText = { readonly text: string; readonly spans: readonly Span[] };

const WORD_CHAR = "[\\p{L}\\p{N}_]";

export function applySwaps(list: SwapList, text: string): SwappedText {
  if (list.length === 0) return { text, spans: [] };
  const ordered = longestFirst(list);
  const spans: Span[] = [];
  let swapped = "";
  let copiedUpTo = 0;
  for (const match of text.matchAll(anyOf(ordered.map((swap) => swap.from)))) {
    const placeholder = placeholderOf(ordered, match);
    swapped += text.slice(copiedUpTo, match.index);
    spans.push({ start: swapped.length, end: swapped.length + placeholder.length });
    swapped += placeholder;
    copiedUpTo = match.index + match[0].length;
  }
  return { text: swapped + text.slice(copiedUpTo), spans };
}

function placeholderOf(ordered: SwapList, match: RegExpExecArray): string {
  const matched = match.slice(1).findIndex((group) => group !== undefined);
  return ordered[matched]?.to ?? match[0];
}

function anyOf(words: readonly string[]): RegExp {
  const alternatives = words.map((word) => `(${escaped(word)})`).join("|");
  return new RegExp(`(?<!${WORD_CHAR})(?:${alternatives})(?!${WORD_CHAR})`, "giu");
}

function escaped(word: string): string {
  return word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function longestFirst(list: SwapList): SwapList {
  return [...list].sort((a, b) => b.from.length - a.from.length);
}

export type SwapResult = { readonly ok: true; readonly list: SwapList } | { readonly ok: false; readonly reason: string };

export function addSwap(list: SwapList, from: string, to: string): SwapResult {
  return { ok: true, list: [...list, { from, to }] };
}

export function removeSwap(list: SwapList, from: string): SwapList {
  return list.filter((swap) => swap.from !== from);
}
