import { createHmac, timingSafeEqual } from "node:crypto";
import type { Conversation, Turn } from "../src/domain/conversation.ts";

export type VerifiedConversation = Conversation & { readonly __brand: "VerifiedConversation" };
export type SignableTurn = { prompt: string; reply: string };
export type TurnSigner = { sign(turn: SignableTurn): string; verifies(turn: Turn): boolean };

const TURN_TAG = "ddd-coach/turn/v1";

export function createTurnSigner(key: string): TurnSigner {
  const sign = ({ prompt, reply }: SignableTurn): string =>
    createHmac("sha256", key).update(JSON.stringify([TURN_TAG, prompt, reply])).digest("base64url");
  return { sign, verifies: (turn) => sameText(turn.signature, sign(turn)) };
}

export function verifyConversation(signer: TurnSigner, conversation: Conversation): VerifiedConversation | null {
  const trusted = conversation.history.every((turn) => signer.verifies(turn));
  return trusted ? (conversation as VerifiedConversation) : null;
}

function sameText(actual: string, expected: string): boolean {
  const actualBytes = Buffer.from(actual);
  const expectedBytes = Buffer.from(expected);
  return actualBytes.length === expectedBytes.length && timingSafeEqual(actualBytes, expectedBytes);
}
