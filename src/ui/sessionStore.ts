import { EMPTY_SESSION, type Session, SESSION_VERSION, sessionOf } from "../domain/session.ts";

const KEY = "ddd-coach.session.v1";

export function keepSession(session: Omit<Session, "savedAt">): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ version: SESSION_VERSION, ...session, savedAt: new Date().toISOString() }));
  } catch {
    return;
  }
}

export function keptSession(): Session {
  try {
    return sessionOf(JSON.parse(localStorage.getItem(KEY) ?? "null"));
  } catch {
    return EMPTY_SESSION;
  }
}
