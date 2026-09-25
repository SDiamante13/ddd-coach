// @vitest-environment node
import { describe, expect, it } from "vitest";
import { conversationOf } from "../src/test/conversations.ts";
import { createTurnSigner, verifyConversation } from "./turnSignature.ts";

const signer = createTurnSigner("test-signing-key-0123456789abcdefghijklmnop");
const BASE64URL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function signedTurn(prompt: string, reply: string) {
  return { prompt, reply, signature: signer.sign({ prompt, reply }) };
}

function withSignature(signature: string) {
  return { ...signedTurn("A", "R1"), signature };
}

function sameBytesVariant(signature: string): string {
  const last = BASE64URL.indexOf(signature.at(-1) ?? "");
  return signature.slice(0, -1) + BASE64URL.charAt(last ^ 1);
}

function turnSignedWithUrlSafeCharacters() {
  const turn = Array.from({ length: 20 }, (_, n) => signedTurn(`A${n}`, "R1")).find(({ signature }) =>
    /[-_]/.test(signature),
  );
  if (!turn) throw new Error("No signature with - or _ among 20 turns");
  return turn;
}

describe("turn signer", () => {
  it("signs a turn deterministically as 43 base64url characters", () => {
    const signature = signer.sign({ prompt: "A", reply: "R1" });

    expect(signature).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(signer.sign({ prompt: "A", reply: "R1" })).toBe(signature);
  });

  it("verifies a turn it signed", () => {
    expect(signer.verifies(signedTurn("A", "R1"))).toBe(true);
  });

  it.each([
    ["a changed prompt", { ...signedTurn("A", "R1"), prompt: "B" }],
    ["a changed reply", { ...signedTurn("A", "R1"), reply: "R2" }],
    ["another key's signature", withSignature(createTurnSigner("x".repeat(43)).sign({ prompt: "A", reply: "R1" }))],
    ["an empty signature", withSignature("")],
    ["a 42-character signature", withSignature("s".repeat(42))],
    ["a 44-character signature", withSignature("s".repeat(44))],
    ["43 characters that are longer in bytes", withSignature(`é${"s".repeat(42)}`)],
  ])("refuses %s without throwing", (_case, turn) => {
    expect(signer.verifies(turn)).toBe(false);
  });

  it("refuses a signature that decodes to the same bytes but is written differently", () => {
    const turn = signedTurn("A", "R1");

    expect(Buffer.from(sameBytesVariant(turn.signature), "base64url")).toEqual(Buffer.from(turn.signature, "base64url"));
    expect(signer.verifies({ ...turn, signature: sameBytesVariant(turn.signature) })).toBe(false);
  });

  it("refuses a signature written in standard base64 instead of base64url", () => {
    const turn = turnSignedWithUrlSafeCharacters();
    const standard = turn.signature.replaceAll("-", "+").replaceAll("_", "/");

    expect(signer.verifies({ ...turn, signature: standard })).toBe(false);
  });

  it("signs a prompt and reply split at different points differently", () => {
    expect(signer.sign({ prompt: "ab", reply: "c" })).not.toBe(signer.sign({ prompt: "a", reply: "bc" }));
  });

  it.each([
    ["a lone surrogate", "\uD800 unpaired"],
    ["emoji", "Ship it 🚢📦"],
  ])("verifies a reply containing %s", (_case, reply) => {
    expect(signer.verifies(signedTurn("A", reply))).toBe(true);
  });
});

describe("verifyConversation", () => {
  it("trusts a conversation whose every turn is signed", () => {
    const conversation = conversationOf("C", [signedTurn("A", "R1"), signedTurn("B", "R2")]);

    expect(verifyConversation(signer, conversation)).toBe(conversation);
  });

  it("refuses a conversation with any unsigned turn", () => {
    const conversation = conversationOf("C", [signedTurn("A", "R1"), { ...signedTurn("B", "R2"), reply: "R3" }]);

    expect(verifyConversation(signer, conversation)).toBeNull();
  });

  it("trusts a conversation without history", () => {
    const conversation = conversationOf("A");

    expect(verifyConversation(signer, conversation)).toBe(conversation);
  });
});
