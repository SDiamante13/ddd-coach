import { createHmac } from "node:crypto";

export type SignableTurn = { prompt: string; reply: string };
export type TurnSigner = { sign(turn: SignableTurn): string };

const TURN_TAG = "ddd-coach/turn/v1";

export function createTurnSigner(key: string): TurnSigner {
  return {
    sign: ({ prompt, reply }) =>
      createHmac("sha256", key).update(JSON.stringify([TURN_TAG, prompt, reply])).digest("base64url"),
  };
}
