import { screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { addSwap, startConversation } from "../test/appDriver.tsx";
import { FIRST_BOARD_REPLY, SECOND_BOARD_REPLY, THIRD_BOARD_REPLY } from "../test/boardReplies.ts";

afterEach(() => vi.unstubAllGlobals());

const board = () => screen.getByRole("region", { name: "Event board" });
const cards = () => within(within(board()).getByRole("list", { name: "Events on the board" })).getAllByRole("listitem");

type Conversation = Awaited<ReturnType<typeof startConversation>>;

async function replyNext({ send, server }: Conversation, reply: string, cardCount: number) {
  server.reply(await send("And the next part of the thread."), 200, { reply, signature: "sig-next" });
  await waitFor(() => expect(cards()).toHaveLength(cardCount));
}

const changeTags = () => cards().map((card) => card.querySelector(".card-tag")?.textContent ?? null);

async function replied(reply: string) {
  const conversation = await startConversation();
  conversation.server.reply(await conversation.send("Here is our #booking-split thread."), 200, { reply, signature: "sig-1" });
  await within(board()).findByRole("list", { name: "Events on the board" });
  return conversation;
}

describe("Event board", () => {
  it("shows an empty board that says where events will land, beside the composer", async () => {
    const { input } = await startConversation();

    expect(within(board()).getByText("Events from your paste land here, left to right, in order.")).toBeInTheDocument();
    expect(input()).toBeInTheDocument();
  });

  it("turns a reply's events into cards in one lane, in order, each with its provenance and marked just added", async () => {
    await replied(SECOND_BOARD_REPLY);

    expect(cards().map((card) => card.textContent)).toEqual([
      "EVENTFROM THREADCustomer submits a bkg on the portal.JUST ADDED",
      "EVENTFROM THREADThe carrier rejects the booking.JUST ADDED",
      "EVENTGUESSOps chooses another carrier and resubmits the booking.JUST ADDED",
    ]);
    expect(within(board()).getByText("3 events · 1 guess")).toBeInTheDocument();
  });

  it("replaces the reply's events list with a chip that takes the visitor to the board", async () => {
    const { user, log } = await replied(SECOND_BOARD_REPLY);

    await user.click(within(log()).getByRole("button", { name: "← 3 events placed on the board" }));

    expect(within(log()).queryByRole("list", { name: "Events, in order" })).not.toBeInTheDocument();
    expect(within(board()).getByRole("list", { name: "Events on the board" })).toHaveFocus();
  });

  it("keeps every card in place across replies: a repeat stays one card, new events are just added, a restated guess is updated", async () => {
    const conversation = await replied(FIRST_BOARD_REPLY);
    const firstFive = cards();

    await replyNext(conversation, SECOND_BOARD_REPLY, 7);
    expect(cards().slice(0, 5)).toEqual(firstFive);
    cards().slice(0, 5).forEach((card, index) => expect(card).toBe(firstFive[index]));
    expect(changeTags()).toEqual([null, null, null, null, null, "JUST ADDED", "JUST ADDED"]);
    const guess = cards()[6]!;
    expect(guess).toHaveTextContent("GUESS");

    await replyNext(conversation, THIRD_BOARD_REPLY, 7);
    expect(cards()[6]).toBe(guess);
    expect(guess).toHaveTextContent("FROM THREAD");
    expect(changeTags()).toEqual([null, null, null, null, null, null, "UPDATED"]);
  });

  it("shows ghost slots, hidden from assistive tech, after the cards while the next reply is pending", async () => {
    const { send } = await replied(SECOND_BOARD_REPLY);

    await send("And the next part of the thread.");

    expect(board().querySelectorAll('.board-ghost[aria-hidden="true"]')).toHaveLength(3);
    expect(cards()).toHaveLength(3);
  });

  it("shows the real names from the swap list on the cards, and sends the reply verbatim", async () => {
    const reply = "Events, in order\n1. From thread: Customer B cancels load 7731.";
    const conversation = await startConversation();
    await addSwap(conversation.user, "Acme", "Customer B");
    conversation.server.reply(await conversation.send("Acme cancelled 7731."), 200, { reply, signature: "sig-1" });
    await within(board()).findByRole("list", { name: "Events on the board" });

    expect(cards()[0]).toHaveTextContent("Acme cancels load 7731.");
    await conversation.send("Next.");
    expect(conversation.server.bodyOf(1)).toMatchObject({ history: [{ reply }] });
  });

  it("returns to the empty board when the visitor starts a new conversation", async () => {
    const { user } = await replied(SECOND_BOARD_REPLY);

    await user.click(screen.getByRole("button", { name: "New conversation" }));
    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(within(board()).getByText("Events from your paste land here, left to right, in order.")).toBeInTheDocument();
    expect(within(board()).queryByRole("list", { name: "Events on the board" })).not.toBeInTheDocument();
  });
});
