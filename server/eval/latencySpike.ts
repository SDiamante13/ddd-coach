import type { CoachConfig } from "../config.ts";
import type { ChatClient } from "../openRouterCoach.ts";
import { verifiedConversationOf } from "../test/conversations.ts";
import type { VerifiedConversation } from "../turnSignature.ts";
import { latencyVerdict, median, mentionsNonce, nonceLine } from "./latency.ts";
import { measure, repeat, type Measured } from "./measure.ts";

const FOLLOW_UP = "Which of those lines are guesses?";

export async function latencySpike(config: CoachConfig, chat: ChatClient, thread: string) {
  const stamps: Date[] = [];
  const firstTurn = (text: string) => {
    const pastedAt = new Date();
    stamps.push(pastedAt);
    return verifiedConversationOf(`${nonceLine(pastedAt)}\n${text.trim()}`);
  };
  const probes = await repeat(3, (i) => measure(config, chat, `probe ${i}`, firstTurn(thread), { maxCompletionTokens: 1 }));
  const runs = await repeat(5, (i) => measure(config, chat, `run ${i}`, firstTurn(thread)));
  const streamed = await repeat(2, (i) => measure(config, chat, `stream ${i}`, firstTurn(thread), { stream: true }));
  const followUp = await measure(config, chat, "follow-up", followUpOf(runs[0]!));
  const probeMs = median(probes.map((probe) => probe.ms));
  const calls = [...probes, ...runs, ...streamed, followUp];
  const nonceMentions = calls.filter(({ reply }) => stamps.some((at) => mentionsNonce(reply, at))).map(({ label }) => label);
  return { probeMs, verdict: latencyVerdict(runs.map((run) => run.ms)), nonceMentions, calls };
}

function followUpOf({ prompt, reply }: Measured): VerifiedConversation {
  return verifiedConversationOf(FOLLOW_UP, [{ prompt, reply }]);
}
