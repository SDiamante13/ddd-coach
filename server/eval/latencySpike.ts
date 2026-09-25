import type { CoachConfig } from "../config.ts";
import type { ChatClient } from "../openRouterCoach.ts";
import { verifiedConversationOf } from "../test/conversations.ts";
import type { VerifiedConversation } from "../turnSignature.ts";
import { latencyVerdict, median, mentionsNonce, nonceLine } from "./latency.ts";
import { measure, repeat, type Measured } from "./measure.ts";
import type { Overrides } from "./recordingChat.ts";

const FOLLOW_UP = "Which of those lines are guesses?";

type SpikeCall = Measured & { pastedAt: string };

export async function latencySpike(config: CoachConfig, chat: ChatClient, thread: string) {
  const firstTurn = async (label: string, overrides?: Overrides): Promise<SpikeCall> => {
    const pastedAt = new Date();
    const asPasted = verifiedConversationOf(`${nonceLine(pastedAt)}\n${thread.trim()}`);
    return { ...(await measure(config, chat, label, asPasted, overrides)), pastedAt: pastedAt.toISOString() };
  };
  const probes = await repeat(3, (i) => firstTurn(`probe ${i}`, { maxCompletionTokens: 1 }));
  const runs = await repeat(5, (i) => firstTurn(`run ${i}`));
  const streamed = await repeat(2, (i) => firstTurn(`stream ${i}`, { stream: true }));
  const followUp = { ...(await measure(config, chat, "follow-up", followUpOf(runs[0]!))), pastedAt: runs[0]!.pastedAt };
  const calls = [...probes, ...runs, ...streamed, followUp];
  const nonceMentions = calls.filter(({ reply, pastedAt }) => mentionsNonce(reply, new Date(pastedAt), thread)).map(({ label }) => label);
  return { probeMs: median(probes.map((probe) => probe.ms)), verdict: latencyVerdict(runs.map((run) => run.ms)), nonceMentions, calls };
}

function followUpOf({ prompt, reply }: Measured): VerifiedConversation {
  return verifiedConversationOf(FOLLOW_UP, [{ prompt, reply }]);
}
