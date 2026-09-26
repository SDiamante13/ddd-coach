import type { Plugin } from "vite";
import { BOARD_DEMO_REPLIES } from "../src/test/boardDemoReplies.ts";

export const FIXTURE_SIGNATURE = "board-demo-fixture";

type FixtureAnswer = { status: number; body?: { reply: string; signature: string } };

export function fixtureResponder(replies: readonly string[]) {
  let sent = 0;
  return (method: string, path: string): FixtureAnswer | null => {
    if (method === "GET" && path === "/api/session") {
      sent = 0;
      return { status: 204 };
    }
    if (method !== "POST" || path !== "/api/chat") return null;
    const reply = replies[Math.min(sent++, replies.length - 1)]!;
    return { status: 200, body: { reply, signature: FIXTURE_SIGNATURE } };
  };
}

export function fixtureApi(): Plugin {
  return {
    name: "board-demo-fixture-api",
    apply: "serve",
    configureServer(server) {
      const respond = fixtureResponder(BOARD_DEMO_REPLIES);
      server.middlewares.use((request, response, next) => {
        const answer = respond(request.method ?? "", request.url ?? "");
        if (answer === null) return next();
        response.statusCode = answer.status;
        if (answer.body) response.setHeader("Content-Type", "application/json");
        response.end(answer.body ? JSON.stringify(answer.body) : undefined);
      });
    },
  };
}
