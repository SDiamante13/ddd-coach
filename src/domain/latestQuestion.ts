import type { Exchange, ExchangeId } from "./exchange.ts";
import { parseReply, type ReplyBlock } from "./replyBlocks.ts";

type QuestionBlock = Extract<ReplyBlock, { kind: "question" }>;
export type LatestQuestion = Omit<QuestionBlock, "kind"> & { exchangeId: ExchangeId };

export function latestQuestionOf(exchanges: readonly Exchange[], restore: (text: string) => string = (text) => text): LatestQuestion | null {
  for (const exchange of [...exchanges].reverse()) {
    if (exchange.status !== "replied") continue;
    const question = parseReply(restore(exchange.reply)).find((block): block is QuestionBlock => block.kind === "question");
    if (question) return { exchangeId: exchange.id, roles: question.roles, text: question.text, sources: question.sources };
  }
  return null;
}
