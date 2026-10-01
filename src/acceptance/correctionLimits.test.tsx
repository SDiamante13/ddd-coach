import { screen, within } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { pasteInto, startConversation } from "../test/appDriver.tsx";
import { WORDS_PASTE } from "../test/wordReplies.ts";

vi.mock("../shared/features.ts", () => ({ GLOSSARY_ENABLED: false, CORRECTIONS_ENABLED: true }));

afterEach(() => vi.unstubAllGlobals());

const board = () => screen.getByRole("region", { name: "Event board" });
const rowOf = (word: string) => within(within(board()).getByRole("listitem", { name: new RegExp(`^Term “${word}”`) })).getAllByRole("listitem")[0]!;
const wordsReply = (count: number) => ["Words that don't match", ...Array.from({ length: count }, (_, index) => [`"word${index + 1}"`, `- Guess: Ops means meaning ${index + 1}.`]).flat()].join("\n");

async function onTheWords(count: number) {
  const app = await startConversation();
  app.server.reply(await app.send(WORDS_PASTE), 200, { reply: wordsReply(count), signature: "sig" });
  await within(board()).findByRole("listitem", { name: /^Term “word1”/ });
  return app;
}

async function correctRow(user: UserEvent, word: string, text: string) {
  await user.click(within(rowOf(word)).getByRole("button", { name: "I checked" }));
  await user.click(within(rowOf(word)).getByRole("button", { name: "No, it's wrong" }));
  const field = within(rowOf(word)).getByRole("textbox", { name: "Correct this meaning" });
  await user.clear(field);
  await pasteInto(user, field, text);
  await user.keyboard("{Enter}");
}

type Sent = { was: string; now: string };
const sentCorrections = (app: Awaited<ReturnType<typeof onTheWords>>): Sent[] => (app.server.bodyOf(1) as { corrections: Sent[] }).corrections;

describe("Corrections the server will take (#90, #95)", () => {
  it("shortens a correction past 300 characters with an ellipsis instead of losing the message", async () => {
    const app = await onTheWords(1);
    await correctRow(app.user, "word1", "x".repeat(400));

    await app.send("And the next part.");

    const [sent] = sentCorrections(app);
    expect(sent!.now).toHaveLength(300);
    expect(sent!.now.endsWith("…")).toBe(true);
  });

  it("sends only the 20 most recent corrections, so the server never refuses the message for too many", async () => {
    const app = await onTheWords(21);
    for (let index = 21; index >= 1; index--) await correctRow(app.user, `word${index}`, `Fixed ${index}.`);

    await app.send("And the next part.");

    const sent = sentCorrections(app);
    expect(sent).toHaveLength(20);
    expect(sent.map(({ now }) => now)).not.toContain("word21 (Ops): Fixed 21.");
  });
});
