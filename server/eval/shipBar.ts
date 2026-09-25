import type { SoftScores } from "./replyChecks.ts";

export type ScoredRun = { fixture: string; hardFailures: string[]; soft: SoftScores };
export type Tally = { passed: number; total: number };
export type ShipBar = ReturnType<typeof shipBar>;
type FixtureTallies = ReturnType<typeof fixtureTallies>;

const TWO_THIRDS_SCORES = ["split", "codeLine", "questionSpansThread"] as const;

export function shipBar(runs: readonly ScoredRun[]) {
  const hard = tally(runs, (run) => run.hardFailures.length === 0);
  const attribution = tally(runs, (run) => run.soft.attribution);
  const perFixture = fixturesOf(runs).map((fixture) => fixtureTallies(fixture, runs));
  const ships = isFull(hard) && isFull(attribution) && perFixture.every(meetsTwoThirds);
  return { ships, hard, attribution, perFixture };
}

function fixtureTallies(fixture: string, runs: readonly ScoredRun[]) {
  const own = runs.filter((run) => run.fixture === fixture);
  const [split, codeLine, questionSpansThread] = TWO_THIRDS_SCORES.map((score) => tally(own, (run) => run.soft[score]));
  return { fixture, split: split!, codeLine: codeLine!, questionSpansThread: questionSpansThread! };
}

function meetsTwoThirds(tallies: FixtureTallies): boolean {
  return TWO_THIRDS_SCORES.every((score) => isTwoThirds(tallies[score]));
}

function tally(runs: readonly ScoredRun[], passes: (run: ScoredRun) => boolean): Tally {
  return { passed: runs.filter(passes).length, total: runs.length };
}

const isFull = ({ passed, total }: Tally): boolean => passed === total;
const isTwoThirds = ({ passed, total }: Tally): boolean => passed * 3 >= total * 2;

function fixturesOf(runs: readonly ScoredRun[]): string[] {
  return [...new Set(runs.map((run) => run.fixture))];
}
