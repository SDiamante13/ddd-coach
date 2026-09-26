import { describe, expect, it } from "vitest";
import { composerOf, pasteInto, startConversation } from "../test/appDriver.tsx";

describe("The resting composer after Send (#115)", () => {
  it("rests after Send while the message box keeps focus", async () => {
    const { send, input } = await startConversation();

    await send("Here is our #booking-split thread.");

    expect(input()).toHaveFocus();
    expect(composerOf(input())).toHaveAttribute("data-resting");
  });

  it("rests after a click on Send too", async () => {
    const { input, sendButton, user } = await startConversation();
    await pasteInto(user, input(), "Here is our #booking-split thread.");

    await user.click(sendButton());

    expect(input()).toHaveFocus();
    expect(composerOf(input())).toHaveAttribute("data-resting");
  });

  it("wakes on the first keystroke", async () => {
    const { send, input, user } = await startConversation();
    await send("Here is our #booking-split thread.");

    await user.keyboard("A");

    expect(composerOf(input())).not.toHaveAttribute("data-resting");
  });

  it("grows again when the visitor leaves the box and comes back", async () => {
    const { send, input, user } = await startConversation();
    await send("Here is our #booking-split thread.");

    await user.click(document.body);
    await user.click(input());

    expect(composerOf(input())).not.toHaveAttribute("data-resting");
  });
});
