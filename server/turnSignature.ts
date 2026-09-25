import { createHmac } from "node:crypto";
import type { Conversation } from "../src/domain/conversation.ts";
import { sameText } from "./constantTime.ts";

export type VerifiedConversation = Conversation & { readonly __brand: "VerifiedConversation" };
export type SignableTurn = { prompt: string; reply: string };
export type SignedTurn = SignableTurn & { signature: string };
export type TurnSigner = { sign(turn: SignableTurn): string; verifies(turn: SignedTurn): boolean };

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
