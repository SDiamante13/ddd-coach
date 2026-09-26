import { field, readJson } from "../src/shared/json.ts";
import type { ConfigResult } from "./config.ts";

export type HealthStatus = "ok" | "key_invalid" | "key_expiring" | "provider_unreachable" | "config_invalid";
export type HealthDetail = "expired" | "credit" | "missing" | null;
export type Health = { ok: boolean; status: HealthStatus; detail: HealthDetail };

type HealthDeps = { apiKey: string | undefined; config: ConfigResult; fetch: typeof globalThis.fetch; now: () => number };

const KEY_URL = "https://openrouter.ai/api/v1/key";
const CACHE_MS = 60_000;
const WARN_BEFORE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

export function createHealthHandler(deps: HealthDeps) {
  const { now } = deps;
  let cached: { at: number; health: Health } | null = null;
  return async (request: Request): Promise<Response> => {
    if (request.method !== "GET") return new Response(null, { status: 405, headers: { Allow: "GET" } });
    if (cached === null || now() - cached.at >= CACHE_MS) {
      cached = { at: now(), health: await currentHealth(deps) };
    }
    return Response.json(cached.health, { status: cached.health.ok ? 200 : 503 });
  };
}

const NO_KEY: Health = { ok: false, status: "key_invalid", detail: "missing" };
const CONFIG_INVALID: Health = { ok: false, status: "config_invalid", detail: null };

async function currentHealth({ apiKey, config, fetch, now }: HealthDeps): Promise<Health> {
  if (!apiKey) return NO_KEY;
  if (!config.ok) return CONFIG_INVALID;
  return checkKey(fetch, apiKey, now());
}

async function checkKey(fetch: typeof globalThis.fetch, apiKey: string, now: number): Promise<Health> {
  try {
    const response = await fetch(KEY_URL, { headers: { Authorization: `Bearer ${apiKey}` } });
    return healthOf(response.status, await readJson(response), now);
  } catch {
    return UNREACHABLE;
  }
}

const OK: Health = { ok: true, status: "ok", detail: null };
const EXPIRING: Health = { ok: true, status: "key_expiring", detail: null };
const UNREACHABLE: Health = { ok: false, status: "provider_unreachable", detail: null };
const invalid = (detail: HealthDetail): Health => ({ ok: false, status: "key_invalid", detail });

function healthOf(status: number, body: unknown, now: number): Health {
  if (status === 401) return invalid(/expired/i.test(JSON.stringify(body)) ? "expired" : null);
  if (status === 402 || (status === 200 && noLimitLeft(body))) return invalid("credit");
  if (status !== 200) return UNREACHABLE;
  return expiresWithinAWeek(body, now) ? EXPIRING : OK;
}

function expiresWithinAWeek(body: unknown, now: number): boolean {
  const expiresAt = field(field(body, "data"), "expires_at");
  return typeof expiresAt === "string" && Date.parse(expiresAt) - now <= WARN_BEFORE_EXPIRY_MS;
}

function noLimitLeft(body: unknown): boolean {
  const remaining = field(field(body, "data"), "limit_remaining");
  return typeof remaining === "number" && remaining <= 0;
}
