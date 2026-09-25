// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createAccessPass, passwordMatches } from "./accessPass.ts";
import { TEST_SIGNING_KEY } from "./test/conversations.ts";
import { createTurnSigner } from "./turnSignature.ts";

const OTHER_KEY = "other-signing-key-0123456789abcdefghijklmn";

const PASSWORD = "tidal-lantern-quartz";
const NOW = new Date("2026-09-25T09:00:00Z");
const NINETY_DAYS_S = 7_776_000;
const EXP = Math.floor(NOW.getTime() / 1000) + NINETY_DAYS_S;
const pass = createAccessPass(TEST_SIGNING_KEY, PASSWORD);
const issued = cookieOf(pass.issue(NOW));

const [expPart = "", macPart = ""] = issued.slice("coach_access=".length).split(".");

function issuedWithUrlSafeCharacters(): string {
  const cookie = Array.from({ length: 40 }, (_, n) => cookieOf(pass.issue(new Date(NOW.getTime() + n * 1000)))).find(
    (candidate) => /[-_]/.test(candidate.split(".")[1] ?? ""),
  );
  if (!cookie) throw new Error("No MAC with - or _ among 40 cookies");
  return cookie;
}

function secondsAfterExpiry(seconds: number): Date {
  return new Date((EXP + seconds) * 1000);
}

function cookieOf(setCookie: string): string {
  return setCookie.split("; ")[0] ?? "";
}

describe("access pass", () => {
  it("issues a cookie holding the expiry ninety days out and a 43-character MAC", () => {
    expect(cookieOf(pass.issue(NOW))).toMatch(new RegExp(`^coach_access=${EXP}\\.[A-Za-z0-9_-]{43}$`));
  });

  it.each([
    ["when issued", NOW],
    ["one second before expiry", secondsAfterExpiry(-1)],
  ])("admits its own cookie %s", (_when, at) => {
    expect(pass.admits(issued, at)).toBe(true);
  });

  it.each([
    ["at expiry", secondsAfterExpiry(0)],
    ["after expiry", secondsAfterExpiry(3600)],
  ])("refuses its own cookie %s", (_when, at) => {
    expect(pass.admits(issued, at)).toBe(false);
  });

  it.each([
    ["issued under another password", cookieOf(createAccessPass(TEST_SIGNING_KEY, "other-pass").issue(NOW))],
    ["issued with another key", cookieOf(createAccessPass(OTHER_KEY, PASSWORD).issue(NOW))],
    ["with its expiry pushed out a second", `coach_access=${Number(expPart) + 1}.${macPart}`],
    ["with a leading zero on its expiry", `coach_access=0${expPart}.${macPart}`],
    ["with a 42-character MAC", `coach_access=${expPart}.${macPart.slice(0, -1)}`],
    ["with a 44-character MAC", `coach_access=${expPart}.${macPart}A`],
    ["with base64 +/ in place of -_", issuedWithUrlSafeCharacters().replace(/-/g, "+").replace(/_/g, "/")],
    ["without the dot", `coach_access=${expPart}${macPart}`],
    ["empty", ""],
    ["missing", null],
  ])("refuses a cookie %s, without throwing", (_case, cookieHeader) => {
    expect(pass.admits(cookieHeader, NOW)).toBe(false);
  });

  it("finds its cookie among others in the header", () => {
    expect(pass.admits(`a=1; ${issued}; b=2`, NOW)).toBe(true);
  });

  it("ignores a cookie whose name only ends in coach_access", () => {
    expect(pass.admits(`x${issued}`, NOW)).toBe(false);
  });

  it("refuses a turn signature over the same expiry and password as its MAC", () => {
    const turnSignature = createTurnSigner(TEST_SIGNING_KEY).sign({ prompt: expPart, reply: PASSWORD });

    expect(pass.admits(`coach_access=${expPart}.${turnSignature}`, NOW)).toBe(false);
  });
});

describe("passwordMatches", () => {
  it("matches the same password", () => {
    expect(passwordMatches(PASSWORD, PASSWORD)).toBe(true);
  });

  it.each([
    ["a different password of the same length", "tidal-lantern-quartZ"],
    ["a shorter password", "tidal"],
    ["a longer password", `${PASSWORD}-extra`],
    ["the password in another case", PASSWORD.toUpperCase()],
  ])("does not match %s, without throwing", (_case, given) => {
    expect(passwordMatches(given, PASSWORD)).toBe(false);
  });

  it("ignores spaces around the given password", () => {
    expect(passwordMatches(`  ${PASSWORD}\n`, PASSWORD)).toBe(true);
  });
});
