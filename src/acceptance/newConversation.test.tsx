import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { formatCount, startConversation } from "../test/appDriver.tsx";

afterEach(() => vi.unstubAllGlobals());

const PASTED_THREAD = ["#booking-split (Slack, sanitized)", ...Array(40).fill("Ops: a booking exists at submit.")].join("\n");

describe("New conversation", () => {
  it("starts a new conversation after confirming, keeping the draft and sending no history", async () => {
    const { server, user, input, log, sendAndReply } = await startConversation();
    await sendAndReply("A", "R1", "sig-A");
    await user.type(input(), "Draft");

    await user.click(screen.getByRole("button", { name: "New conversation" }));
    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(within(log()).queryAllByRole("listitem")).toHaveLength(0);
    expect(input()).toHaveValue("Draft");
    expect(input()).toHaveFocus();
    await user.type(input(), "{Enter}");
    expect(server.bodyOf(1)).toEqual({ message: "Draft", history: [] });
  });

  it("starts the new conversation with the last pasted thread by default, not the follow-up draft (#68)", async () => {
    const { user, input, sendAndReply } = await startConversation();
    await sendAndReply(PASTED_THREAD, "R1", "sig-A");
    await sendAndReply("And what about 48102?", "R2", "sig-B");
    await user.type(input(), "One more");

    await user.click(screen.getByRole("button", { name: "New conversation" }));
    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(input()).toHaveValue(PASTED_THREAD);
    expect(input()).toHaveFocus();
    expect((input() as HTMLTextAreaElement).selectionStart).toBe(PASTED_THREAD.length);
  });

  it("names the pasted thread by size and first line, and keeps just the draft when chosen (#68)", async () => {
    const { user, input, sendAndReply } = await startConversation();
    await sendAndReply(PASTED_THREAD, "R1", "sig-A");
    await user.type(input(), "And what about 48102?");

    await user.click(screen.getByRole("button", { name: "New conversation" }));
    const choice = screen.getByRole("radiogroup", { name: "Start the new one with:" });
    expect(within(choice).getByRole("radio", { name: /^Your pasted thread/ })).toBeChecked();
    expect(within(choice).getByRole("radio", { name: /^Your pasted thread/ })).toHaveAccessibleName(
      `Your pasted thread (${formatCount(PASTED_THREAD.length)} characters, "#booking-split (Slack, sanitized)…")`,
    );
    await user.click(within(choice).getByRole("radio", { name: 'Just your draft ("And what about 48102?")' }));
    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(input()).toHaveValue("And what about 48102?");
  });

  it("offers no choice when nothing long was pasted (#68)", async () => {
    const { user, sendAndReply } = await startConversation();
    await sendAndReply("A", "R1", "sig-A");

    await user.click(screen.getByRole("button", { name: "New conversation" }));

    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });

  it("offers a new conversation again, without asking, once the cleared conversation restarts", async () => {
    const { user, sendAndReply } = await startConversation();
    await sendAndReply("A", "R1", "sig-A");
    await user.click(screen.getByRole("button", { name: "New conversation" }));
    await user.click(screen.getByRole("button", { name: "Clear" }));

    await sendAndReply("B", "R2", "sig-B");

    expect(screen.getByRole("button", { name: "New conversation" })).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Clear this conversation?" })).not.toBeInTheDocument();
  });

  it("asks with focus on Keep, and keeps the conversation with focus back on New conversation", async () => {
    const { user, log, sendAndReply } = await startConversation();
    await sendAndReply("A", "R1", "sig-A");

    await user.click(screen.getByRole("button", { name: "New conversation" }));
    const question = screen.getByRole("group", { name: "Clear this conversation?" });
    expect(within(question).getByRole("button", { name: "Keep" })).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(within(log()).getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "New conversation" })).toHaveFocus();
  });

  it("says what clearing takes away and what it keeps", async () => {
    const { user, sendAndReply } = await startConversation();
    await sendAndReply("A", "R1", "sig-A");

    await user.click(screen.getByRole("button", { name: "New conversation" }));

    expect(screen.getByRole("group", { name: "Clear this conversation?" })).toHaveAccessibleDescription(
      "The log and history go; your draft stays.",
    );
  });

  it("copies the conversation from the question before clearing it", async () => {
    const { user, log, sendAndReply } = await startConversation();
    await sendAndReply("A", "R1", "sig-A");

    await user.click(screen.getByRole("button", { name: "New conversation" }));
    const question = screen.getByRole("group", { name: "Clear this conversation?" });
    await user.click(within(question).getByRole("button", { name: "Copy first" }));

    expect(await navigator.clipboard.readText()).toBe("You: A\nCoach: R1");
    expect(within(question).getByRole("button", { name: "Copied" })).toBeInTheDocument();
    expect(within(log()).getAllByRole("listitem")).toHaveLength(1);
  });

  it("lets the conversation be cleared only once no reply is pending", async () => {
    const { server, user, send, sendAndReply } = await startConversation();
    await sendAndReply("A", "R1", "sig-A");
    await user.click(screen.getByRole("button", { name: "New conversation" }));

    const pending = await send("B");

    expect(screen.getByRole("button", { name: "Clear" })).toBeDisabled();
    server.reply(pending, 200, { reply: "R2", signature: "sig-B" });
    await within(screen.getByRole("log")).findByText("R2");
    expect(screen.getByRole("button", { name: "Clear" })).toBeEnabled();
  });
});
