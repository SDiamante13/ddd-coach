import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EXAMPLE_THREAD } from "../shared/exampleThread.ts";
import { startConversation } from "../test/appDriver.tsx";

afterEach(() => vi.unstubAllGlobals());

const TRY_EXAMPLE = { name: "Try an example thread" };
const tryExample = () => screen.getByRole("button", TRY_EXAMPLE);
const queryTryExample = () => screen.queryByRole("button", TRY_EXAMPLE);

describe("Try an example thread", () => {
  it("fills the empty message box with the example thread, focused, without sending it", async () => {
    const { user, server, input } = await startConversation();

    await user.click(tryExample());

    expect(input()).toHaveValue(EXAMPLE_THREAD);
    expect(input()).toHaveFocus();
    expect(server.pendingCount()).toBe(0);
  });

  it("puts the caret at the top of the example, so its first line is what shows", async () => {
    const { user, input } = await startConversation();

    await user.click(tryExample());

    expect(input()).toHaveProperty("selectionEnd", 0);
  });

  it("steps aside while the box has any text, so it never overwrites a draft", async () => {
    const { user, input } = await startConversation();

    await user.type(input(), "x");
    expect(queryTryExample()).not.toBeInTheDocument();

    await user.clear(input());
    expect(tryExample()).toBeVisible();
  });

  it("sends the example only on Send, hides itself for the conversation, and returns once it's cleared", async () => {
    const { user, server, log, sendButton } = await startConversation();
    await user.click(tryExample());

    await user.click(sendButton());
    expect(server.bodyOf(0)).toEqual({ message: EXAMPLE_THREAD, history: [] });
    server.reply(0, 200, { reply: "Events, in order", signature: "sig-A" });
    await within(log()).findByText("Events, in order");
    expect(queryTryExample()).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "New conversation" }));
    await user.click(screen.getByRole("radio", { name: "An empty box" }));
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(tryExample()).toBeVisible();
  });
});
