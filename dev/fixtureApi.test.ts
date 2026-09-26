// @vitest-environment node
import { describe, expect, it } from "vitest";
import { FIXTURE_SIGNATURE, fixtureResponder } from "./fixtureApi.ts";

describe("fixtureResponder", () => {
  it("opens the session and answers each chat with the next canned reply, repeating the last", () => {
    const respond = fixtureResponder(["one", "two"]);

    expect(respond("GET", "/api/session")).toEqual({ status: 204 });
    expect([1, 2, 3].map(() => respond("POST", "/api/chat"))).toEqual([
      { status: 200, body: { reply: "one", signature: FIXTURE_SIGNATURE } },
      { status: 200, body: { reply: "two", signature: FIXTURE_SIGNATURE } },
      { status: 200, body: { reply: "two", signature: FIXTURE_SIGNATURE } },
    ]);
  });

  it("starts the replies over when the page loads again and checks its session", () => {
    const respond = fixtureResponder(["one", "two"]);
    respond("POST", "/api/chat");

    respond("GET", "/api/session");

    expect(respond("POST", "/api/chat")).toEqual({ status: 200, body: { reply: "one", signature: FIXTURE_SIGNATURE } });
  });

  it("leaves every other request to Vite", () => {
    expect(fixtureResponder(["one"])("GET", "/src/main.tsx")).toBeNull();
  });
});
