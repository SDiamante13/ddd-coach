import { conversationOf } from "../../src/test/conversations.ts";
import type { VerifiedConversation } from "../turnSignature.ts";

export function verifiedConversationOf(...args: Parameters<typeof conversationOf>): VerifiedConversation {
  return conversationOf(...args) as VerifiedConversation;
}
