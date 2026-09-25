import { abVerdict, drop, gatingRows, isRegression, reportedOnlyRows, type AbVerdict, type Arm, type ArmRun, type CheckRow } from "./abVerdict.ts";
import { median } from "./latency.ts";
import type { Tally } from "./shipBar.ts";

export type SummaryArmRun = ArmRun & { ms: number; cost: number | null };
export type AbReport = {
  model: string;
  reasoningEffort: string;
  liveVersion: number;
  candidateVersion: number;
  n: number;
  target: string[] | null;
  aborted: string | null;
  runs: SummaryArmRun[];
};

const count = ({ passed, total }: Tally): string => `${passed}/${total}`;
const signed = (delta: number): string => (delta > 0 ? `+${delta}` : `${delta}`);

export function abSummary(report: AbReport): string {
  return [headingOf(report), "", verdictLine(report), "", ...pairedTable(report), "", ...reportedOnlyTable(report), "", budgetLine(report), ""].join("\n");
}

function headingOf({ model, reasoningEffort, liveVersion, candidateVersion, n }: AbReport): string {
  return `# A/B: candidate v${candidateVersion} against live v${liveVersion}, ${model}, effort ${reasoningEffort}, n=${n} per arm`;
}

function verdictLine({ runs, target, aborted }: AbReport): string {
  if (aborted !== null) return `**No verdict:** the run aborted (${aborted}); missing runs are not scored.`;
  const verdict = abVerdict(runs, target);
  if (verdict === null || target === null) return "**No verdict:** name the targeted failure with `--target`.";
  const { live, candidate, gain } = verdict.target;
  const targetText = `Target (${target.join(", ")}) live ${count(live)} → candidate ${count(candidate)} (${signed(gain)}, needs +2)`;
  return `**Ship: ${verdict.ships ? "yes" : "no"}.** ${targetText}; ${regressionText(verdict)}.`;
}

function regressionText({ regressions }: AbVerdict): string {
  if (regressions.length === 0) return "no gating check dropped by more than one run";
  const dropped = regressions.map(({ fixture, check, live, candidate }) => `${fixture} ${check} ${count(live)} → ${count(candidate)}`);
  return `dropped by two or more runs: ${dropped.join(", ")}`;
}

function pairedTable({ runs, n }: AbReport): string[] {
  const rows = gatingRows(runs);
  const totalDrop = rows.reduce((sum, row) => sum + Math.max(0, drop(row)), 0);
  return [
    ...tableOf(rows, (row) => (isRegression(row) ? "dropped 2+" : "")),
    "",
    `All other gating checks ${n}/${n} in both arms. Total drop across fixtures: ${totalDrop} runs.`,
  ];
}

function tableOf(rows: readonly CheckRow[], flagOf: (row: CheckRow) => string): string[] {
  const cells = (row: CheckRow) => [row.fixture, row.check, count(row.live), count(row.candidate), signed(-drop(row)), flagOf(row)];
  return ["| Fixture | Check | Live | Candidate | Δ | Flag |", "|---|---|---|---|---|---|", ...rows.map((row) => `| ${cells(row).join(" | ")} |`)];
}

function reportedOnlyTable({ runs }: AbReport): string[] {
  return ["Reported only, never gates:", "", ...tableOf(reportedOnlyRows(runs), () => "(reported only)")];
}

function budgetLine({ runs }: AbReport): string {
  if (runs.length === 0) return "Budget: no calls finished.";
  const costOf = (arm: Arm) => dollars(runs.filter((run) => run.arm === arm));
  const ms = runs.map((run) => run.ms);
  const spend = `live ${costOf("live")}, candidate ${costOf("candidate")}, total ${dollars(runs)} over ${runs.length} calls`;
  return `Budget: ${spend}; median ${median(ms)} ms, max ${Math.max(...ms)} ms.`;
}

const dollars = (runs: readonly SummaryArmRun[]): string => `$${runs.reduce((sum, run) => sum + (run.cost ?? 0), 0).toFixed(4)}`;
