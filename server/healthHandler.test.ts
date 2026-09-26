// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { createHealthHandler } from "./healthHandler.ts";

const KEY = "sk-or-test-key";

function upstream(status: number, body: unknown) {
  return vi.fn(async () => new Response(JSON.stringify(body), { status }));
}

function health(fetch: typeof globalThis.fetch, apiKey: string | undefined = KEY, now = () => 0) {
  return createHealthHandler({ apiKey, fetch, now });
}

const get = () => new Request("http://localhost/api/health");

describe("health handler", () => {
  it("reports ok when OpenRouter accepts the server's key", async () => {
    const response = await health(upstream(200, { data: { limit: null, usage: 1.2, limit_remaining: null } }))(get());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, upstream: 200, reason: null });
  });

  it("checks the server's key against OpenRouter's free key endpoint", async () => {
    const fetch = upstream(200, { data: {} });

    await health(fetch)(get());

    expect(fetch).toHaveBeenCalledWith("https://openrouter.ai/api/v1/key", {
      headers: { Authorization: `Bearer ${KEY}` },
    });
  });

  it("reports an expired key as expired, as a 503 an uptime monitor can alert on", async () => {
    const response = await health(upstream(401, { error: { code: 401, message: "API key expired" } }))(get());

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ ok: false, upstream: 401, reason: "expired" });
  });

  it.each([
    ["an unknown key", 401, { error: { code: 401, message: "User not found." } }, { ok: false, upstream: 401, reason: "invalid" }],
    ["a key out of credit", 402, { error: { code: 402, message: "Insufficient credits" } }, { ok: false, upstream: 402, reason: "credit" }],
    ["a key with no limit left", 200, { data: { limit: 5, usage: 5, limit_remaining: 0 } }, { ok: false, upstream: 200, reason: "credit" }],
    ["an OpenRouter outage", 500, { error: { code: 500, message: "Internal error" } }, { ok: false, upstream: 500, reason: null }],
  ])("reports %s", async (_case, status, body, expected) => {
    expect(await (await health(upstream(status, body))(get())).json()).toEqual(expected);
  });

  it("reports a server with no key as invalid without calling OpenRouter", async () => {
    const fetch = upstream(200, {});

    const response = await createHealthHandler({ apiKey: undefined, fetch, now: () => 0 })(get());

    expect(await response.json()).toEqual({ ok: false, upstream: null, reason: "invalid" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("reports an unreachable OpenRouter without a status", async () => {
    const unreachable = vi.fn(async () => {
      throw new TypeError("fetch failed");
    });

    expect(await (await health(unreachable)(get())).json()).toEqual({ ok: false, upstream: null, reason: null });
  });

  it("asks OpenRouter at most once a minute, so it can't be used as a proxy", async () => {
    let clock = 0;
    const fetch = upstream(200, { data: {} });
    const handle = createHealthHandler({ apiKey: KEY, fetch, now: () => clock });

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
