export type ChatTurn = { prompt: string; reply: string };
export type ChatRequestBody = { message: string; history: ChatTurn[] };
export type ChatResponseBody = { reply: string } | { error: string };

export const COACH_UNAVAILABLE = "The coach is unavailable. Try again.";
export const COACH_TIMED_OUT = "The coach took too long. Try a shorter question or Retry.";
export const COACH_TOO_LONG = "This conversation is too long for the coach. Reload the page to start a new one.";
