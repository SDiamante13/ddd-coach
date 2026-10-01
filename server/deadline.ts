export const TIMED_OUT = Symbol("timed out");

export async function withDeadline<T>(work: (signal: AbortSignal) => Promise<T>, deadlineMs: number): Promise<T | typeof TIMED_OUT> {
  const abort = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<typeof TIMED_OUT>((resolve) => {
    timer = setTimeout(() => {
      abort.abort();
      resolve(TIMED_OUT);
    }, deadlineMs);
  });
  try {
    return await Promise.race([work(abort.signal), deadline]);
  } finally {
    clearTimeout(timer);
  }
}
