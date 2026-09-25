import type { Prompt } from "../src/domain/exchange.ts";

export interface Coach {
  reply(prompt: Prompt): Promise<string>;
}
