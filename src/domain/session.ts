import type { VisitorAction } from "./boardFromReplies.ts";
import { type Exchange, fail, parsePrompt, type Remedy } from "./exchange.ts";
import { field, stringField } from "../shared/json.ts";

export const SESSION_VERSION = 1;

export type Viewport = { x: number; y: number; zoom: number };

export type Session = {
  exchanges: readonly Exchange[];
  visitorActions: readonly VisitorAction[];
  savedAt: string | null;
  viewport: Viewport | null;
  followingCoach: boolean;
  settleBy: SettleBy | null;
};

export type SettleBy = { forum: string; on: string };

export const FOLLOW_COACH_AT_START = true;

export const EMPTY_SESSION: Session = { exchanges: [], visitorActions: [], savedAt: null, viewport: null, followingCoach: FOLLOW_COACH_AT_START, settleBy: null };

export const BOARD_ZOOM = { min: 0.5, max: 1.5 } as const;

const RELOADED_BEFORE_REPLY = "The page reloaded before the coach answered.";

export function sessionOf(stored: unknown): Session {
  const exchanges = field(stored, "exchanges");
  const visitorActions = field(stored, "visitorActions");
  const valid =
    field(stored, "version") === SESSION_VERSION && everyIs(exchanges, isExchange) && everyIs(visitorActions, isVisitorAction);
  return valid ? { exchanges: exchanges.map(unanswered), visitorActions, savedAt: savedAtOf(stored), viewport: viewportOf(field(stored, "viewport")), followingCoach: followingOf(stored), settleBy: settleByOf(field(stored, "settleBy")) } : EMPTY_SESSION;
}

function settleByOf(stored: unknown): SettleBy | null {
  const forum = stringField(stored, "forum")?.trim();
  const on = stringField(stored, "on");
  return forum && on !== undefined && /^\d{4}-\d{2}-\d{2}$/.test(on) ? { forum, on } : null;
}

function followingOf(stored: unknown): boolean {
  const kept = field(stored, "followingCoach");
  if (typeof kept === "boolean") return kept;
  const touched = (field(stored, "visitorActions") as unknown[]).length > 0 || viewportOf(field(stored, "viewport")) !== null;
  return touched ? false : FOLLOW_COACH_AT_START;
}

function viewportOf(stored: unknown): Viewport | null {
  const [x, y, zoom] = ["x", "y", "zoom"].map((key) => field(stored, key));
  const numbers = [x, y, zoom].every((value) => typeof value === "number" && Number.isFinite(value));
  return numbers && (zoom as number) >= BOARD_ZOOM.min && (zoom as number) <= BOARD_ZOOM.max ? { x: x as number, y: y as number, zoom: zoom as number } : null;
}

function savedAtOf(stored: unknown): string | null {
  const savedAt = stringField(stored, "savedAt");
  return savedAt !== undefined && !Number.isNaN(Date.parse(savedAt)) ? savedAt : null;
}

const unanswered = (exchange: Exchange): Exchange =>
  exchange.status === "pending" ? fail(exchange, { error: RELOADED_BEFORE_REPLY, remedy: "retry" }) : exchange;

function everyIs<T>(value: unknown, guard: (item: unknown) => item is T): value is T[] {
  return Array.isArray(value) && value.every(guard);
}

const REMEDIES: readonly unknown[] = ["retry", "copy", "startOver", "unlock"] satisfies Remedy[];

function isExchange(value: unknown): value is Exchange {
  const prompt = stringField(value, "prompt");
  if (!stringField(value, "id") || prompt === undefined || parsePrompt(prompt) !== prompt) return false;
  switch (field(value, "status")) {
    case "pending":
      return true;
    case "replied":
      return stringField(value, "reply") !== undefined && stringField(value, "signature") !== undefined;
    case "failed":
      return stringField(value, "error") !== undefined && REMEDIES.includes(field(value, "remedy"));
    default:
      return false;
  }
}

const VERDICTS: readonly unknown[] = ["holds", "wrong", "unknown"];
const DAY = /^\d{4}-\d{2}-\d{2}$/;

function isVisitorAction(value: unknown): value is VisitorAction {
  const texts = (...keys: string[]) => keys.every((key) => Boolean(stringField(value, key)));
  switch (field(value, "kind")) {
    case "correct":
      return texts("id", "text", "after");
    case "connect":
      return texts("from", "to", "after");
    case "check":
      return texts("row", "after") && VERDICTS.includes(field(value, "verdict")) && DAY.test(stringField(value, "at") ?? "") && ["undefined", "string"].includes(typeof field(value, "where"));
    case "move":
      return texts("id", "after") && [field(value, "x"), field(value, "y")].every((n) => typeof n === "number" && Number.isFinite(n));
    default:
      return false;
  }
}
