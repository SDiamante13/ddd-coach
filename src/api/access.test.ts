import { afterEach, describe, expect, it, vi } from "vitest";
import { ACCESS_WRONG_PASSWORD } from "../shared/accessContract.ts";
import { jsonResponse } from "../test/fetchStub.ts";
import { checkAccess, COULD_NOT_CHECK, TOO_MANY_TRIES, unlock } from "./access.ts";

afterEach(() => vi.unstubAllGlobals());

function respondWith(response: Response | Promise<Response>) {
  const fetchMock = vi.fn(() => Promise.resolve(response));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("checkAccess", () => {
  it("is open when the session check answers 204", async () => {
    const fetchMock = respondWith(new Response(null, { status: 204 }));

    expect(await checkAccess()).toBe("open");
    expect(fetchMock).toHaveBeenCalledWith("/api/session");
  });

  it("is locked when the session check answers 401", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(new Response(null, { status: 401 }))));

    expect(await checkAccess()).toBe("locked");
  });

  it("is unreachable, not locked, when the session check answers 500 (#74)", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(new Response(null, { status: 500 }))));

    expect(await checkAccess()).toBe("unreachable");
  });

  it("is unreachable when the session check cannot reach the server", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new TypeError("Failed to fetch"))));

    expect(await checkAccess()).toBe("unreachable");
  });
});

describe("unlock", () => {
  it("posts the password as JSON and is ok on 204", async () => {
    const fetchMock = respondWith(new Response(null, { status: 204 }));

    expect(await unlock("tidal-lantern")).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith("/api/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "tidal-lantern" }),
    });
  });

  it("returns the server's error for a refused password", async () => {
    respondWith(jsonResponse(401, { error: ACCESS_WRONG_PASSWORD }));

    expect(await unlock("nope")).toEqual({ ok: false, error: ACCESS_WRONG_PASSWORD });
  });

  it("says there were too many tries when the platform rate-limits the unlock", async () => {
    respondWith(new Response("Too Many Requests", { status: 429 }));

    expect(await unlock("guess")).toEqual({ ok: false, error: TOO_MANY_TRIES });
  });

  it.each([
    ["answers 502 with no error", () => Promise.resolve(new Response("Bad Gateway", { status: 502 }))],
    ["is misconfigured", () => Promise.resolve(jsonResponse(500, { error: "ACCESS_PASSWORD is not set." }))],
    ["throws", () => Promise.reject(new TypeError("Failed to fetch"))],
  ])("says it could not check the password when the unlock %s", async (_case, respond) => {
    vi.stubGlobal("fetch", vi.fn(respond));

    expect(await unlock("pw")).toEqual({ ok: false, error: COULD_NOT_CHECK });
  });
});
