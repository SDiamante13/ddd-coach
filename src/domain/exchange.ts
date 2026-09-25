export type Prompt = string & { readonly __brand: "Prompt" };
export type ExchangeId = string & { readonly __brand: "ExchangeId" };

export type PendingExchange = { id: ExchangeId; prompt: Prompt; status: "pending" };
export type RepliedExchange = { id: ExchangeId; prompt: Prompt; status: "replied"; reply: string };
export type FailedExchange = { id: ExchangeId; prompt: Prompt; status: "failed"; error: string };
export type Exchange = PendingExchange | RepliedExchange | FailedExchange;

export type AskResult = { ok: true; reply: string } | { ok: false; error: string };

export function submit(id: ExchangeId, prompt: Prompt): PendingExchange {
  return { id, prompt, status: "pending" };
}

export function fail(exchange: PendingExchange, error: string): FailedExchange {
  return { ...exchange, status: "failed", error };
}

export function reply(exchange: PendingExchange, text: string): RepliedExchange {
  return { ...exchange, status: "replied", reply: text };
}

export function retry(exchange: Exchange): Exchange {
  if (exchange.status !== "failed") return exchange;
  return submit(exchange.id, exchange.prompt);
}

export function isBusy(exchanges: readonly Exchange[]): boolean {
  return exchanges.some((exchange) => exchange.status === "pending");
}

export function parsePrompt(text: string): Prompt | null {
  const trimmed = text.trim();
  return trimmed === "" ? null : (trimmed as Prompt);
}
