import { readJson, stringField } from "../shared/json.ts";

export type Access = "open" | "locked";
export type UnlockResult = { ok: true } | { ok: false; error: string };

export const TOO_MANY_TRIES = "Too many tries from this network. Wait a minute, then try again.";
export const COULD_NOT_CHECK = "Could not check the password. Try again.";

const NO_CONTENT = 204;
const TOO_MANY_REQUESTS = 429;
const SERVER_ERROR = 500;
const UNCHECKED: UnlockResult = { ok: false, error: COULD_NOT_CHECK };

export async function checkAccess(): Promise<Access> {
  try {
    const response = await fetch("/api/session");
    return response.status === NO_CONTENT ? "open" : "locked";
  } catch {
    return "locked";
  }
}

export async function unlock(password: string): Promise<UnlockResult> {
  try {
    return await unlockResultOf(await postPassword(password));
  } catch {
    return UNCHECKED;
  }
}

function postPassword(password: string): Promise<Response> {
  return fetch("/api/unlock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
}

async function unlockResultOf(response: Response): Promise<UnlockResult> {
  if (response.status === NO_CONTENT) return { ok: true };
  if (response.status === TOO_MANY_REQUESTS) return { ok: false, error: TOO_MANY_TRIES };
  if (response.status >= SERVER_ERROR) return UNCHECKED;
  const error = stringField(await readJson(response), "error");
  return error === undefined ? UNCHECKED : { ok: false, error };
}
