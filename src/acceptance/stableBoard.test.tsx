import { cleanup, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { boardShowsReply, renderApp, startConversation } from "../test/appDriver.tsx";
import { FIRST_BOARD_REPLY, SECOND_BOARD_REPLY, THIRD_BOARD_REPLY } from "../test/boardReplies.ts";

afterEach(() => vi.unstubAllGlobals());

const board = () => screen.getByRole("region", { name: "Event board" });
const cards = () => {
  const list = within(board()).getByRole("list", { name: "Events on the board" });
  return within(list)
    .getAllByRole("listitem")
    .filter((item) => item.parentElement === list && !item.hasAttribute("aria-label"));
};
const newChip = () => within(board()).queryByRole("button", { name: /^Show the .*(new|updated)/ });

async function onTheBoard() {
  const conversation = await startConversation();
  conversation.server.reply(await conversation.send("Here is our #booking-split thread."), 200, { reply: FIRST_BOARD_REPLY, signature: "sig-1" });
  await boardShowsReply();
  return conversation;
}

async function nextReply(conversation: Awaited<ReturnType<typeof onTheBoard>>) {
  conversation.server.reply(await conversation.send("And the next part."), 200, { reply: SECOND_BOARD_REPLY, signature: "sig-2" });
  await waitFor(() => expect(cards()).toHaveLength(7));
}

const follow = () => within(board()).getByRole("button", { name: /^Follow (coach|paused)/ });

describe("A board that holds still once you've touched it (#124, #20)", () => {
  it("offers the new events in a chip instead of panning, once you've selected a card", async () => {
    const conversation = await onTheBoard();
    await conversation.user.click(within(board()).getByRole("button", { name: /Customer submits a bkg/ }));

    await nextReply(conversation);

    expect(newChip()).toHaveTextContent("2 new ▸");
  });

  it("follows the coach, with no chip, until you touch the board", async () => {
    const conversation = await onTheBoard();
    expect(follow()).toHaveAttribute("aria-pressed", "true");

    await nextReply(conversation);

    expect(newChip()).not.toBeInTheDocument();
  });

  it("stops following the coach for good once you touch the board, and the switch shows it (#127)", async () => {
    const conversation = await onTheBoard();
    expect(follow().querySelector(".switch-knob")).not.toBeNull();

    await conversation.user.click(within(board()).getByRole("button", { name: /Customer submits a bkg/ }));

    expect(follow()).toHaveAttribute("aria-pressed", "false");
    expect(follow()).toHaveAccessibleName("Follow paused while you work");
  });

  it("follows again when you turn Follow coach back on", async () => {
    const conversation = await onTheBoard();
    await conversation.user.click(within(board()).getByRole("button", { name: /Customer submits a bkg/ }));

    await conversation.user.click(follow());
    await nextReply(conversation);

    expect(newChip()).not.toBeInTheDocument();
  });

  it("puts the chip away once you use it", async () => {
    const conversation = await onTheBoard();
    await conversation.user.click(within(board()).getByRole("button", { name: /Customer submits a bkg/ }));
    await nextReply(conversation);

    await conversation.user.click(newChip()!);

    expect(newChip()).not.toBeInTheDocument();
  });

  it("keeps the board still on later replies too", async () => {
    const conversation = await onTheBoard();
    await conversation.user.click(within(board()).getByRole("button", { name: /Customer submits a bkg/ }));
    await nextReply(conversation);

    conversation.server.reply(await conversation.send("And the last part."), 200, { reply: THIRD_BOARD_REPLY, signature: "sig-3" });
    await screen.findAllByText(/Does a resubmitted booking keep its number/);

    expect(newChip()).toHaveTextContent("1 updated ▸");
  });

  it("says updated, not new, when the reply only changed cards already there", async () => {
    const conversation = await onTheBoard();
    await nextReply(conversation);
    await conversation.user.click(within(board()).getByRole("button", { name: /Customer submits a bkg/ }));

    conversation.server.reply(await conversation.send("And the last part."), 200, { reply: THIRD_BOARD_REPLY, signature: "sig-3" });
    await screen.findAllByText(/Does a resubmitted booking keep its number/);

    expect(newChip()).toHaveTextContent("1 updated ▸");
    expect(newChip()).toHaveAccessibleName("Show the 1 updated event");
  });

  it("stays off after a reload, so the board never jumps back to following", async () => {
    const conversation = await onTheBoard();
    await conversation.user.click(within(board()).getByRole("button", { name: /Customer submits a bkg/ }));

    cleanup();
    await renderApp();

    expect(await within(await screen.findByRole("region", { name: "Event board" })).findByRole("button", { name: "Follow coach" })).toHaveAttribute("aria-pressed", "false");
  });

  it("follows again in a new conversation", async () => {
    const conversation = await onTheBoard();
    await conversation.user.click(within(board()).getByRole("button", { name: /Customer submits a bkg/ }));
    await conversation.user.click(screen.getByRole("button", { name: "New conversation" }));
    await conversation.user.click(screen.getByRole("button", { name: "Clear" }));

    conversation.server.reply(await conversation.send("Here is our #booking-split thread."), 200, { reply: FIRST_BOARD_REPLY, signature: "sig-9" });
    await boardShowsReply();

    expect(follow()).toHaveAttribute("aria-pressed", "true");
  });

  it("says in the reply when its new events landed off-screen, and takes you there", async () => {
    const conversation = await onTheBoard();
    await conversation.user.click(within(board()).getByRole("button", { name: /Customer submits a bkg/ }));
    await nextReply(conversation);

    const replyChip = within(conversation.log()).getByRole("button", { name: "2 new on the board ▸ off-screen · 1 already there" });
    await conversation.user.click(replyChip);

    expect(newChip()).not.toBeInTheDocument();
    expect(within(conversation.log()).queryByRole("button", { name: /off-screen/ })).not.toBeInTheDocument();
  });

  describe("a session saved before Follow coach existed", () => {
    const restoreFrom = async (extra: object) => {
      const exchange = { id: "e1", prompt: "Here is our #booking-split thread.", status: "replied", reply: FIRST_BOARD_REPLY, signature: "sig-1" };
      localStorage.setItem("ddd-coach.session.v1", JSON.stringify({ version: 1, exchanges: [exchange], visitorActions: [], ...extra }));
      await renderApp();
      return within(await screen.findByRole("region", { name: "Event board" })).findByRole("button", { name: "Follow coach" });
    };

    it("comes back not following once the visitor had moved the board, so the next reply doesn't yank it", async () => {
      expect(await restoreFrom({ viewport: { x: -300, y: 16, zoom: 1 } })).toHaveAttribute("aria-pressed", "false");
    });

    it("comes back following when the visitor never touched the board", async () => {
      expect(await restoreFrom({})).toHaveAttribute("aria-pressed", "true");
    });
  });
});
