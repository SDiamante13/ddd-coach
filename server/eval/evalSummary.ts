import type { EvalRun } from "./fullEval.ts";
import type { ShipBar, Tally } from "./shipBar.ts";

const count = ({ passed, total }: Tally) => `${passed}/${total}`;

export function evalSummary(heading: string, runs: readonly EvalRun[], bar: ShipBar): string {
  return [
    `# ${heading}`,
    "",
    `**Ships: ${bar.ships ? "yes" : "no"}.** Hard checks ${count(bar.hard)}, attribution ${count(bar.attribution)}.`,
    "",
    "| Fixture | Split (≥ 2/3) | Code line (≥ 2/3) | Question spans the thread (≥ 2/3) |",
    "|---|---|---|---|",
    ...bar.perFixture.map((f) => `| ${f.fixture} | ${count(f.split)} | ${count(f.codeLine)} | ${count(f.questionSpansThread)} |`),
    "",
    "| Run | Hard failures | Soft misses | ms | Prompt tokens | Cached | Completion | finishReason | Cost $ |",
    "|---|---|---|---|---|---|---|---|---|",
    ...runs.map(runRow),
    "",
  ].join("\n");
}

function runRow(run: EvalRun): string {
  const misses = Object.entries(run.soft).filter(([, held]) => !held).map(([score]) => score);
  const cells = [run.label, run.hardFailures.join(", ") || "none", misses.join(", ") || "none", run.ms, run.promptTokens];
  return `| ${[...cells, run.cachedTokens, run.completionTokens, run.finishReason, run.cost?.toFixed(5) ?? "?"].join(" | ")} |`;
}
