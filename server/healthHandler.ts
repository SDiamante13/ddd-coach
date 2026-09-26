import { field, readJson } from "../src/shared/json.ts";

export type HealthReason = "expired" | "invalid" | "credit" | null;
export type Health = { ok: boolean; upstream: number | null; reason: HealthReason };

type HealthDeps = { apiKey: string | undefined; fetch: typeof globalThis.fetch; now: () => number };

const KEY_URL = "https://openrouter.ai/api/v1/key";
const CACHE_MS = 60_000;

export function createHealthHandler({ apiKey, fetch, now }: HealthDeps) {
  let cached: { at: number; health: Health } | null = null;
  return async (request: Request): Promise<Response> => {
    if (request.method !== "GET") return new Response(null, { status: 405, headers: { Allow: "GET" } });
    if (cached === null || now() - cached.at >= CACHE_MS) {
      cached = { at: now(), health: apiKey ? await checkKey(fetch, apiKey) : NO_KEY };
    }
    return Response.json(cached.health, { status: cached.health.ok ? 200 : 503 });
  };
}

const NO_KEY: Health = { ok: false, upstream: null, reason: "invalid" };

async function checkKey(fetch: typeof globalThis.fetch, apiKey: string): Promise<Health> {
  try {
    const response = await fetch(KEY_URL, { headers: { Authorization: `Bearer ${apiKey}` } });
    return healthOf(response.status, await readJson(response));
  } catch {
    return UNREACHABLE;
  }
}

const UNREACHABLE: Health = { ok: false, upstream: null, reason: null };

export function healthOf(status: number, body: unknown): Health {
  const reason = reasonOf(status, body);
  return { ok: status === 200 && reason === null, upstream: status, reason };
}

function reasonOf(status: number, body: unknown): HealthReason {
  if (status === 401) return /expired/i.test(JSON.stringify(body)) ? "expired" : "invalid";
  if (status === 402 || (status === 200 && noLimitLeft(body))) return "credit";
  return null;
}

function noLimitLeft(body: unknown): boolean {
  const remaining = field(field(body, "data"), "limit_remaining");
  return typeof remaining === "number" && remaining <= 0;
}
