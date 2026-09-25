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
  const upper = Math.floor(sorted.length / 2);
  const middle = sorted.length % 2 === 0 ? sorted.slice(upper - 1, upper + 1) : sorted.slice(upper, upper + 1);
  return middle.length === 0 ? 0 : middle.reduce((sum, value) => sum + value, 0) / middle.length;
}

const NONCE_WORDING = "Pasted at";

export function nonceLine(pastedAt: Date): string {
  return `(${NONCE_WORDING} ${pastedAt.toISOString()}.)`;
}

export function mentionsNonce(reply: string, pastedAt: Date, thread = ""): boolean {
  const text = reply.toLowerCase();
  const verbatim = text.includes(pastedAt.toISOString().toLowerCase()) || text.includes(NONCE_WORDING.toLowerCase());
  const ownForms = restatedForms(pastedAt).filter((form) => !form.test(thread));
  return verbatim || ownForms.some((form) => form.test(reply));
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function restatedForms(at: Date): RegExp[] {
  return [clockTime(at), ...dateForms(at)];
}

function clockTime(at: Date): RegExp {
  const hours = at.getUTCHours();
  const minutes = String(at.getUTCMinutes()).padStart(2, "0");
  return new RegExp(String.raw`(?<![\d:])${hours < 10 ? "0?" : ""}${hours}:${minutes}(?::\d{2})?(?![\d:])`);
}

function dateForms(at: Date): RegExp[] {
  const day = at.getUTCDate();
  const month = MONTHS[at.getUTCMonth()]!;
  const monthName = `(?:${month.slice(0, 3)}|${month})`;
  const forms = [at.toISOString().slice(0, 10), `${monthName}\\.? ${day}`, `${day} ${monthName}`];
  return forms.map((form) => new RegExp(String.raw`(?<!\d)${form}(?!\d)`, "i"));
}
