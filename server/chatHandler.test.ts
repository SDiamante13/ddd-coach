// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { createChatHandler } from "./chatHandler.ts";
import type { Coach } from "./coach.ts";
import type { ConfigResult } from "./config.ts";

const validConfig: ConfigResult = { ok: true, config: { apiKey: "sk-or-test-key", model: "test/model" } };

function echoCoach(): Coach {
  return { reply: vi.fn(async (prompt: string) => `Echo: ${prompt}`) };
}

function post(body: string): Request {
  return new Request("http://localhost/api/chat", { method: "POST", body });
}

function postMessage(message: unknown): Request {
  return post(JSON.stringify({ message }));
}

describe("chat handler", () => {
  it("replies with the coach's answer to a posted message", async () => {
    const handle = createChatHandler({ config: validConfig, createCoach: echoCoach });

    const response = await handle(postMessage("Hello coach"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ reply: "Echo: Hello coach" });
  });

  it("fails with the missing variable's name without creating a coach", async () => {
    const createCoach = vi.fn(echoCoach);
    const config: ConfigResult = { ok: false, error: "OPENROUTER_API_KEY is not set." };
    const handle = createChatHandler({ config, createCoach });

    const response = await handle(postMessage("Hello coach"));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "OPENROUTER_API_KEY is not set." });
    expect(createCoach).not.toHaveBeenCalled();
  });

  it("hides provider failure details behind a generic 502", async () => {
    const failingCoach = (): Coach => ({
      reply: () => Promise.reject(new Error("Unauthorized: bad key sk-or-test-key")),
    });
    const handle = createChatHandler({ config: validConfig, createCoach: failingCoach });

    const response = await handle(postMessage("Hello coach"));

    expect(response.status).toBe(502);
    const body = await response.text();
    expect(JSON.parse(body)).toEqual({ error: "The coach is unavailable. Try again." });
    expect(body).not.toContain("sk-or-test-key");
  });

  it("rejects a body that is not JSON as a bad request", async () => {
    const createCoach = vi.fn(echoCoach);
    const handle = createChatHandler({ config: validConfig, createCoach });

    const response = await handle(post("not json"));

    expect(response.status).toBe(400);
    expect(createCoach).not.toHaveBeenCalled();
  });

  it("rejects a blank message as a bad request", async () => {
    const createCoach = vi.fn(echoCoach);
    const handle = createChatHandler({ config: validConfig, createCoach });

    const response = await handle(postMessage("   "));

    expect(response.status).toBe(400);
    expect(createCoach).not.toHaveBeenCalled();
  });

  it("rejects a body without a text message as a bad request", async () => {
    const handle = createChatHandler({ config: validConfig, createCoach: echoCoach });

    const response = await handle(postMessage(42));

    expect(response.status).toBe(400);
  });

  it("allows only POST", async () => {
    const handle = createChatHandler({ config: validConfig, createCoach: echoCoach });

    const response = await handle(new Request("http://localhost/api/chat"));

    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("POST");
  });
});
