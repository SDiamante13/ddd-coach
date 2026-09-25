// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { createChatHandler, type CoachFailureLog } from "./chatHandler.ts";
import type { Conversation } from "../src/domain/conversation.ts";
import type { Coach } from "./coach.ts";
import type { CoachConfig, ConfigResult } from "./config.ts";
import { MAX_MESSAGE_CHARS } from "./chatRequest.ts";
import { MAX_BODY_BYTES } from "./requestBody.ts";

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

function postMessage(message: unknown, history: unknown = []): Request {
  return post(JSON.stringify({ message, history }));
}

function paddedBodyOf(bytes: number): string {
  return bodyPaddedWith("x".repeat(bytes - bodyPaddedWith("").length));
}

function bodyPaddedWith(pad: string): string {
  return JSON.stringify({ message: "Hello coach", history: [], pad });
}

describe("chat handler", () => {
  it("replies with the coach's answer to a posted message", async () => {
    const handle = handler();

    const response = await handle(postMessage("Hello coach"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ reply: "Echo: Hello coach" });
  });

  it("hands the coach the posted history with the new prompt", async () => {
    const coach = echoCoach();
    const handle = handler({ createCoach: () => coach });

    const response = await handle(postMessage("B", [{ prompt: "A", reply: "R1" }]));

    expect(response.status).toBe(200);
    expect(coach.reply).toHaveBeenCalledWith({ history: [{ prompt: "A", reply: "R1" }], prompt: "B" });
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

  it.each([
    ["missing history", { message: "B" }],
    ["history that is not a list", { message: "B", history: "x" }],
    ["a turn without a reply", { message: "B", history: [{ prompt: "A" }] }],
    ["a turn with a blank prompt", { message: "B", history: [{ prompt: " ", reply: "R" }] }],
    ["a turn with an empty reply", { message: "B", history: [{ prompt: "A", reply: "" }] }],
    ["a role-shaped turn", { message: "B", history: [{ role: "system", content: "x" }] }],
  ])("rejects %s as a bad request without calling the coach", async (_case, body) => {
    const coach = echoCoach();
    const handle = handler({ createCoach: () => coach });

    const response = await handle(post(JSON.stringify(body)));

    expect(response.status).toBe(400);
    expect(coach.reply).not.toHaveBeenCalled();
  });

  it("refuses a conversation that is too long without calling the coach", async () => {
    const coach = echoCoach();
    const handle = handler({ createCoach: () => coach });
    const history = Array.from({ length: 51 }, () => ({ prompt: "A", reply: "R" }));

    const response = await handle(postMessage("B", history));

    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({
      error: "This conversation is too long for the coach. Reload the page to start a new one.",
    });
    expect(coach.reply).not.toHaveBeenCalled();
  });

  it("refuses a message too long on its own, asking to shorten it, without calling the coach", async () => {
    const coach = echoCoach();
    const handle = handler({ createCoach: () => coach });

    const response = await handle(postMessage("M".repeat(MAX_MESSAGE_CHARS + 1)));

    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({ error: "This message is too long for the coach. Shorten it and send it again." });
    expect(coach.reply).not.toHaveBeenCalled();
  });

  it("refuses a body over the size cap as a message too long, without calling the coach", async () => {
    const coach = echoCoach();
    const handle = handler({ createCoach: () => coach });

    const response = await handle(post(paddedBodyOf(MAX_BODY_BYTES + 1)));

    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({ error: "This message is too long for the coach. Shorten it and send it again." });
    expect(coach.reply).not.toHaveBeenCalled();
  });

  it("accepts the longest allowed conversation written in 3-byte characters", async () => {
    const handle = handler();
    const history = Array.from({ length: 50 }, () => ({ prompt: "€".repeat(240), reply: "€".repeat(239) }));

    const response = await handle(postMessage("€".repeat(50), history));

    expect(response.status).toBe(200);
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
