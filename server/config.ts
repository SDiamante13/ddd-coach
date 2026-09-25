import { ChatRequestEffort } from "@openrouter/sdk/models";

export type ReasoningEffort = (typeof ChatRequestEffort)[keyof typeof ChatRequestEffort];
export type CoachConfig = { apiKey: string; model: string; reasoningEffort?: ReasoningEffort };
type Misconfigured = { ok: false; error: string };
export type ConfigResult = { ok: true; config: CoachConfig } | Misconfigured;
export type SigningKeyResult = { ok: true; key: string } | Misconfigured;

export type Env = Readonly<Record<string, string | undefined>>;

const API_KEY = "OPENROUTER_API_KEY";
const MODEL = "OPENROUTER_MODEL";
const REASONING_EFFORT = "OPENROUTER_REASONING_EFFORT";
const TIMEOUT = "COACH_TIMEOUT_MS";
const SIGNING_KEY = "COACH_SIGNING_KEY";
export const MIN_SIGNING_KEY_CHARS = 32;
const DEFAULT_TIMEOUT_MS = 25_000;
const REASONING_EFFORTS: readonly string[] = Object.values(ChatRequestEffort);

export function readConfig(env: Env): ConfigResult {
  const apiKey = present(env[API_KEY]);
  if (apiKey === undefined) return missing(API_KEY);
  const model = present(env[MODEL]);
  if (model === undefined) return missing(MODEL);
  return withReasoningEffort({ apiKey, model }, present(env[REASONING_EFFORT]));
}

function withReasoningEffort(config: CoachConfig, effort: string | undefined): ConfigResult {
  if (effort === undefined) return { ok: true, config };
  if (!isReasoningEffort(effort)) return unknownReasoningEffort();
  return { ok: true, config: { ...config, reasoningEffort: effort } };
}

function isReasoningEffort(value: string): value is ReasoningEffort {
  return REASONING_EFFORTS.includes(value);
}

function unknownReasoningEffort(): ConfigResult {
  return { ok: false, error: `${REASONING_EFFORT} must be one of: ${REASONING_EFFORTS.join(", ")}.` };
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
