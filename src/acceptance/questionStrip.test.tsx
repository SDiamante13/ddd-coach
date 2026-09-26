import { act, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { startConversation } from "../test/appDriver.tsx";
import { SECOND_BOARD_REPLY, THIRD_BOARD_REPLY } from "../test/boardReplies.ts";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const pinned = () => screen.getByRole("complementary", { name: "Current question" });
const toggle = () => within(pinned()).getByRole("button", { name: "Whole question" });

async function replied(reply: string) {
  const conversation = await startConversation();
  conversation.server.reply(await conversation.send("Here is our #booking-split thread."), 200, { reply, signature: "sig-1" });
  await screen.findByRole("complementary", { name: "Current question" });
  return conversation;
}

describe("The question strip (#111)", () => {
  it("sums up the pinned question on a strip: its roles, then the question, collapsed until asked", async () => {
    await replied(SECOND_BOARD_REPLY);

    expect(within(pinned()).getByText("Question · the ops sign-off lead, at the Tue 27 Oct RFC review")).toBeInTheDocument();
    expect(within(pinned()).getAllByText("Who picks the next carrier after a rejection?")).not.toHaveLength(0);
    expect(toggle()).toHaveAttribute("aria-expanded", "false");
  });

  it("opens to the whole question and closes again on the toggle", async () => {
    const { user } = await replied(SECOND_BOARD_REPLY);

    await user.click(toggle());
    expect(toggle()).toHaveAttribute("aria-expanded", "true");

    await user.click(toggle());
    expect(toggle()).toHaveAttribute("aria-expanded", "false");
  });

  it("opens by itself for 3 s when a new reply changes the question, then closes", async () => {
    const { send, server } = await replied(SECOND_BOARD_REPLY);
    const next = await send("And the next part of the thread.");
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });

    await act(async () => server.reply(next, 200, { reply: THIRD_BOARD_REPLY, signature: "sig-2" }));
    await act(async () => {});
    expect(within(pinned()).getAllByText("Does a resubmitted booking keep its number?")).not.toHaveLength(0);
    expect(toggle()).toHaveAttribute("aria-expanded", "true");

    act(() => vi.advanceTimersByTime(3_000));
    expect(toggle()).toHaveAttribute("aria-expanded", "false");
  });

  it("stays closed when the visitor closes it during the 3 s", async () => {
    const { send, server } = await replied(SECOND_BOARD_REPLY);
    const next = await send("And the next part of the thread.");
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    await act(async () => server.reply(next, 200, { reply: THIRD_BOARD_REPLY, signature: "sig-2" }));
    await act(async () => {});

    act(() => toggle().click());
    expect(toggle()).toHaveAttribute("aria-expanded", "false");
    act(() => vi.advanceTimersByTime(3_000));
    expect(toggle()).toHaveAttribute("aria-expanded", "false");
  });
});
