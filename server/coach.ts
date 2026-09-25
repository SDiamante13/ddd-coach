import type { VerifiedConversation } from "./turnSignature.ts";

export interface Coach {
  reply(conversation: VerifiedConversation): Promise<string>;
}
