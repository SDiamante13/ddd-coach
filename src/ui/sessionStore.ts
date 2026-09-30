import { EMPTY_SESSION, type Session, SESSION_VERSION, sessionOf } from "../domain/session.ts";

const KEY = "ddd-coach.session.v1";

export function keepSession(session: Session): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ version: SESSION_VERSION, ...session }));
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
