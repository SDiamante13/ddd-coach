export type LatencyVerdict = { medianMs: number; maxMs: number; pullStreamingAhead: boolean };

const MEDIAN_LIMIT_MS = 15_000;
const RUN_LIMIT_MS = 22_000;

export function latencyVerdict(firstTurnMs: readonly number[]): LatencyVerdict {
  const medianMs = median(firstTurnMs);
  const maxMs = Math.max(...firstTurnMs);
  return { medianMs, maxMs, pullStreamingAhead: medianMs > MEDIAN_LIMIT_MS || maxMs > RUN_LIMIT_MS };
}

export function median(values: readonly number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}
