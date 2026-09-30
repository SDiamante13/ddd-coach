import type { VisitorAction } from "./boardFromReplies.ts";
import { type Exchange, parsePrompt, type Remedy } from "./exchange.ts";
import { field, stringField } from "../shared/json.ts";

export const SESSION_VERSION = 1;

export type Session = { exchanges: readonly Exchange[]; visitorActions: readonly VisitorAction[] };

export const EMPTY_SESSION: Session = { exchanges: [], visitorActions: [] };

export function sessionOf(stored: unknown): Session {
  const exchanges = field(stored, "exchanges");
  const visitorActions = field(stored, "visitorActions");
  const valid =
    field(stored, "version") === SESSION_VERSION && everyIs(exchanges, isExchange) && everyIs(visitorActions, isVisitorAction);
  return valid ? { exchanges, visitorActions } : EMPTY_SESSION;
}

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

function isVisitorAction(value: unknown): value is VisitorAction {
  const texts = (...keys: string[]) => keys.every((key) => Boolean(stringField(value, key)));
  switch (field(value, "kind")) {
    case "correct":
      return texts("id", "text", "after");
    case "connect":
      return texts("from", "to", "after");
    default:
      return false;
  }
}
