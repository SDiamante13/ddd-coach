import { ACCESS_BAD_REQUEST, ACCESS_WRONG_PASSWORD } from "../src/shared/accessContract.ts";
import { stringField } from "../src/shared/json.ts";
import { createAccessPass, passwordMatches, type AccessPass } from "./accessPass.ts";
import type { AccessPasswordResult, SigningKeyResult } from "./config.ts";
import { readJsonWithin } from "./requestBody.ts";

export type AccessDeps = { access: AccessPasswordResult; signingKey: SigningKeyResult; now: () => Date };
type Gatekeeper = { ok: true; pass: AccessPass; password: string; signingKey: string } | { ok: false; error: string };

const MAX_UNLOCK_BYTES = 1024;
const NO_STORE = { "Cache-Control": "no-store" };

export function createUnlockHandler(deps: AccessDeps) {
  return async (request: Request): Promise<Response> => {
    if (request.method !== "POST") return failed(405, "Use POST.", { Allow: "POST" });
    const gatekeeper = gatekeeperOf(deps);
    if (!gatekeeper.ok) return failed(500, gatekeeper.error);
    const given = await passwordIn(request);
    if (given === undefined) return failed(400, ACCESS_BAD_REQUEST);
    if (!passwordMatches(given, gatekeeper.password)) return failed(401, ACCESS_WRONG_PASSWORD);
    return noContent({ "Set-Cookie": gatekeeper.pass.issue(deps.now()) });
  };
}

export function createSessionHandler(deps: AccessDeps) {
  return async (request: Request): Promise<Response> => {
    const gatekeeper = gatekeeperOf(deps);
    if (!gatekeeper.ok) return failed(500, gatekeeper.error);
    const admitted = gatekeeper.pass.admits(request.headers.get("Cookie"), deps.now());
    return admitted ? noContent() : new Response(null, { status: 401, headers: NO_STORE });
  };
}

export function gatekeeperOf({ access, signingKey }: Omit<AccessDeps, "now">): Gatekeeper {
  if (!access.ok) return access;
  if (!signingKey.ok) return signingKey;
  const pass = createAccessPass(signingKey.key, access.password);
  return { ok: true, pass, password: access.password, signingKey: signingKey.key };
}

async function passwordIn(request: Request): Promise<string | undefined> {
  const received = await readJsonWithin(request, MAX_UNLOCK_BYTES);
  return received.ok ? stringField(received.body, "password") : undefined;
}

function noContent(headers: Record<string, string> = {}): Response {
  return new Response(null, { status: 204, headers: { ...NO_STORE, ...headers } });
}

function failed(status: number, error: string, headers: Record<string, string> = {}): Response {
  return Response.json({ error }, { status, headers: { ...NO_STORE, ...headers } });
}
