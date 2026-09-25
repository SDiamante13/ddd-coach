import { ACCESS_MAX_AGE_S } from "../../src/shared/accessContract.ts";

export const TEST_ACCESS_PASSWORD = "tidal-lantern-quartz";
export const OTHER_SIGNING_KEY = "other-signing-key-0123456789abcdefghijklmn";
export const NOW = new Date("2026-09-25T09:00:00Z");
export const JUST_EXPIRED_ISSUE = new Date(NOW.getTime() - ACCESS_MAX_AGE_S * 1000);

export function cookieOf(setCookie: string): string {
  return setCookie.split("; ")[0] ?? "";
}
