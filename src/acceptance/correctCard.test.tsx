import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { startConversation } from "../test/appDriver.tsx";
import { SECOND_BOARD_REPLY, THIRD_BOARD_REPLY } from "../test/boardReplies.ts";

afterEach(() => vi.unstubAllGlobals());

const GUESS = "Ops chooses another carrier and resubmits the booking.";
const FIXED = "Ops asks the customer before picking another carrier.";
const board = () => screen.getByRole("region", { name: "Event board" });
const cardItem = (words: string) => within(board()).getAllByRole("listitem").find((item) => item.textContent?.includes(words))!;

async function onTheBoard() {
  const conversation = await startConversation();
  conversation.server.reply(await conversation.send("Here is our #booking-split thread."), 200, { reply: SECOND_BOARD_REPLY, signature: "sig-1" });
  await within(board()).findByRole("list", { name: "Events on the board" });
  return conversation;
}

async function correctCard(user: Awaited<ReturnType<typeof onTheBoard>>["user"], from: string, to: string) {
  await user.dblClick(within(cardItem(from)).getByRole("button"));
  const field = within(board()).getByRole("textbox", { name: "Correct this event" });
  await user.clear(field);
  await user.type(field, `${to}{Enter}`);
}

describe("Correcting a card (#95)", () => {
  it("takes the visitor's words in place, says YOU SAID, strikes the coach's words through and offers Undo", async () => {
    const { user } = await onTheBoard();

    await correctCard(user, GUESS, FIXED);

    const card = cardItem(FIXED);
    expect(within(card).getByText("YOU SAID")).toBeInTheDocument();
    expect(within(card).getByText(GUESS).tagName).toBe("S");
    expect(within(card).getByRole("button", { name: "Undo" })).toBeInTheDocument();
    expect(screen.getByRole("status", { name: "Board correction" })).toHaveTextContent("Corrected on your board.");
  });

  it("leaves the card as it was on Escape", async () => {
    const { user } = await onTheBoard();
    await user.dblClick(within(cardItem(GUESS)).getByRole("button"));

    await user.type(within(board()).getByRole("textbox", { name: "Correct this event" }), " maybe{Escape}");

    expect(within(cardItem(GUESS)).getByText("GUESS")).toBeInTheDocument();
    expect(within(board()).queryByText("YOU SAID")).not.toBeInTheDocument();
  });

  it("restores the coach's words on Undo", async () => {
    const { user } = await onTheBoard();
    await correctCard(user, GUESS, FIXED);

    await user.click(within(cardItem(FIXED)).getByRole("button", { name: "Undo" }));

    expect(within(cardItem(GUESS)).getByText("GUESS")).toBeInTheDocument();
    expect(within(board()).queryByRole("button", { name: "Undo" })).not.toBeInTheDocument();
    expect(screen.queryByRole("status", { name: "Board correction" })).not.toBeInTheDocument();
  });

  it("keeps YOU SAID after the next turn, which drops the struck words and Undo", async () => {
    const conversation = await onTheBoard();
    await correctCard(conversation.user, GUESS, FIXED);

    conversation.server.reply(await conversation.send("And the next part."), 200, { reply: THIRD_BOARD_REPLY, signature: "sig-2" });
    await within(conversation.log()).findByRole("button", { name: /on the board/ });

    const card = cardItem(FIXED);
    expect(within(card).getByText("YOU SAID")).toBeInTheDocument();
    expect(within(card).queryByText(GUESS)).not.toBeInTheDocument();
    expect(within(card).queryByRole("button", { name: "Undo" })).not.toBeInTheDocument();
  });

  it("can be corrected from the keyboard, through the card's note", async () => {
    const { user } = await onTheBoard();
    within(cardItem(GUESS)).getByRole("button").focus();
    await user.keyboard("{Enter}");

    await user.click(within(board()).getByRole("button", { name: "Correct this card" }));

    expect(within(board()).getByRole("textbox", { name: "Correct this event" })).toHaveFocus();
  });
});
