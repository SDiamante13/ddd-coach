export type Prompt = string & { readonly __brand: "Prompt" };
export type ExchangeId = string & { readonly __brand: "ExchangeId" };

export type PendingExchange = { id: ExchangeId; prompt: Prompt; status: "pending" };
export type RepliedExchange = { id: ExchangeId; prompt: Prompt; status: "replied"; reply: string; signature: string };
export type Failure = { error: string; retryable: boolean };
export type FailedExchange = { id: ExchangeId; prompt: Prompt; status: "failed" } & Failure;
export type Exchange = PendingExchange | RepliedExchange | FailedExchange;

export type AskResult = { ok: true; reply: string; signature: string } | ({ ok: false } & Failure);

export function submit(id: ExchangeId, prompt: Prompt): PendingExchange {
  return { id, prompt, status: "pending" };
}

export function fail(exchange: PendingExchange, { error, retryable }: Failure): FailedExchange {
  return { ...exchange, status: "failed", error, retryable };
}

export function reply(exchange: PendingExchange, text: string, signature: string): RepliedExchange {
  return { ...exchange, status: "replied", reply: text, signature };
}

export function retry(exchange: Exchange): Exchange {
  if (exchange.status !== "failed") return exchange;
  return submit(exchange.id, exchange.prompt);
}

export function settle(exchanges: readonly Exchange[], id: ExchangeId, result: AskResult): Exchange[] {
  return exchanges.map((exchange) => {
    if (exchange.id !== id || exchange.status !== "pending") return exchange;
    return result.ok ? reply(exchange, result.reply, result.signature) : fail(exchange, result);
  });
}

export function isBusy(exchanges: readonly Exchange[]): boolean {
  return exchanges.some((exchange) => exchange.status === "pending");
}

export function canRetry(exchanges: readonly Exchange[], id: ExchangeId): boolean {
  const target = exchanges.find((exchange) => exchange.id === id);
  return target?.status === "failed" && target.retryable && !isBusy(exchanges);
}

export function parsePrompt(text: string): Prompt | null {
  const trimmed = text.trim();
  return trimmed === "" ? null : (trimmed as Prompt);
}

export function messageLength(text: string): number {
  return text.trim().length;
}

export function isRefused(outcome: Exchange | AskResult): boolean {
  return "retryable" in outcome && !outcome.retryable;
}
