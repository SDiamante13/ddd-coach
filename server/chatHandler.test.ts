// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { createChatHandler, type CoachFailureLog } from "./chatHandler.ts";
import type { Conversation } from "../src/domain/conversation.ts";
import type { Coach } from "./coach.ts";
import type { CoachConfig, ConfigResult } from "./config.ts";

const validConfig: ConfigResult = { ok: true, config: { apiKey: "sk-or-test-key", model: "test/model" } };

type HandlerOverrides = {
  config?: ConfigResult;
  createCoach?: (config: CoachConfig) => Coach;
  deadlineMs?: number;
  log?: CoachFailureLog;
};

function handler(overrides: HandlerOverrides = {}) {
  return createChatHandler({
    config: validConfig,
    createCoach: echoCoach,
    deadlineMs: 1_000,
    log: () => {},
    ...overrides,
  });
}

function echoCoach(): Coach {
  return { reply: vi.fn(async ({ prompt }: Conversation) => `Echo: ${prompt}`) };
}

function post(body: string): Request {
  return new Request("http://localhost/api/chat", { method: "POST", body });
}

function postMessage(message: unknown): Request {
  return post(JSON.stringify({ message }));
}

describe("chat handler", () => {
  it("replies with the coach's answer to a posted message", async () => {
    const handle = handler();

    const response = await handle(postMessage("Hello coach"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ reply: "Echo: Hello coach" });
  });

  it("fails with the missing variable's name without creating a coach", async () => {
    const createCoach = vi.fn(echoCoach);
    const config: ConfigResult = { ok: false, error: "OPENROUTER_API_KEY is not set." };
    const handle = handler({ config, createCoach });

    const response = await handle(postMessage("Hello coach"));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "OPENROUTER_API_KEY is not set." });
    expect(createCoach).not.toHaveBeenCalled();
  });

  it("hides provider failure details behind a generic 502", async () => {
    const failingCoach = (): Coach => ({
      reply: () => Promise.reject(new Error("Unauthorized: bad key sk-or-test-key")),
    });
    const handle = handler({ createCoach: failingCoach });

    const response = await handle(postMessage("Hello coach"));

    expect(response.status).toBe(502);
    const body = await response.text();
    expect(JSON.parse(body)).toEqual({ error: "The coach is unavailable. Try again." });
    expect(body).not.toContain("sk-or-test-key");
  });

  it("logs only the failure's name and status code, never its message", async () => {
    const failure = Object.assign(new Error("Unauthorized: bad key sk-or-test-key"), {
      name: "UnauthorizedResponseError",
      statusCode: 401,
    });
    const failingCoach = (): Coach => ({ reply: () => Promise.reject(failure) });
    const log = vi.fn<CoachFailureLog>();
    const handle = handler({ createCoach: failingCoach, log });

    await handle(postMessage("Hello coach"));

    expect(log).toHaveBeenCalledWith({ name: "UnauthorizedResponseError", statusCode: 401 });
    expect(JSON.stringify(log.mock.calls)).not.toContain("sk-or-test-key");
  });

  it("gives up with a 504 when the coach does not answer before the deadline", async () => {
    const silentCoach = (): Coach => ({ reply: () => new Promise<string>(() => {}) });
    const handle = handler({ createCoach: silentCoach, deadlineMs: 10 });

    const response = await handle(postMessage("Hello coach"));

    expect(response.status).toBe(504);
    expect(await response.json()).toEqual({ error: "The coach took too long. Try a shorter question or Retry." });
  });

  it("fails with a 502 when the coach's reply is blank", async () => {
    const blankCoach = (): Coach => ({ reply: async () => "  " });
    const handle = handler({ createCoach: blankCoach });

    const response = await handle(postMessage("Hello coach"));

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "The coach sent an empty reply. Try again." });
  });

  it("rejects a body that is not JSON as a bad request", async () => {
    const createCoach = vi.fn(echoCoach);
    const handle = handler({ createCoach });

    const response = await handle(post("not json"));

    expect(response.status).toBe(400);
    expect(createCoach).not.toHaveBeenCalled();
  });

  it("rejects a blank message as a bad request", async () => {
    const createCoach = vi.fn(echoCoach);
    const handle = handler({ createCoach });

    const response = await handle(postMessage("   "));

    expect(response.status).toBe(400);
    expect(createCoach).not.toHaveBeenCalled();
  });

  it("rejects a body without a text message as a bad request", async () => {
    const handle = handler();

    const response = await handle(postMessage(42));

    expect(response.status).toBe(400);
  });

  it("allows only POST", async () => {
    const handle = handler();

    const response = await handle(new Request("http://localhost/api/chat"));

    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("POST");
  });
});
