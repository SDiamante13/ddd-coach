import { readFileSync } from "node:fs";
import { keptRowsOf, type KeptGlossaryRow } from "../../src/domain/glossary.ts";
import { parseReply } from "../../src/domain/replyBlocks.ts";

const RECORDED = new URL("../../outputs/evals/slice-03/ab-2026-09-25-openai-gpt-5-6-terra-v10-v11.json", import.meta.url);

type RecordedCall = { arm: string; fixture: string; i: number; reply: string };

export function keptGlossaryFixture(): KeptGlossaryRow[] {
  const { calls } = JSON.parse(readFileSync(RECORDED, "utf8")) as { calls: RecordedCall[] };
  const reply = calls.find((call) => call.arm === "candidate" && call.fixture === "example-thread" && call.i === 1)!.reply;
  return keptRowsOf(parseReply(reply), "2026-09-25", "load 7731").map(({ word, holder, meaning, source, keptOn, from }) => ({
    ...{ word, holder, meaning, source, keptOn, from },
  }));
}
