import { within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { shortDate } from "../domain/dates.ts";
import { addSwap, startConversation } from "../test/appDriver.tsx";

const WORDS_REPLY = [
  "Words that don't match",
  '"rebook"',
  "- From thread: Ops (day desk) means a date change with the same carrier is AMENDED.",
  "- Guess: Code counts both rows of a rebook.",
  "",
  "Question for the ops lead and the finance controller, at the 27 Oct review: For load 48213, which count includes the new row?",
  'From thread: "carrier billed TONU on orig load, then hauled the new one"',
].join("\n");

const QUESTION_ONLY = "Question for the ops lead: For load 48213, which count includes the new row?";

async function replyWith(reply: string) {
  const conversation = await startConversation();
  conversation.server.reply(await conversation.send("Here is our #booking-split thread."), 200, { reply, signature: "sig-1" });
  return conversation;
}

describe("Copy for your repo", () => {
  it("puts a GLOSSARY.md and a CLAUDE.md section on the clipboard", async () => {
    const { user, log } = await replyWith(WORDS_REPLY);

    await user.click(await within(log()).findByRole("button", { name: "Copy for your repo" }));

    const copied = await navigator.clipboard.readText();
    expect(copied).toContain("# Glossary");
    expect(copied).toContain("## Domain language (from GLOSSARY.md");
  });

  it("isn't offered under a reply without a term table", async () => {
    const { log } = await replyWith(QUESTION_ONLY);
    await within(log()).findByRole("button", { name: "Copy for your RFC" });

    expect(within(log()).queryByRole("button", { name: "Copy for your repo" })).not.toBeInTheDocument();
  });

  it("stamps the day it was copied, so a coding agent doesn't doubt the file", async () => {
    const { user, log } = await replyWith(WORDS_REPLY);

    await user.click(await within(log()).findByRole("button", { name: "Copy for your repo" }));

    expect(await navigator.clipboard.readText()).toContain(`As of ${shortDate(new Date())}.`);
  });

  it("says it copied and how many terms are still unsettled", async () => {
    const { user, log } = await replyWith(WORDS_REPLY);

    await user.click(await within(log()).findByRole("button", { name: "Copy for your repo" }));

    expect(await within(log()).findByText("Copied for your repo: GLOSSARY.md, then a section for CLAUDE.md. 1 term is still unsettled.")).toHaveAttribute(
      "role",
      "status",
    );
  });

  it("copies the real names restored from the swap list, never the placeholders", async () => {
    const { user, log, server, send } = await startConversation();
    await addSwap(user, "Acme Foods", "Customer A");
    server.reply(await send("Acme Foods rebooked twice."), 200, { reply: WORDS_REPLY.replace("For load 48213", "For Customer A's load 48213"), signature: "sig-1" });

    await user.click(await within(log()).findByRole("button", { name: "Copy for your repo" }));

    const copied = await navigator.clipboard.readText();
    expect(copied).toContain("For Acme Foods's load 48213");
    expect(copied).not.toContain("Customer A");
  });
});
