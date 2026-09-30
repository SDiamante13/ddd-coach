import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CORRECTIONS_ENABLED } from "../shared/features.ts";
import { addSwap, startConversation } from "../test/appDriver.tsx";
import { SECOND_BOARD_REPLY, THIRD_BOARD_REPLY } from "../test/boardReplies.ts";

afterEach(() => vi.unstubAllGlobals());

const GUESS = "Ops chooses another carrier and resubmits the booking.";
const FIXED = "Ops asks the customer before picking another carrier.";
const board = () => screen.getByRole("region", { name: "Event board" });
const LOGGED = `You corrected a sticky: “${GUESS}” → “${FIXED}”`;
const loggedLine = () => screen.queryByText((_content, element) => element?.classList.contains("correction-line") === true);
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
    expect(loggedLine()).toHaveTextContent(LOGGED);
  });

  it("announces a correction once, in one live region, and its undo", async () => {
    const { user } = await onTheBoard();

    await correctCard(user, GUESS, FIXED);

    const announcer = screen.getByRole("status", { name: "Board changes" });
    expect(announcer).toHaveTextContent(LOGGED);
    expect(screen.getAllByRole("status").filter((region) => region.textContent?.includes("You corrected"))).toEqual([announcer]);

    await user.click(within(cardItem(FIXED)).getByRole("button", { name: "Undo" }));
    expect(announcer).toHaveTextContent("Correction undone.");
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
    expect(loggedLine()).not.toBeInTheDocument();
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
    expect(within(conversation.log()).getAllByRole("button", { name: /on the board/ }).at(-1)).toHaveTextContent("← 1 already on the board · your wording kept");
  });

  it("can be corrected from the keyboard, through the card's note", async () => {
    const { user } = await onTheBoard();
    within(cardItem(GUESS)).getByRole("button").focus();
    await user.keyboard("{Enter}");

    await user.click(within(board()).getByRole("button", { name: "Correct this card" }));

    expect(within(board()).getByRole("textbox", { name: "Correct this event" })).toHaveFocus();
  });

  it("starts a new conversation with no corrections, so Undo there only ever touches its own", async () => {
    const conversation = await onTheBoard();
    await correctCard(conversation.user, GUESS, FIXED);
    await conversation.user.click(screen.getByRole("button", { name: "New conversation" }));
    await conversation.user.click(screen.getByRole("button", { name: "Clear" }));

    conversation.server.reply(await conversation.send("Here is our #booking-split thread again."), 200, { reply: SECOND_BOARD_REPLY, signature: "sig-3" });
    await within(board()).findByRole("list", { name: "Events on the board" });
    expect(within(board()).queryByText("YOU SAID")).not.toBeInTheDocument();
    expect(loggedLine()).not.toBeInTheDocument();

    await correctCard(conversation.user, "The carrier rejects the booking.", "The carrier turns the booking down.");
    await conversation.user.click(within(cardItem("The carrier turns the booking down.")).getByRole("button", { name: "Undo" }));
    expect(within(board()).queryByText("YOU SAID")).not.toBeInTheDocument();
    expect(within(board()).queryByRole("button", { name: "Undo" })).not.toBeInTheDocument();
  });

  describe.skipIf(CORRECTIONS_ENABLED)("while the coach isn't told about corrections", () => {
    it("claims only the board change, and sends the coach nothing about it", async () => {
      const conversation = await onTheBoard();
      await correctCard(conversation.user, GUESS, FIXED);

      await conversation.send("And the next part.");

      expect(loggedLine()).toHaveTextContent(new RegExp(`^${LOGGED.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`));
      expect(conversation.server.bodyOf(1)).not.toHaveProperty("corrections");
    });
  });

  describe.skipIf(!CORRECTIONS_ENABLED)("once the coach is told about corrections", () => {
    it("says the coach's next turn uses the visitor's wording, and sends it with the next message", async () => {
      const conversation = await onTheBoard();
      await correctCard(conversation.user, GUESS, FIXED);

      expect(loggedLine()).toHaveTextContent(`${LOGGED}. The coach's next turn uses your wording.`);
      await conversation.send("And the next part.");
      expect(conversation.server.bodyOf(1)).toMatchObject({ corrections: [{ was: GUESS, now: FIXED }] });
    });

    it("sends a correction typed with a real name with its swap applied", async () => {
      const conversation = await onTheBoard();
      await addSwap(conversation.user, "Acme Foods", "Customer B");
      await correctCard(conversation.user, GUESS, "Ops asks Acme Foods before picking another carrier.");

      await conversation.send("And the next part.");

      expect(conversation.server.bodyOf(1)).toMatchObject({ corrections: [{ now: "Ops asks Customer B before picking another carrier." }] });
      expect(cardItem("Ops asks Acme Foods")).toBeDefined();
    });
  });
});
