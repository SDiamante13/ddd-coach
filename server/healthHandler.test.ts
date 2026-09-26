// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import type { ConfigResult } from "./config.ts";
import { createHealthHandler } from "./healthHandler.ts";

const KEY = "sk-or-test-key";
const CONFIG: ConfigResult = { ok: true, config: { apiKey: KEY, model: "openai/test-model" } };

function upstream(status: number, body: unknown) {
  return vi.fn(async () => new Response(JSON.stringify(body), { status }));
}

function health(fetch: typeof globalThis.fetch, apiKey: string | undefined = KEY, now = () => 0) {
  return createHealthHandler({ apiKey, config: CONFIG, fetch, now });
}

const get = () => new Request("http://localhost/api/health");

describe("health handler", () => {
  it("reports ok when OpenRouter accepts the server's key", async () => {
    const response = await health(upstream(200, { data: { limit: null, usage: 1.2, limit_remaining: null } }))(get());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, status: "ok", detail: null });
  });

  it("warns of a key that expires within a week (7 days), still ok, so a monitor can alert before chat breaks", async () => {
    const today = () => Date.parse("2026-09-25T00:00:00Z");
    const keyInfo = { data: { limit_remaining: null, expires_at: "2026-10-02T00:00:00Z" } };

    const response = await health(upstream(200, keyInfo), KEY, today)(get());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, status: "key_expiring", detail: null });
  });

  it.each([
    ["more than a week away", "2026-10-02T00:00:01Z"],
    ["not set", null],
  ])("reports ok for a key whose expiry is %s", async (_case, expiresAt) => {
    const today = () => Date.parse("2026-09-25T00:00:00Z");
    const keyInfo = { data: { limit_remaining: null, expires_at: expiresAt } };

    expect(await (await health(upstream(200, keyInfo), KEY, today)(get())).json()).toEqual({ ok: true, status: "ok", detail: null });
  });

  it("checks the server's key against OpenRouter's free key endpoint", async () => {
    const fetch = upstream(200, { data: {} });

    await health(fetch)(get());

    expect(fetch).toHaveBeenCalledWith("https://openrouter.ai/api/v1/key", {
      headers: { Authorization: `Bearer ${KEY}` },
    });
  });

  it("reports an expired key as invalid, detailed as expired, with a 503 an uptime monitor can alert on", async () => {
    const response = await health(upstream(401, { error: { code: 401, message: "API key expired" } }))(get());

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ ok: false, status: "key_invalid", detail: "expired" });
  });

  it.each([
    ["an unknown key", 401, { error: { code: 401, message: "User not found." } }, { ok: false, status: "key_invalid", detail: null }],
    ["a key out of credit", 402, { error: { code: 402, message: "Insufficient credits" } }, { ok: false, status: "key_invalid", detail: "credit" }],
    ["a key with no limit left", 200, { data: { limit: 5, usage: 5, limit_remaining: 0 } }, { ok: false, status: "key_invalid", detail: "credit" }],
    ["an OpenRouter outage as unreachable", 500, { error: { code: 500, message: "Internal error" } }, { ok: false, status: "provider_unreachable", detail: null }],
  ])("reports %s", async (_case, status, body, expected) => {
    expect(await (await health(upstream(status, body))(get())).json()).toEqual(expected);
  });

  it("reports a server with no key as invalid without calling OpenRouter", async () => {
    const fetch = upstream(200, {});

    const response = await createHealthHandler({ apiKey: undefined, config: CONFIG, fetch, now: () => 0 })(get());

    expect(await response.json()).toEqual({ ok: false, status: "key_invalid", detail: "missing" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("reports a config the chat would refuse as config_invalid, without values and without calling OpenRouter", async () => {
    const fetch = upstream(200, { data: {} });
    const config: ConfigResult = { ok: false, error: "OPENROUTER_MODEL must be an openai/ model, the provider the data notice names (coachProvider)." };

    const response = await createHealthHandler({ apiKey: KEY, config, fetch, now: () => 0 })(get());

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ ok: false, status: "config_invalid", detail: null });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("reports an OpenRouter it can't reach as unreachable", async () => {
    const unreachable = vi.fn(async () => {
      throw new TypeError("fetch failed");
    });

    expect(await (await health(unreachable)(get())).json()).toEqual({ ok: false, status: "provider_unreachable", detail: null });
  });

  it("asks OpenRouter at most once a minute, so it can't be used as a proxy", async () => {
    let clock = 0;
    const fetch = upstream(200, { data: {} });
    const handle = createHealthHandler({ apiKey: KEY, config: CONFIG, fetch, now: () => clock });

    await handle(get());
    clock = 59_999;
    await handle(get());
    expect(fetch).toHaveBeenCalledTimes(1);

    clock = 60_000;
    await handle(get());
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("answers only GET", async () => {
    const fetch = upstream(200, { data: {} });

    const response = await health(fetch)(new Request("http://localhost/api/health", { method: "POST", body: "{}" }));

    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("GET");
    expect(fetch).not.toHaveBeenCalled();
  });
});
