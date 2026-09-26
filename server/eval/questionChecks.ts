import { SOURCE_QUOTE } from "../../src/shared/replyLayout.ts";

const OPEN_WORD = /\b(what|which|who|whose|whom|where|how|whether)\b/i;

const PROPOSAL =
  /\b(shouldn['’]t|isn['’]t it|wouldn['’]t it|doesn['’]t it|why not|recommend|suggest|propose|instead of|better to|best to|the right (choice|call|answer))\b/i;

const RULING = /(?:^|[,:;]\s*)should\b/i;

export function asksOpenly(question: string): boolean {
  return !PROPOSAL.test(question) && !RULING.test(question) && isOpen(question);
}

function isOpen(question: string): boolean {
  const lastClause = question.split(",").at(-1) ?? "";
  return OPEN_WORD.test(question) || lastClause.includes(" or ");
}

const CONCRETE_CASE = /\b\d{3,}\b|\bCustomer [A-Z]\b|\b\d{1,2}:\d{2}\b/;

export function namesACase(question: string): boolean {
  return CONCRETE_CASE.test(question);
}

export function quotesTwoSources(afterQuestion: string[], thread: string): boolean {
  const lines = afterQuestion.filter((line) => line !== "");
  const quotes = lines.flatMap((line) => SOURCE_QUOTE.exec(line)?.[1] ?? []);
  const pasted = normalized(thread);
  const isShortVerbatim = (quote: string) => pasted.includes(normalized(quote)) && isShortQuote(quote);
  return lines.length === 2 && new Set(quotes).size === 2 && quotes.every(isShortVerbatim);
}

const isShortQuote = (quote: string): boolean => {
  const words = quote.split(/\s+/).filter(Boolean).length;
  return words >= MIN_QUOTE_WORDS && words <= MAX_QUOTE_WORDS;
};

const MIN_QUOTE_WORDS = 3;
const MAX_QUOTE_WORDS = 30;

const normalized = (text: string): string => text.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, " ");

const FORUM_CLAUSE = /^(?:at|in|on|during|before)\b/i;

export function rolesFromThread(roles: string, allowed: readonly string[] | undefined): boolean {
  if (allowed === undefined) return true;
  const named = roles.split(/,\s*|\s+and\s+/).map((role) => role.trim().toLowerCase()).filter((role) => role !== "" && !FORUM_CLAUSE.test(role));
  return named.every((role) => allowed.some((term) => role.includes(term.toLowerCase())));
}
