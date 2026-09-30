import { screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { startConversation } from "../test/appDriver.tsx";
import { FIRST_BOARD_REPLY, SECOND_BOARD_REPLY, THIRD_BOARD_REPLY } from "../test/boardReplies.ts";

afterEach(() => vi.unstubAllGlobals());

const board = () => screen.getByRole("region", { name: "Event board" });
const cards = () => within(within(board()).getByRole("list", { name: "Events on the board" })).getAllByRole("listitem");
const newChip = () => within(board()).queryByRole("button", { name: /^Show the / });

async function onTheBoard() {
  const conversation = await startConversation();
  conversation.server.reply(await conversation.send("Here is our #booking-split thread."), 200, { reply: FIRST_BOARD_REPLY, signature: "sig-1" });
  await within(board()).findByRole("list", { name: "Events on the board" });
  return conversation;
}

async function nextReply(conversation: Awaited<ReturnType<typeof onTheBoard>>) {
  conversation.server.reply(await conversation.send("And the next part."), 200, { reply: SECOND_BOARD_REPLY, signature: "sig-2" });
  await waitFor(() => expect(cards()).toHaveLength(7));
}

describe("A board that holds still once you've touched it this turn (#124)", () => {
  it("offers the new events in a chip instead of panning, once you've selected a card", async () => {
    const conversation = await onTheBoard();
    await conversation.user.click(within(board()).getByRole("button", { name: /Customer submits a bkg/ }));

    await nextReply(conversation);

    expect(newChip()).toHaveTextContent("2 new ▸");
  });

  it("pans as before, with no chip, when you haven't touched the board this turn", async () => {
    const conversation = await onTheBoard();

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

  it("holds the board for one turn only", async () => {
    const conversation = await onTheBoard();
    await conversation.user.click(within(board()).getByRole("button", { name: /Customer submits a bkg/ }));
    await nextReply(conversation);

    conversation.server.reply(await conversation.send("And the last part."), 200, { reply: THIRD_BOARD_REPLY, signature: "sig-3" });
    await screen.findAllByText(/Does a resubmitted booking keep its number/);

    expect(newChip()).not.toBeInTheDocument();
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
});
