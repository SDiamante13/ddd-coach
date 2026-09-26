// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { fakeChat, type SentMessages } from "../test/fakeChat.ts";
import type { ChatClient } from "../openRouterCoach.ts";
import { abEval } from "./abEval.ts";
import { loadFixture } from "./fixtures.ts";
import { glossaryContext } from "../glossaryContext.ts";

const config = { apiKey: "sk-or-test-key", model: "test/model" };
const live = { version: 6, instructions: "LIVE INSTRUCTIONS" };
const candidate = { version: 8, instructions: "CANDIDATE INSTRUCTIONS" };
const FIXTURES = ["greeting", "booking-split"];

const replyByArm = (messages: SentMessages) =>
  messages[0]?.content === live.instructions ? "Hi, I'm DDD Coach. Paste a thread." : "Hi! Paste it here.";

function failingOn(callNumbers: number[], { send }: ChatClient): ChatClient {
  let calls = 0;
  const badGateway = () => Object.assign(new Error("Provider said: key sk-or-test-key"), { name: "BadGatewayResponseError", statusCode: 502 });
  return { send: (...args) => (callNumbers.includes(++calls) ? Promise.reject(badGateway()) : send(...args)) };
}

const promptOf = (messages: SentMessages) => messages.map(({ content }) => content);

vi.spyOn(console, "log").mockImplementation(() => {});

describe("abEval", () => {
  it("sends each fixture as pasted to both arms n times, live first on odd runs and candidate first on even runs", async () => {
    const { chat, sent } = fakeChat(replyByArm);

    await abEval(config, chat, { live, candidate, runs: 6, fixtures: FIXTURES });

    const expected = FIXTURES.flatMap((name) => {
      const asPasted = loadFixture(name).thread.trim();
      const liveCall = [live.instructions, asPasted];
      const candidateCall = [candidate.instructions, asPasted];
      return [1, 2, 3, 4, 5, 6].flatMap((i) => (i % 2 === 1 ? [liveCall, candidateCall] : [candidateCall, liveCall]));
    });
    expect(sent.map(promptOf)).toEqual(expected);
  });

  it("routes every eval call the way production does, pinned to OpenAI (#110)", async () => {
    const { chat } = fakeChat(replyByArm);
    const providers: unknown[] = [];
    const routed: ChatClient = { send: (request, options) => (providers.push(request.chatRequest.provider), chat.send(request, options)) };

    await abEval(config, routed, { live, candidate, runs: 1, fixtures: ["greeting"] });

    expect(providers).toEqual([
      { order: ["openai"], allowFallbacks: false, dataCollection: "deny" },
      { order: ["openai"], allowFallbacks: false, dataCollection: "deny" },
    ]);
  });

  it("tags each run with its arm, version, fixture and run number, and scores it against the fixture", async () => {
    const { chat } = fakeChat(replyByArm);

    const { runs } = await abEval(config, chat, { live, candidate, runs: 6, fixtures: ["greeting"] });

    const tagged = runs.map(({ arm, version, fixture, i, hardFailures }) => ({ arm, version, fixture, i, hardFailures }));
    expect(tagged.slice(2, 4)).toEqual([
      { arm: "candidate", version: 8, fixture: "greeting", i: 2, hardFailures: [] },
      { arm: "live", version: 6, fixture: "greeting", i: 2, hardFailures: ["no boilerplate"] },
    ]);
  });

  it("retries a call that throws once and keeps every run", async () => {
    const { chat } = fakeChat(replyByArm);

    const { runs } = await abEval(config, failingOn([3], chat), { live, candidate, runs: 6, fixtures: ["greeting"] });

    expect(runs).toHaveLength(12);
  });

  it("aborts when the retry throws too, keeping only the runs that finished and the error's name and status, not its text", async () => {
    const { chat } = fakeChat(replyByArm);

    const result = await abEval(config, failingOn([3, 4], chat), { live, candidate, runs: 6, fixtures: ["greeting"] });

    expect({ finished: result.runs.length, aborted: result.aborted }).toEqual({ finished: 2, aborted: "BadGatewayResponseError 502" });
  });

  it("sends a fixture's kept glossary as the production coach does, in its own message after the system prompt (#100)", async () => {
    const { chat, sent } = fakeChat(replyByArm);

    await abEval(config, chat, { live, candidate, runs: 6, fixtures: ["kept-drift"] });

    const { thread, glossary } = loadFixture("kept-drift");
    expect(promptOf(sent[0]!)).toEqual([live.instructions, glossaryContext(glossary!), thread.trim()]);
  });
});
