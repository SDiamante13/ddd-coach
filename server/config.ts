export type CoachConfig = { apiKey: string; model: string };
export type ConfigResult = { ok: true; config: CoachConfig } | { ok: false; error: string };

export type Env = Readonly<Record<string, string | undefined>>;

const API_KEY = "OPENROUTER_API_KEY";
const MODEL = "OPENROUTER_MODEL";

export function readConfig(env: Env): ConfigResult {
  const apiKey = present(env[API_KEY]);
  if (apiKey === undefined) return missing(API_KEY);
  const model = present(env[MODEL]);
  if (model === undefined) return missing(MODEL);
  return { ok: true, config: { apiKey, model } };
}

function present(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function missing(name: string): ConfigResult {
  return { ok: false, error: `${name} is not set.` };
}
