import { afterEach, describe, expect, it, vi } from "vitest";
import { ACCESS_REQUIRED } from "../shared/accessContract.ts";
import {
  COACH_EMPTY_REPLY,
  COACH_GLOSSARY_TOO_LONG,
  COACH_MALFORMED,
  COACH_MESSAGE_TOO_LONG,
  COACH_OUT_OF_CREDIT,
  COACH_TIMED_OUT,
  COACH_TOO_LONG,
  COACH_UNAVAILABLE,
  COACH_UNVERIFIED,
} from "../shared/chatContract.ts";
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

    expect(await askCoach(conversation)).toEqual({ ok: false, error: "The coach is unavailable.", remedy: "retry" });
  });

  it("takes the copy and remedy from the reason code, not the server's wording (#74)", async () => {
    respondWith(jsonResponse(400, { error: "Reworded on the server.", reason: "unverified" }));

    expect(await askCoach(conversation)).toEqual({ ok: false, error: COACH_UNVERIFIED, remedy: "startOver" });
  });

  it.each([
    ["malformed", COACH_MALFORMED, "copy"],
    ["conversation_too_long", COACH_TOO_LONG, "startOver"],
    ["message_too_long", COACH_MESSAGE_TOO_LONG, "copy"],
    ["glossary_too_long", COACH_GLOSSARY_TOO_LONG, "copy"],
    ["unverified", COACH_UNVERIFIED, "startOver"],
    ["access_expired", ACCESS_REQUIRED, "unlock"],
    ["credit_exhausted", COACH_OUT_OF_CREDIT, "copy"],
    ["timed_out", COACH_TIMED_OUT, "retry"],
    ["empty_reply", COACH_EMPTY_REPLY, "retry"],
    ["unavailable", COACH_UNAVAILABLE, "retry"],
  ])("answers reason %s with its own copy and remedy (#74)", async (reason, error, remedy) => {
    respondWith(jsonResponse(500, { error: "Server wording.", reason }));

    expect(await askCoach(conversation)).toEqual({ ok: false, error, remedy });
  });

  it("carries how long to wait before retrying a briefly busy coach (#74)", async () => {
    respondWith(jsonResponse(502, { error: "Busy.", reason: "unavailable", retryAfterSeconds: 20 }));

    expect(await askCoach(conversation)).toEqual({
      ok: false,
      error: "The coach is unavailable. Try again in 20 s.",
      remedy: "retry",
      retryAfterSeconds: 20,
    });
  });

  it("marks a refusal as too long as not worth retrying", async () => {
    respondWith(jsonResponse(413, { error: "This message is too long for the coach." }));

    expect(await askCoach(conversation)).toEqual({
      ok: false,
      error: "This message is too long for the coach.",
      remedy: "copy",
    });
  });

  it("marks a refusal of an unverifiable conversation as not worth retrying", async () => {
    respondWith(jsonResponse(400, { error: "This conversation can't be verified." }));

    expect(await askCoach(conversation)).toEqual({
      ok: false,
      error: "This conversation can't be verified.",
      remedy: "copy",
    });
  });

  it("marks a refusal for missing access as access lost, not worth retrying", async () => {
    respondWith(jsonResponse(401, { error: ACCESS_REQUIRED }));

    expect(await askCoach(conversation)).toEqual({
      ok: false,
      error: ACCESS_REQUIRED,
      remedy: "unlock",
    });
  });

  it("marks a coach paused for its spent usage budget as not worth retrying", async () => {
    respondWith(jsonResponse(503, { error: COACH_OUT_OF_CREDIT }));

    expect(await askCoach(conversation)).toEqual({ ok: false, error: COACH_OUT_OF_CREDIT, remedy: "copy" });
  });

  it("keeps a rate-limited request worth retrying", async () => {
    respondWith(jsonResponse(429, { error: "Too many requests." }));

    expect(await askCoach(conversation)).toEqual({ ok: false, error: "Too many requests.", remedy: "retry" });
  });

  it("reports an unreachable coach when the request throws", async () => {
    respondWith(Promise.reject(new TypeError("Failed to fetch")));

    expect(await askCoach(conversation)).toEqual({ ok: false, error: "Could not reach the coach.", remedy: "retry" });
  });

  it("reports an unexpected response when a success body has no reply", async () => {
    respondWith(jsonResponse(200, { unexpected: true }));

    expect(await askCoach(conversation)).toEqual({
      ok: false,
      error: "Unexpected response from the coach.",
      remedy: "retry",
    });
  });

  it("reports an unexpected response when a reply comes without a signature", async () => {
    respondWith(jsonResponse(200, { reply: "Hi there", signature: 42 }));

    expect(await askCoach(conversation)).toEqual({
      ok: false,
      error: "Unexpected response from the coach.",
      remedy: "retry",
    });
  });

  it("reports a timeout for a 504 whose body is not JSON", async () => {
    respondWith(new Response("Function invocation timed out", { status: 504 }));

    expect(await askCoach(conversation)).toEqual({
      ok: false,
      error: "The coach took too long. Try a shorter question or Retry.",
      remedy: "retry",
    });
  });

  it("reports a message too long, not worth retrying, for a 413 whose body is not JSON", async () => {
    respondWith(new Response("Payload Too Large", { status: 413 }));

    expect(await askCoach(conversation)).toEqual({
      ok: false,
      error: "This message is too long for the coach. Shorten it and send it again.",
      remedy: "copy",
    });
  });

  it("reports an unavailable coach for any other error whose body is not JSON", async () => {
    respondWith(new Response("TimeoutError: task timed out", { status: 500 }));

    expect(await askCoach(conversation)).toEqual({
      ok: false,
      error: "The coach is unavailable. Try again.",
      remedy: "retry",
    });
  });

  it("keeps a platform 503 whose body is not JSON worth retrying", async () => {
    respondWith(new Response("Service Unavailable", { status: 503 }));

    expect(await askCoach(conversation)).toEqual({
      ok: false,
      error: "The coach is unavailable. Try again.",
      remedy: "retry",
    });
  });
});
