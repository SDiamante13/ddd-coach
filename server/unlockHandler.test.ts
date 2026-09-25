// @vitest-environment node
import { describe, expect, it } from "vitest";
import { ACCESS_BAD_REQUEST, ACCESS_WRONG_PASSWORD } from "../src/shared/accessContract.ts";
import { createAccessPass } from "./accessPass.ts";
import type { AccessPasswordResult, SigningKeyResult } from "./config.ts";
import { TEST_SIGNING_KEY } from "./test/conversations.ts";
import { createSessionHandler, createUnlockHandler } from "./unlockHandler.ts";

const PASSWORD = "tidal-lantern-quartz";
const NOW = new Date("2026-09-25T09:00:00Z");
const testPass = createAccessPass(TEST_SIGNING_KEY, PASSWORD);

type AccessOverrides = { access?: AccessPasswordResult; signingKey?: SigningKeyResult };

function depsWith(overrides: AccessOverrides) {
  return {
    access: { ok: true, password: PASSWORD },
    signingKey: { ok: true, key: TEST_SIGNING_KEY },
    now: () => NOW,
    ...overrides,
  } as const;
}

function unlockHandler(overrides: AccessOverrides = {}) {
  return createUnlockHandler(depsWith(overrides));
}

function sessionHandler(overrides: AccessOverrides = {}) {
  return createSessionHandler(depsWith(overrides));
}

function getSession(cookie?: string): Request {
  return new Request("http://localhost/api/session", { headers: cookie === undefined ? {} : { Cookie: cookie } });
}

function postPassword(password: unknown): Request {
  return new Request("http://localhost/api/unlock", { method: "POST", body: JSON.stringify({ password }) });
}

function post(body: string): Request {
  return new Request("http://localhost/api/unlock", { method: "POST", body });
}

function attributesOf(setCookie: string): string[] {
  return setCookie.split("; ").slice(1);
}

describe("unlock handler", () => {
  it("sets a 7-day HttpOnly access cookie for the right password", async () => {
    const response = await unlockHandler()(postPassword(PASSWORD));

    expect(response.status).toBe(204);
    const setCookie = response.headers.get("Set-Cookie") ?? "";
    expect(attributesOf(setCookie)).toEqual(["Max-Age=604800", "Path=/api", "HttpOnly", "Secure", "SameSite=Lax"]);
    expect(testPass.admits(setCookie.split("; ")[0] ?? null, NOW)).toBe(true);
  });

  it.each([
    ["a wrong password", "not-the-password"],
    ["the password in another case", PASSWORD.toUpperCase()],
    ["a blank password", "   "],
  ])("refuses %s without setting a cookie", async (_case, password) => {
    const response = await unlockHandler()(postPassword(password));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: ACCESS_WRONG_PASSWORD });
    expect(response.headers.get("Set-Cookie")).toBeNull();
  });

  it("ignores spaces around the right password", async () => {
    const response = await unlockHandler()(postPassword(`  ${PASSWORD}  `));

    expect(response.status).toBe(204);
  });

  it.each([
    ["a body that is not JSON", post("password=hunter2")],
    ["a password that is not text", postPassword(42)],
    ["a body over 1 KiB", postPassword(`${PASSWORD}${" ".repeat(1024)}`)],
  ])("asks for the password on %s", async (_case, request) => {
    const response = await unlockHandler()(request);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: ACCESS_BAD_REQUEST });
  });

  it("allows only POST", async () => {
    const response = await unlockHandler()(new Request("http://localhost/api/unlock"));

    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("POST");
  });

  it.each([
    ["the access password", { access: { ok: false, error: "ACCESS_PASSWORD is not set." } } as const],
    ["the signing key", { signingKey: { ok: false, error: "COACH_SIGNING_KEY is not set." } } as const],
  ])("fails closed, naming %s, when it is missing", async (_case, overrides) => {
    const response = await unlockHandler(overrides)(postPassword(PASSWORD));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: Object.values(overrides)[0].error });
    expect(response.headers.get("Set-Cookie")).toBeNull();
  });

  it.each([
    ["the right password", PASSWORD],
    ["a wrong password", "not-the-password"],
  ])("tells caches not to store the answer to %s", async (_case, password) => {
    const response = await unlockHandler()(postPassword(password));

    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
});

describe("session handler", () => {
  it("answers 204 to a valid access cookie", async () => {
    const response = await sessionHandler()(getSession(testPass.issue(NOW).split("; ")[0]));

    expect(response.status).toBe(204);
  });

  it.each([
    ["no cookie", undefined],
    ["an expired cookie", createAccessPass(TEST_SIGNING_KEY, PASSWORD).issue(new Date("2026-09-01T00:00:00Z")).split("; ")[0]],
    ["a cookie for another password", createAccessPass(TEST_SIGNING_KEY, "old-pass").issue(NOW).split("; ")[0]],
    ["a forged cookie", `coach_access=9999999999.${"A".repeat(43)}`],
  ])("answers 401 to %s", async (_case, cookie) => {
    const response = await sessionHandler()(getSession(cookie));

    expect(response.status).toBe(401);
  });

  it.each([
    ["the access password", { access: { ok: false, error: "ACCESS_PASSWORD is not set." } } as const],
    ["the signing key", { signingKey: { ok: false, error: "COACH_SIGNING_KEY is not set." } } as const],
  ])("fails closed when %s is missing", async (_case, overrides) => {
    const response = await sessionHandler(overrides)(getSession(testPass.issue(NOW).split("; ")[0]));

    expect(response.status).toBe(500);
  });

  it.each([
    ["a valid cookie", testPass.issue(NOW).split("; ")[0]],
    ["no cookie", undefined],
  ])("tells caches not to store the answer to %s", async (_case, cookie) => {
    const response = await sessionHandler()(getSession(cookie));

    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
});
