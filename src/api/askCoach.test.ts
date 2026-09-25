import { afterEach, describe, expect, it, vi } from "vitest";
import { askCoach } from "./askCoach.ts";
import { jsonResponse } from "../test/fetchStub.ts";

afterEach(() => vi.unstubAllGlobals());

function respondWith(response: Response | Promise<Response>) {
  const fetchMock = vi.fn(() => Promise.resolve(response));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("askCoach", () => {
  it("posts the message and returns the reply", async () => {
    const fetchMock = respondWith(jsonResponse(200, { reply: "Hi there" }));

    expect(await askCoach("Hello coach")).toEqual({ ok: true, reply: "Hi there" });
    expect(fetchMock).toHaveBeenCalledWith("/api/chat", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ message: "Hello coach" }),
    }));
  });

  it("returns the server's error for a non-2xx response", async () => {
    respondWith(jsonResponse(502, { error: "The coach is unavailable." }));

    expect(await askCoach("Hello coach")).toEqual({ ok: false, error: "The coach is unavailable." });
  });

  it("reports an unreachable coach when the request throws", async () => {
    respondWith(Promise.reject(new TypeError("Failed to fetch")));

    expect(await askCoach("Hello coach")).toEqual({ ok: false, error: "Could not reach the coach." });
  });

  it("reports an unexpected response when a success body has no reply", async () => {
    respondWith(jsonResponse(200, { unexpected: true }));

    expect(await askCoach("Hello coach")).toEqual({
      ok: false,
      error: "Unexpected response from the coach.",
    });
  });

  it("reports a timeout for a 504 whose body is not JSON", async () => {
    respondWith(new Response("Function invocation timed out", { status: 504 }));

    expect(await askCoach("Hello coach")).toEqual({
      ok: false,
      error: "The coach took too long. Try a shorter question or Retry.",
    });
  });

  it("reports an unavailable coach for any other error whose body is not JSON", async () => {
    respondWith(new Response("TimeoutError: task timed out", { status: 500 }));

    expect(await askCoach("Hello coach")).toEqual({
      ok: false,
      error: "The coach is unavailable. Try again.",
    });
  });
});
