import type { SoftScores } from "./replyChecks.ts";
import type { ScoredRun, Tally } from "./shipBar.ts";

export type Arm = "live" | "candidate";
export type ArmRun = ScoredRun & { arm: Arm };
export type AbVerdict = NonNullable<ReturnType<typeof abVerdict>>;
export type CheckRow = { fixture: string; check: string; live: Tally; candidate: Tally };

const REPORTED_ONLY_HARD = ["same meaning not split"];
const GATING_SOFT: readonly (keyof SoftScores)[] = ["attribution", "split", "codeLine", "questionSpansThread"];
const TARGET_GAIN = 2;
const NOISE_RUNS = 1;

export function abVerdict(runs: readonly ArmRun[], target: readonly string[] | null) {
  fixturesOf(runs).forEach((fixture) => assertPaired(fixture, runs));
  if (target === null) return null;
  const { live, candidate } = targetTallies(runs, target);
  const regressions = gatingRows(runs).filter(isRegression);
  const targetRow = { live, candidate, gain: candidate.passed - live.passed };
  return { ships: targetRow.gain >= TARGET_GAIN && regressions.length === 0, target: targetRow, regressions };
}

function assertPaired(fixture: string, runs: readonly ArmRun[]): void {
  const count = (arm: Arm) => runs.filter((run) => run.fixture === fixture && run.arm === arm).length;
  if (count("live") !== count("candidate")) {
    throw new Error(`${fixture} has ${count("live")} live runs but ${count("candidate")} candidate runs`);
  }
}

function targetTallies(runs: readonly ArmRun[], target: readonly string[]) {
  const perEntry = target.map((entry) => {
    const [fixture, check] = entry.split(":");
    const own = runs.filter((run) => run.fixture === fixture);
    return armTallies(own, (run) => (check === undefined ? isClean(run) : passes(run, check)));
  });
  return { live: sum(perEntry.map((row) => row.live)), candidate: sum(perEntry.map((row) => row.candidate)) };
}

const sum = (tallies: readonly Tally[]): Tally =>
  tallies.reduce((total, { passed, total: n }) => ({ passed: total.passed + passed, total: total.total + n }), { passed: 0, total: 0 });

export const gatingRows = (runs: readonly ArmRun[]): CheckRow[] => rowsOf(runs, gatingMisses);

export const reportedOnlyRows = (runs: readonly ArmRun[]): CheckRow[] => rowsOf(runs, reportedOnlyMisses);

function rowsOf(runs: readonly ArmRun[], missesOf: (run: ScoredRun) => string[]): CheckRow[] {
  return fixturesOf(runs).flatMap((fixture) => {
    const own = runs.filter((run) => run.fixture === fixture);
    const checks = [...new Set(own.flatMap(missesOf))];
    return checks.map((check) => ({ fixture, check, ...armTallies(own, (run) => passes(run, check)) }));
  });
}

export const drop = ({ live, candidate }: CheckRow): number => live.passed - candidate.passed;

export const isRegression = (row: CheckRow): boolean => drop(row) > NOISE_RUNS;

function gatingMisses(run: ScoredRun): string[] {
  const hard = run.hardFailures.filter((check) => !REPORTED_ONLY_HARD.includes(check));
  return [...hard, ...GATING_SOFT.filter((score) => !run.soft[score])];
}

function reportedOnlyMisses(run: ScoredRun): string[] {
  const hard = run.hardFailures.filter((check) => REPORTED_ONLY_HARD.includes(check));
  const soft = Object.entries(run.soft).filter(([score, held]) => !held && !GATING_SOFT.includes(score as keyof SoftScores));
  return [...hard, ...soft.map(([score]) => score)];
}

function passes(run: ScoredRun, check: string): boolean {
  return check in run.soft ? run.soft[check as keyof SoftScores] : !run.hardFailures.includes(check);
}

function armTallies(runs: readonly ArmRun[], passing: (run: ScoredRun) => boolean) {
  return { live: tally(runs.filter((run) => run.arm === "live"), passing), candidate: tally(runs.filter((run) => run.arm === "candidate"), passing) };
}

const isClean = (run: ScoredRun): boolean => run.hardFailures.every((check) => REPORTED_ONLY_HARD.includes(check));

function tally(runs: readonly ScoredRun[], passing: (run: ScoredRun) => boolean): Tally {
  return { passed: runs.filter(passing).length, total: runs.length };
}

function fixturesOf(runs: readonly ScoredRun[]): string[] {
  return [...new Set(runs.map((run) => run.fixture))];
}
