import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { startConversation } from "../test/appDriver.tsx";
import { SECOND_BOARD_REPLY, THIRD_BOARD_REPLY } from "../test/boardReplies.ts";

afterEach(() => vi.unstubAllGlobals());

const FIRST = "Customer submits a bkg on the portal.";
const GUESS = "Ops chooses another carrier and resubmits the booking.";
const board = () => screen.getByRole("region", { name: "Event board" });
const cardButton = (title: string) => within(board()).getByRole("button", { name: new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) });
const linkEdge = () => within(board()).queryByRole("img", { name: `Link from “${FIRST}” to “${GUESS}”` });
const linkLine = () => within(screen.getByRole("log")).queryByText(`You connected “${FIRST}” → “${GUESS}”`);

async function onTheBoard() {
  const conversation = await startConversation();
  conversation.server.reply(await conversation.send("Here is our #booking-split thread."), 200, { reply: SECOND_BOARD_REPLY, signature: "sig-1" });
  await within(board()).findByRole("list", { name: "Events on the board" });
  return conversation;
}

async function connectFromKeyboard(user: Awaited<ReturnType<typeof onTheBoard>>["user"]) {
  await user.click(cardButton(FIRST));
  await user.click(within(board()).getByRole("button", { name: "Connect to…" }));
  await user.click(within(board()).getByRole("button", { name: `Link to “${GUESS}”` }));
}

describe("Linking two cards (#96)", () => {
  it("links two cards from the keyboard, draws the link and logs it", async () => {
    const { user } = await onTheBoard();

    await connectFromKeyboard(user);

    expect(linkEdge()).toBeInTheDocument();
    expect(linkLine()).toBeInTheDocument();
  });

  it("takes the link back on Undo", async () => {
    const { user } = await onTheBoard();
    await connectFromKeyboard(user);

    await user.click(within(linkLine()!.closest("p")!).getByRole("button", { name: "Undo" }));

    expect(linkEdge()).not.toBeInTheDocument();
    expect(linkLine()).not.toBeInTheDocument();
  });

  it("keeps the link when the coach's next reply restates a linked card", async () => {
    const conversation = await onTheBoard();
    await connectFromKeyboard(conversation.user);

    conversation.server.reply(await conversation.send("And the next part."), 200, { reply: THIRD_BOARD_REPLY, signature: "sig-2" });
    await within(conversation.log()).findAllByRole("button", { name: /on the board/ });

    expect(linkEdge()).toBeInTheDocument();
  });

  it("labels a link 'Just drawn' until the coach's next turn", async () => {
    const conversation = await onTheBoard();
    await connectFromKeyboard(conversation.user);
    expect(within(board()).getByText("Just drawn")).toBeInTheDocument();

    conversation.server.reply(await conversation.send("And the next part."), 200, { reply: THIRD_BOARD_REPLY, signature: "sig-2" });
    await within(conversation.log()).findAllByRole("button", { name: /on the board/ });

    expect(within(board()).queryByText("Just drawn")).not.toBeInTheDocument();
  });

  it("announces a new link and its undo in the one 'Board changes' region", async () => {
    const { user } = await onTheBoard();

    await connectFromKeyboard(user);

    const announcer = screen.getByRole("status", { name: "Board changes" });
    expect(announcer).toHaveTextContent(`You connected “${FIRST}” → “${GUESS}”`);
    await user.click(within(linkLine()!.closest("p")!).getByRole("button", { name: "Undo" }));
    expect(announcer).toHaveTextContent("Link undone.");
  });
});
