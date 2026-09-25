import type { VerifiedConversation } from "./turnSignature.ts";

export interface Coach {
  reply(conversation: VerifiedConversation): Promise<string>;
}

export class CoachOutOfCredit extends Error {
  override name = "CoachOutOfCredit";
  readonly statusCode = 402;

  constructor() {
    super("The coach's usage budget is spent.");
  }
}
