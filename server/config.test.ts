// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readAccessPassword, readApiKey, readConfig, readSigningKey, readTimeoutMs } from "./config.ts";

const requiredEnv = { OPENROUTER_API_KEY: "sk-or-test-key", OPENROUTER_MODEL: "test/model" };

describe("readConfig", () => {
  it("reads the key and model, with no reasoning by default so a reasoning model can't spend the reply cap", () => {
    expect(readConfig(requiredEnv)).toEqual({
      ok: true,
      config: { apiKey: "sk-or-test-key", model: "test/model", reasoningEffort: "none" },
    });
  });

  it("reads an optional reasoning effort", () => {
    const env = { ...requiredEnv, OPENROUTER_REASONING_EFFORT: "low" };

    expect(readConfig(env)).toEqual({
      ok: true,
      config: { apiKey: "sk-or-test-key", model: "test/model", reasoningEffort: "low" },
    });
  });

  it("refuses an unknown reasoning effort, naming the allowed ones", () => {
    const env = { ...requiredEnv, OPENROUTER_REASONING_EFFORT: "turbo" };

    expect(readConfig(env)).toEqual({
      ok: false,
      error: "OPENROUTER_REASONING_EFFORT must be one of: max, xhigh, high, medium, low, minimal, none.",
    });
  });

  it("names a missing key", () => {
    expect(readConfig({ OPENROUTER_MODEL: "test/model" })).toEqual({
      ok: false,
      error: "OPENROUTER_API_KEY is not set.",
    });
  });

  it("treats a blank model as missing", () => {
    expect(readConfig({ OPENROUTER_API_KEY: "sk-or-test-key", OPENROUTER_MODEL: "  " })).toEqual({
      ok: false,
      error: "OPENROUTER_MODEL is not set.",
    });
  });
});

describe("readTimeoutMs", () => {
  it("defaults to 25 seconds when unset", () => {
    expect(readTimeoutMs({})).toBe(25_000);
  });

  it("reads a positive whole number of milliseconds", () => {
    expect(readTimeoutMs({ COACH_TIMEOUT_MS: "5000" })).toBe(5_000);
  });

  it.each(["", "  ", "abc", "0", "-1", "2.5"])("falls back to 25 seconds for %j", (value) => {
    expect(readTimeoutMs({ COACH_TIMEOUT_MS: value })).toBe(25_000);
  });
});

describe("readSigningKey", () => {
  it("fails naming the variable when the key is not set", () => {
    expect(readSigningKey({})).toEqual({ ok: false, error: "COACH_SIGNING_KEY is not set." });
  });

  it("treats a whitespace-only key as not set", () => {
    expect(readSigningKey({ COACH_SIGNING_KEY: " \t\n " })).toEqual({ ok: false, error: "COACH_SIGNING_KEY is not set." });
  });

  it("accepts a key of exactly 32 characters", () => {
    expect(readSigningKey({ COACH_SIGNING_KEY: "k".repeat(32) }).ok).toBe(true);
  });

  it("refuses a key shorter than 32 characters, naming the minimum", () => {
    expect(readSigningKey({ COACH_SIGNING_KEY: "k".repeat(31) })).toEqual({
      ok: false,
      error: "COACH_SIGNING_KEY must be at least 32 characters.",
    });
  });

  it("reads a key of 43 characters without surrounding whitespace", () => {
    const key = "k".repeat(43);

    expect(readSigningKey({ COACH_SIGNING_KEY: ` ${key}\n` })).toEqual({ ok: true, key });
  });
});

describe("readAccessPassword", () => {
  it.each([
    ["not set", {}],
    ["whitespace only", { ACCESS_PASSWORD: " \t\n " }],
  ])("fails naming the variable when it is %s", (_case, env) => {
    expect(readAccessPassword(env)).toEqual({ ok: false, error: "ACCESS_PASSWORD is not set." });
  });

  it("reads the password without surrounding whitespace", () => {
    expect(readAccessPassword({ ACCESS_PASSWORD: " tidal-lantern-quartz\n" })).toEqual({
      ok: true,
      password: "tidal-lantern-quartz",
    });
  });
});

describe("readApiKey (#health)", () => {
  it.each([
    [{ OPENROUTER_API_KEY: "sk-or-test-key" }, "sk-or-test-key"],
    [{ OPENROUTER_API_KEY: "  " }, undefined],
    [{}, undefined],
  ])("reads %j as %s, needing no model", (env, key) => {
    expect(readApiKey(env)).toBe(key);
  });
});
