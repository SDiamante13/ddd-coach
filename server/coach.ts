import type { Conversation } from "../src/domain/conversation.ts";

export interface Coach {
  reply(conversation: Conversation): Promise<string>;
}
