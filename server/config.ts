import { ChatRequestEffort } from "@openrouter/sdk/models";
import { coachProvider } from "../src/shared/coachProvider.ts";

export type ReasoningEffort = (typeof ChatRequestEffort)[keyof typeof ChatRequestEffort];
export type CoachConfig = { apiKey: string; model: string; reasoningEffort?: ReasoningEffort };
type Misconfigured = { ok: false; error: string };
export type ConfigResult = { ok: true; config: CoachConfig } | Misconfigured;
export type SigningKeyResult = { ok: true; key: string } | Misconfigured;
export type AccessPasswordResult = { ok: true; password: string } | Misconfigured;

export type Env = Readonly<Record<string, string | undefined>>;

const API_KEY = "OPENROUTER_API_KEY";
const MODEL = "OPENROUTER_MODEL";
const REASONING_EFFORT = "OPENROUTER_REASONING_EFFORT";
const TIMEOUT = "COACH_TIMEOUT_MS";
const SIGNING_KEY = "COACH_SIGNING_KEY";
const ACCESS_PASSWORD = "ACCESS_PASSWORD";
export const MIN_SIGNING_KEY_CHARS = 32;
const DEFAULT_TIMEOUT_MS = 25_000;
const DEFAULT_REASONING_EFFORT: ReasoningEffort = "none";
const REASONING_EFFORTS: readonly string[] = Object.values(ChatRequestEffort);

export const readApiKey = (env: Env): string | undefined => present(env[API_KEY]);

export function readConfig(env: Env): ConfigResult {
  const apiKey = present(env[API_KEY]);
  if (apiKey === undefined) return missing(API_KEY);
  const model = present(env[MODEL]);
  if (model === undefined) return missing(MODEL);
  if (!model.startsWith(`${coachProvider.slug}/`)) return offProvider();
  return withReasoningEffort({ apiKey, model }, present(env[REASONING_EFFORT]) ?? DEFAULT_REASONING_EFFORT);
}

function withReasoningEffort(config: CoachConfig, effort: string): ConfigResult {
  if (!isReasoningEffort(effort)) return unknownReasoningEffort();
  return { ok: true, config: { ...config, reasoningEffort: effort } };
}

function isReasoningEffort(value: string): value is ReasoningEffort {
  return REASONING_EFFORTS.includes(value);
}

function unknownReasoningEffort(): ConfigResult {
  return { ok: false, error: `${REASONING_EFFORT} must be one of: ${REASONING_EFFORTS.join(", ")}.` };
}

function offProvider(): Misconfigured {
  return { ok: false, error: `${MODEL} must be an ${coachProvider.slug}/ model, the provider the data notice names (coachProvider).` };
}

function present(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function missing(name: string): Misconfigured {
  return { ok: false, error: `${name} is not set.` };
}

export function readTimeoutMs(env: Env): number {
  const timeoutMs = Number(present(env[TIMEOUT]));
  return Number.isInteger(timeoutMs) && timeoutMs > 0 ? timeoutMs : DEFAULT_TIMEOUT_MS;
}

export function readSigningKey(env: Env): SigningKeyResult {
  const key = present(env[SIGNING_KEY]);
  if (key === undefined) return missing(SIGNING_KEY);
  if (key.length < MIN_SIGNING_KEY_CHARS) {
    return { ok: false, error: `${SIGNING_KEY} must be at least ${MIN_SIGNING_KEY_CHARS} characters.` };
  }
  return { ok: true, key };
}

export function readAccessPassword(env: Env): AccessPasswordResult {
  const password = present(env[ACCESS_PASSWORD]);
  return password === undefined ? missing(ACCESS_PASSWORD) : { ok: true, password };
}
