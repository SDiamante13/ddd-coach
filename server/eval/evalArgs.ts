import { LIVE_INSTRUCTIONS_VERSION } from "./promptVersions.ts";

export type AbArgs = { candidate: number; live: number; runs: number; target: string[] | null };

const DEFAULT_RUNS = 6;
const MIN_RUNS = 6;

export function abArgsOf(argv: readonly string[]): AbArgs | null {
  if (!argv.includes("--ab")) return null;
  const valueOf = (flag: string) => (argv.includes(flag) ? requiredValue(argv, flag) : undefined);
  const numberOf = (flag: string) => {
    const value = valueOf(flag);
    return value === undefined ? undefined : wholeNumber(flag, value);
  };
  return {
    candidate: numberOf("--ab")!,
    live: numberOf("--live") ?? LIVE_INSTRUCTIONS_VERSION,
    runs: atLeast(MIN_RUNS, "--runs", numberOf("--runs") ?? DEFAULT_RUNS),
    target: valueOf("--target")?.split(",") ?? null,
  };
}

function requiredValue(argv: readonly string[], flag: string): string {
  const value = argv[argv.indexOf(flag) + 1];
  if (value === undefined || value === "" || value.startsWith("--")) throw new Error(`${flag} needs a value`);
  return value;
}

function wholeNumber(flag: string, value: string): number {
  if (!/^\d+$/.test(value)) throw new Error(`${flag} must be a whole number, got ${value}`);
  return Number(value);
}

function atLeast(minimum: number, flag: string, value: number): number {
  if (value < minimum) throw new Error(`${flag} must be a whole number of at least ${minimum}, got ${value}`);
  return value;
}
