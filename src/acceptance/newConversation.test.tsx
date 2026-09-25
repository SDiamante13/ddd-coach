import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { startConversation } from "../test/appDriver.tsx";

afterEach(() => vi.unstubAllGlobals());

describe("New conversation", () => {
  it("starts a new conversation after confirming, keeping the draft and sending no history", async () => {
    const { server, user, input, log, sendAndReply } = startConversation();
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

  it("asks with focus on Keep, and keeps the conversation with focus back on New conversation", async () => {
    const { user, log, sendAndReply } = startConversation();
    await sendAndReply("A", "R1", "sig-A");

    await user.click(screen.getByRole("button", { name: "New conversation" }));
    const question = screen.getByRole("group", { name: "Clear this conversation?" });
    expect(within(question).getByRole("button", { name: "Keep" })).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(within(log()).getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "New conversation" })).toHaveFocus();
  });

  it("says what clearing takes away and what it keeps", async () => {
    const { user, sendAndReply } = startConversation();
    await sendAndReply("A", "R1", "sig-A");

    await user.click(screen.getByRole("button", { name: "New conversation" }));

    expect(screen.getByRole("group", { name: "Clear this conversation?" })).toHaveAccessibleDescription(
      "The log and history go; your draft stays.",
    );
  });

  it("copies the conversation from the question before clearing it", async () => {
    const { user, log, sendAndReply } = startConversation();
    await sendAndReply("A", "R1", "sig-A");

    await user.click(screen.getByRole("button", { name: "New conversation" }));
    const question = screen.getByRole("group", { name: "Clear this conversation?" });
    await user.click(within(question).getByRole("button", { name: "Copy first" }));

    expect(await navigator.clipboard.readText()).toBe("You: A\nCoach: R1");
    expect(within(question).getByRole("button", { name: "Copied" })).toBeInTheDocument();
    expect(within(log()).getAllByRole("listitem")).toHaveLength(1);
  });

  it("lets the conversation be cleared only once no reply is pending", async () => {
    const { server, user, send, sendAndReply } = startConversation();
    await sendAndReply("A", "R1", "sig-A");
    await user.click(screen.getByRole("button", { name: "New conversation" }));

    const pending = await send("B");

    expect(screen.getByRole("button", { name: "Clear" })).toBeDisabled();
    server.reply(pending, 200, { reply: "R2", signature: "sig-B" });
    await within(screen.getByRole("log")).findByText("R2");
    expect(screen.getByRole("button", { name: "Clear" })).toBeEnabled();
  });
});
