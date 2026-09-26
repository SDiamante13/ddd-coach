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

export class CoachKeyRejected extends Error {
  override name = "CoachKeyRejected";
  readonly statusCode = 401;

  constructor() {
    super("The provider rejected the coach's API key: it has expired or is invalid.");
  }
}

export class CoachBusy extends Error {
  override name = "CoachBusy";
  readonly statusCode = 402;

  constructor(readonly retryAfterSeconds: number) {
    super("The coach's in-flight budget is briefly used up.");
  }
}
