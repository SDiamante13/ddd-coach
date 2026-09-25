// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readConfig, readTimeoutMs } from "./config.ts";

describe("readConfig", () => {
  it("reads the key and model", () => {
    const env = { OPENROUTER_API_KEY: "sk-or-test-key", OPENROUTER_MODEL: "test/model" };

    expect(readConfig(env)).toEqual({
      ok: true,
      config: { apiKey: "sk-or-test-key", model: "test/model" },
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
