import type { SoftScores } from "./replyChecks.ts";

export type ScoredRun = { fixture: string; hardFailures: string[]; soft: SoftScores };
export type Tally = { passed: number; total: number };
export type ShipBar = ReturnType<typeof shipBar>;
type FixtureTallies = ReturnType<typeof fixtureTallies>;

export const REPORTED_ONLY_HARD: readonly string[] = ["same meaning not split", "no merged split", "settled not relisted"];

const EVERY_RUN_SCORES = ["split", "codeLine", "questionSpansThread"] as const;
const TALLIED_SCORES = [...EVERY_RUN_SCORES, "sameMeaningNamed"] as const;

export function shipBar(runs: readonly ScoredRun[]) {
  const hard = tally(runs, (run) => run.hardFailures.every((check) => REPORTED_ONLY_HARD.includes(check)));
  const attribution = tally(runs, (run) => run.soft.attribution);
  const perFixture = fixturesOf(runs).map((fixture) => fixtureTallies(fixture, runs));
  const ships = isFull(hard) && isFull(attribution) && perFixture.every(holdsInEveryRun);
  return { ships, hard, attribution, perFixture };
}

function fixtureTallies(fixture: string, runs: readonly ScoredRun[]) {
  const own = runs.filter((run) => run.fixture === fixture);
  const [split, codeLine, questionSpansThread, sameMeaningNamed] = TALLIED_SCORES.map((score) =>
    tally(own, (run) => run.soft[score]),
  );
  return { fixture, split: split!, codeLine: codeLine!, questionSpansThread: questionSpansThread!, sameMeaningNamed: sameMeaningNamed! };
}

function holdsInEveryRun(tallies: FixtureTallies): boolean {
  return EVERY_RUN_SCORES.every((score) => isFull(tallies[score]));
}

function tally(runs: readonly ScoredRun[], passes: (run: ScoredRun) => boolean): Tally {
  return { passed: runs.filter(passes).length, total: runs.length };
}

const isFull = ({ passed, total }: Tally): boolean => passed === total;

function fixturesOf(runs: readonly ScoredRun[]): string[] {
  return [...new Set(runs.map((run) => run.fixture))];
}
