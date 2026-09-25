import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { currentKeys, reportOf, type AbRecord } from "./abRecord.ts";
import { abSummary } from "./abSummary.ts";
import { abVerdict } from "./abVerdict.ts";
import { keyChanges } from "./answerKeys.ts";
import { evalSummary, type SummaryRun } from "./evalSummary.ts";
import { loadFixture } from "./fixtures.ts";
import { scoreReply } from "./replyChecks.ts";
import { shipBar } from "./shipBar.ts";

type RecordedEval = { kind?: undefined; model: string; reasoningEffort: string; instructionsVersion: number; runs: SummaryRun[] };

const rescored = <T extends { reply: string; finishReason: string | null; fixture: string }>(run: T): T => ({
  ...run,
  ...scoreReply(run.reply, run.finishReason, loadFixture(run.fixture)),
});

function rescoreSingle(recorded: RecordedEval, file: string): void {
  const runs = recorded.runs.map(rescored);
  const bar = shipBar(runs);
  const heading = `Re-score of ${file} (${recorded.model}, effort ${recorded.reasoningEffort}, v${recorded.instructionsVersion}) with the current checks`;
  console.log(evalSummary(heading, runs, bar));
  process.exitCode = bar.ships ? 0 : 1;
}

function rescoreAb(recorded: AbRecord, file: string): void {
  const calls = recorded.calls.map(rescored);
  const verdict = recorded.aborted === null ? abVerdict(calls, recorded.target) : null;
  const changed = keyChanges(recorded.keys, currentKeys(Object.keys(recorded.keys)));
  console.log(`Re-score of ${file} with the current checks and keys, both arms.`);
  console.log(`Keys changed since this run: ${changed.join(", ") || "none"}\n`);
  console.log(abSummary(reportOf({ ...recorded, calls, verdict })));
  process.exitCode = verdict?.ships ? 0 : 1;
}

const [resultFile] = process.argv.slice(2);
if (!resultFile) throw new Error("Usage: node server/eval/rescore.ts <eval.json | ab.json>");

const recorded = JSON.parse(readFileSync(resultFile, "utf8")) as RecordedEval | AbRecord;
if (recorded.kind === "ab") rescoreAb(recorded, basename(resultFile));
else rescoreSingle(recorded, basename(resultFile));
