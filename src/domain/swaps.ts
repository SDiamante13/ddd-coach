export type Swap = { readonly from: string; readonly to: string };
export type SwapList = readonly Swap[];
export type Span = { readonly start: number; readonly end: number };
export type SwappedText = { readonly text: string; readonly spans: readonly Span[] };

export const MAX_SWAPS = 50;
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

export type SwapField = "from" | "to";
export type SwapRefusal = { readonly ok: false; readonly field: SwapField; readonly reason: string };
export type SwapResult = { readonly ok: true; readonly list: SwapList } | SwapRefusal;

export function addSwap(list: SwapList, from: string, to: string): SwapResult {
  const swap = { from: from.trim(), to: to.trim() };
  const others = removeSwap(list, swap.from);
  return refusalOf(others, swap) ?? { ok: true, list: [...others, swap] };
}

function refusalOf(others: SwapList, { from, to }: Swap): SwapRefusal | null {
  if (from === "") return refuse("from", "Enter a word to replace.");
  if (to === "") return refuse("to", "Enter a placeholder.");
  if (from.length < 2) return refuse("from", "Use at least 2 characters, so common letters aren't swapped.");
  if (sameWord(from, to)) return refuse("to", "Pick a placeholder that differs from the word.");
  if (others.length >= MAX_SWAPS) return refuse("from", `You can keep up to ${MAX_SWAPS} swaps. Remove one to add another.`);
  return null;
}

const sameWord = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: "accent" }) === 0;

const refuse = (field: SwapField, reason: string): SwapRefusal => ({ ok: false, field, reason });

export function swapListOf(candidates: readonly Swap[]): SwapList {
  return candidates.reduce<SwapList>((list, { from, to }) => {
    const result = addSwap(list, from, to);
    return result.ok ? result.list : list;
  }, []);
}

export function removeSwap(list: SwapList, from: string): SwapList {
  return list.filter((swap) => !sameWord(swap.from, from));
}

export type PlaceholderClash = "in-thread" | "role-name";

const TEAM_AND_ROLE_NAMES = [
  "Ops", "Operations", "Finance", "Billing", "Accounting", "Dispatch", "Dispatcher", "Sales", "Tracking",
  "Claims", "Pricing", "Procurement", "Compliance", "Customer Service", "Support", "Warehouse", "Legal",
  "Day desk", "Night desk", "Day shift", "Night shift", "Account manager", "Carrier relations", "Driver",
  "Broker", "Shipper", "Manager", "Team lead",
];

export function placeholderClash(to: string, thread: string): PlaceholderClash | null {
  const placeholder = to.trim();
  if (placeholder === "") return null;
  if (anyOf([placeholder]).test(thread)) return "in-thread";
  return TEAM_AND_ROLE_NAMES.some((name) => sameWord(name, placeholder)) ? "role-name" : null;
}
