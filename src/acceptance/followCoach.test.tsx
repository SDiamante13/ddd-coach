import { act, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { boardShowsReply, startConversation } from "../test/appDriver.tsx";
import { FIRST_BOARD_REPLY } from "../test/boardReplies.ts";

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const PAUSED = "Follow paused while you work";
const board = () => screen.getByRole("region", { name: "Event board" });
const followSwitch = () => board().querySelector<HTMLButtonElement>(".follow-coach")!;
const announcer = () => screen.getByRole("status", { name: "Board changes" });
const firstCard = () => within(board()).getByRole("button", { name: /Customer submits a bkg/ });

async function onTheBoard() {
  const conversation = await startConversation();
  conversation.server.reply(await conversation.send("Here is our #booking-split thread."), 200, { reply: FIRST_BOARD_REPLY, signature: "sig-1" });
  await boardShowsReply();
  return conversation;
}

describe("The Follow coach rule (#127)", () => {
  it("pauses Follow when you act on the board, saying so for about 3 seconds before settling to Follow coach", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { user } = await onTheBoard();

    await user.click(firstCard());

    expect(followSwitch()).toHaveAttribute("aria-pressed", "false");
    expect(followSwitch()).toHaveAccessibleName(PAUSED);
    expect(announcer()).toHaveTextContent(PAUSED);
    await act(() => vi.advanceTimersByTimeAsync(3000));
    await waitFor(() => expect(followSwitch()).toHaveAccessibleName("Follow coach"));
  });

  it("keeps following when focus alone lands on a card already in view", async () => {
    const { user } = await onTheBoard();

    await user.tab();
    while (!board().contains(document.activeElement) || !document.activeElement?.hasAttribute("data-board-item")) await user.tab();

    expect(followSwitch()).toHaveAttribute("aria-pressed", "true");
  });

  it("pauses Follow when focus lands on a card the board has to move to show", async () => {
    vi.stubGlobal("matchMedia", (query: string) => ({ matches: query.includes("reduce"), media: query, addEventListener: () => {}, removeEventListener: () => {} }));
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function (this: HTMLElement) {
      return this.classList.contains("board-lane") ? 600 : 0;
    });
    await onTheBoard();

    act(() => within(board()).getByRole("button", { name: /^Event 5 of 5/ }).focus());

    await waitFor(() => expect(board().querySelector(".react-flow__viewport")).toHaveStyle({ transform: "translate(-460px,16px) scale(1)" }));
    expect(followSwitch()).toHaveAttribute("aria-pressed", "false");
  });

  it("keeps the plain label when you turn Follow off with the switch itself", async () => {
    const { user } = await onTheBoard();

    await user.click(followSwitch());

    expect(followSwitch()).toHaveAttribute("aria-pressed", "false");
    expect(followSwitch()).toHaveAccessibleName("Follow coach");
    expect(announcer()).not.toHaveTextContent(PAUSED);
  });
});
