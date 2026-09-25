import type { EvalRun } from "./fullEval.ts";
import type { ShipBar, Tally } from "./shipBar.ts";

export type SummaryRun = Omit<EvalRun, "prompt">;

const count = ({ passed, total }: Tally) => `${passed}/${total}`;

export function evalSummary(heading: string, runs: readonly SummaryRun[], bar: ShipBar): string {
  return [
    `# ${heading}`,
    "",
    `**Every run clean: ${bar.ships ? "yes" : "no"}.** Hard checks ${count(bar.hard)} (same meaning not split is reported only, #76), attribution ${count(bar.attribution)}.`,
    "",
    "| Fixture | Split | Code line | Question spans the thread | Same meaning named (reported only, #76) |",
    "|---|---|---|---|---|",
    ...bar.perFixture.map(fixtureRow),
    "",
    "| Run | Hard failures | Soft misses | ms | Prompt tokens | Cached | Completion | finishReason | Cost $ |",
    "|---|---|---|---|---|---|---|---|---|",
    ...runs.map(runRow),
    "",
  ].join("\n");
}

function fixtureRow(f: ShipBar["perFixture"][number]): string {
  const tallies = [f.split, f.codeLine, f.questionSpansThread, f.sameMeaningNamed].map(count);
  return `| ${[f.fixture, ...tallies].join(" | ")} |`;
}

function runRow(run: SummaryRun): string {
  const misses = Object.entries(run.soft).filter(([, held]) => !held).map(([score]) => score);
  const cells = [run.label, run.hardFailures.join(", ") || "none", misses.join(", ") || "none", run.ms, run.promptTokens];
  return `| ${[...cells, run.cachedTokens, run.completionTokens, run.finishReason, run.cost?.toFixed(5) ?? "?"].join(" | ")} |`;
}
