import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { evalSummary, type SummaryRun } from "./evalSummary.ts";
import { loadFixture } from "./fixtures.ts";
import { scoreReply } from "./replyChecks.ts";
import { shipBar } from "./shipBar.ts";

type RecordedEval = { model: string; reasoningEffort: string; instructionsVersion: number; runs: SummaryRun[] };

const [resultFile] = process.argv.slice(2);
if (!resultFile) throw new Error("Usage: node server/eval/rescore.ts <eval.json>");

const recorded = JSON.parse(readFileSync(resultFile, "utf8")) as RecordedEval;
const runs = recorded.runs.map((run) => ({ ...run, ...scoreReply(run.reply, run.finishReason, loadFixture(run.fixture)) }));
const bar = shipBar(runs);
const heading = `Re-score of ${basename(resultFile)} (${recorded.model}, effort ${recorded.reasoningEffort}, v${recorded.instructionsVersion}) with the current checks`;
console.log(evalSummary(heading, runs, bar));
process.exitCode = bar.ships ? 0 : 1;
