import { conversationOf } from "../../src/test/conversations.ts";
import { createTurnSigner, type SignedTurn, type VerifiedConversation } from "../turnSignature.ts";

export const TEST_SIGNING_KEY = "test-signing-key-0123456789abcdefghijklmnop";
const testSigner = createTurnSigner(TEST_SIGNING_KEY);

export function verifiedConversationOf(...args: Parameters<typeof conversationOf>): VerifiedConversation {
  return conversationOf(...args) as VerifiedConversation;
}

export function signedTurn(prompt: string, reply: string): SignedTurn {
  return { prompt, reply, signature: testSigner.sign({ prompt, reply }) };
}
