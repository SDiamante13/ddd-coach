import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { sameText } from "./constantTime.ts";

export type AccessPass = { issue(now: Date): string; admits(cookieHeader: string | null, now: Date): boolean };

export const ACCESS_COOKIE = "coach_access";
export const ACCESS_MAX_AGE_S = 604_800;
const ACCESS_TAG = "ddd-coach/access/v1";
const COOKIE_ATTRIBUTES = `Max-Age=${ACCESS_MAX_AGE_S}; Path=/api; HttpOnly; Secure; SameSite=Lax`;
const PASS_FORMAT = /^(\d{1,12})\.([A-Za-z0-9_-]{43})$/;

export function createAccessPass(key: string, password: string): AccessPass {
  const macOf = (exp: string): string =>
    createHmac("sha256", key).update(JSON.stringify([ACCESS_TAG, exp, password])).digest("base64url");
  const issue = (now: Date): string => {
    const exp = String(secondsOf(now) + ACCESS_MAX_AGE_S);
    return `${ACCESS_COOKIE}=${exp}.${macOf(exp)}; ${COOKIE_ATTRIBUTES}`;
  };
  const admits = (cookieHeader: string | null, now: Date): boolean => {
    const [, exp = "", mac = ""] = PASS_FORMAT.exec(cookieValue(cookieHeader, ACCESS_COOKIE) ?? "") ?? [];
    return Number(exp) > secondsOf(now) && sameText(mac, macOf(exp));
  };
  return { issue, admits };
}

function secondsOf(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

export function cookieValue(cookieHeader: string | null, name: string): string | undefined {
  const prefix = `${name}=`;
  return cookieHeader
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(prefix))
    ?.slice(prefix.length);
}

export function passwordMatches(given: string, expected: string): boolean {
  return timingSafeEqual(sha256Of(given.trim()), sha256Of(expected));
}

function sha256Of(text: string): Buffer {
  return createHash("sha256").update(text).digest();
}
