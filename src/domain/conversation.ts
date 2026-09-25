import type { Prompt } from "./exchange.ts";

export type Turn = { prompt: Prompt; reply: string };
export type Conversation = { history: readonly Turn[]; prompt: Prompt };
