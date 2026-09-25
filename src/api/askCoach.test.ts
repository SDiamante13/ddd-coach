import { afterEach, describe, expect, it, vi } from "vitest";
import { conversationOf } from "../test/conversations.ts";
import { jsonResponse } from "../test/fetchStub.ts";
import { askCoach } from "./askCoach.ts";

const conversation = conversationOf("Hello coach");

afterEach(() => vi.unstubAllGlobals());

function respondWith(response: Response | Promise<Response>) {
  const fetchMock = vi.fn(() => Promise.resolve(response));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("askCoach", () => {
  it("posts the message with its history and returns the signed reply", async () => {
    const fetchMock = respondWith(jsonResponse(200, { reply: "Hi there", signature: "sig-B" }));
    const followUp = conversationOf("B", [{ prompt: "A", reply: "R1" }]);

    expect(await askCoach(followUp)).toEqual({ ok: true, reply: "Hi there", signature: "sig-B" });
    expect(fetchMock).toHaveBeenCalledWith("/api/chat", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ message: "B", history: [{ prompt: "A", reply: "R1", signature: "" }] }),
    }));
  });

  it("returns the server's error for a non-2xx response", async () => {
    respondWith(jsonResponse(502, { error: "The coach is unavailable." }));

    expect(await askCoach(conversation)).toEqual({ ok: false, error: "The coach is unavailable.", retryable: true });
  });

  it("marks a refusal as too long as not worth retrying", async () => {
    respondWith(jsonResponse(413, { error: "This message is too long for the coach." }));

    expect(await askCoach(conversation)).toEqual({
      ok: false,
      error: "This message is too long for the coach.",
      retryable: false,
    });
  });

  it("marks a refusal of an unverifiable conversation as not worth retrying", async () => {
    respondWith(jsonResponse(400, { error: "This conversation can't be verified." }));

    expect(await askCoach(conversation)).toEqual({
      ok: false,
      error: "This conversation can't be verified.",
      retryable: false,
    });
  });

  it("keeps a rate-limited request worth retrying", async () => {
    respondWith(jsonResponse(429, { error: "Too many requests." }));

    expect(await askCoach(conversation)).toEqual({ ok: false, error: "Too many requests.", retryable: true });
  });

  it("reports an unreachable coach when the request throws", async () => {
    respondWith(Promise.reject(new TypeError("Failed to fetch")));

    expect(await askCoach(conversation)).toEqual({ ok: false, error: "Could not reach the coach.", retryable: true });
  });

  it("reports an unexpected response when a success body has no reply", async () => {
    respondWith(jsonResponse(200, { unexpected: true }));

    expect(await askCoach(conversation)).toEqual({
      ok: false,
      error: "Unexpected response from the coach.",
      retryable: true,
    });
  });

  it("reports an unexpected response when a reply comes without a signature", async () => {
    respondWith(jsonResponse(200, { reply: "Hi there", signature: 42 }));

    expect(await askCoach(conversation)).toEqual({
      ok: false,
      error: "Unexpected response from the coach.",
      retryable: true,
    });
  });

  it("reports a timeout for a 504 whose body is not JSON", async () => {
    respondWith(new Response("Function invocation timed out", { status: 504 }));

    expect(await askCoach(conversation)).toEqual({
      ok: false,
      error: "The coach took too long. Try a shorter question or Retry.",
      retryable: true,
    });
  });

  it("reports a message too long, not worth retrying, for a 413 whose body is not JSON", async () => {
    respondWith(new Response("Payload Too Large", { status: 413 }));

    expect(await askCoach(conversation)).toEqual({
      ok: false,
      error: "This message is too long for the coach. Shorten it and send it again.",
      retryable: false,
    });
  });

  it("reports an unavailable coach for any other error whose body is not JSON", async () => {
    respondWith(new Response("TimeoutError: task timed out", { status: 500 }));

    expect(await askCoach(conversation)).toEqual({
      ok: false,
      error: "The coach is unavailable. Try again.",
      retryable: true,
    });
  });
});
