import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { addSwap, openSwaps, startConversation } from "../test/appDriver.tsx";

afterEach(() => vi.unstubAllGlobals());

async function swappedConversation(reply: string) {
  const conversation = await startConversation();
  await addSwap(conversation.user, "Acme Foods", "Customer A");
  conversation.server.reply(await conversation.send("Acme Foods wants the lane re-rated."), 200, { reply, signature: "sig-1" });
  return conversation;
}

describe("Restoring real names", () => {
  it("shows a reply with the real name in place of its placeholder", async () => {
    const { log } = await swappedConversation("Customer A is split on rebook.");

    expect(await within(log()).findByText("Acme Foods is split on rebook.")).toBeInTheDocument();
  });

  it("marks a reply whose names were restored in this browser", async () => {
    const { log } = await swappedConversation("Customer A is split on rebook.");
    await within(log()).findByText("Acme Foods is split on rebook.");

    expect(within(log()).getByText("Names restored in this browser from your swaps.")).toBeInTheDocument();
  });

  it("keeps the placeholders in the You bubble and in the history sent back", async () => {
    const { log, send, server } = await swappedConversation("Customer A is split on rebook.");
    await within(log()).findByText("Acme Foods is split on rebook.");

    await send("Which of those are guesses?");

    expect(within(log()).getByText("Customer A wants the lane re-rated.")).toBeInTheDocument();
    expect(server.bodyOf(1)).toMatchObject({
      history: [{ prompt: "Customer A wants the lane re-rated.", reply: "Customer A is split on rebook.", signature: "sig-1" }],
    });
  });

  it("shows the reply as sent, unmarked, once its swap is removed", async () => {
    const { user, log } = await swappedConversation("Customer A is split on rebook.");
    await within(log()).findByText("Acme Foods is split on rebook.");

    await openSwaps(user);
    await user.click(screen.getByRole("button", { name: "Remove swap Acme Foods" }));

    expect(within(log()).getByText("Customer A is split on rebook.")).toBeInTheDocument();
    expect(within(log()).queryByText("Names restored in this browser from your swaps.")).not.toBeInTheDocument();
  });

  it("copies the conversation with the real names restored", async () => {
    const { user, log } = await swappedConversation("Customer A is split on rebook.");
    await within(log()).findByText("Acme Foods is split on rebook.");

    await user.click(screen.getByRole("button", { name: "New conversation" }));
    const question = screen.getByRole("group", { name: "Clear this conversation?" });
    await user.click(within(question).getByRole("button", { name: "Copy first" }));

    expect(await navigator.clipboard.readText()).toBe("You: Acme Foods wants the lane re-rated.\nCoach: Acme Foods is split on rebook.");
  });

  it("restores names inside a laid-out reply's table, question and source lines", async () => {
    const reply = [
      "Words that don't match",
      '"booking"',
      "- From thread: Finance means a Customer A load once it's invoiceable.",
      "",
      "Question for the ops lead: For Customer A's load 48213, which count includes the new row?",
      'From thread: "Customer A rebooked twice this week"',
      'From thread: "finance only needs one invoice per shipment"',
    ].join("\n");
    const { log } = await swappedConversation(reply);
    const table = await within(log()).findByRole("table", { name: "Words that don't match" });
    const card = screen.getByRole("region", { name: "Question" });

    expect(within(table).getByText("A Acme Foods load once it's invoiceable.")).toBeInTheDocument();
    expect(within(card).getByText("For Acme Foods's load 48213, which count includes the new row?")).toBeInTheDocument();
    expect(within(card).getByText("“Acme Foods rebooked twice this week”")).toBeInTheDocument();
  });
});
