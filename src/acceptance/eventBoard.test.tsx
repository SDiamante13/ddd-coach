import { screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { addSwap, startConversation } from "../test/appDriver.tsx";
import { V11_EXAMPLE_REPLY } from "../test/v10Replies.ts";
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

    await user.click(within(log()).getByRole("button", { name: "← 3 new on the board" }));

    expect(within(log()).queryByRole("list", { name: "Events, in order" })).not.toBeInTheDocument();
    expect(within(board()).getByRole("list", { name: "Events on the board" })).toHaveFocus();
  });

  it("counts on the chip only the cards a reply added, and how many of its events were already there", async () => {
    const conversation = await replied(FIRST_BOARD_REPLY);

    await replyNext(conversation, SECOND_BOARD_REPLY, 7);

    const chips = within(conversation.log()).getAllByRole("button", { name: /on the board/ }).map((chip) => chip.textContent);
    expect(chips).toEqual(["← 5 new on the board", "← 2 new on the board · 1 already there"]);
  });

  it("doesn't call an event already there when the same reply just listed it twice", async () => {
    const { log } = await replied("Events, in order\n1. From thread: Carrier 3 rejects the booking.\n2. From thread: carrier 3 rejects the booking");

    expect(within(log()).getByRole("button", { name: /on the board/ })).toHaveTextContent(/^← 1 new on the board$/);
  });

  it("restarts a card's mark when the next reply marks it again, so UPDATED shows after JUST ADDED", async () => {
    const conversation = await replied(SECOND_BOARD_REPLY);
    const guess = cards()[2]!;
    const addedTag = guess.querySelector(".card-tag");
    const addedRing = guess.querySelector(".card-ring");

    await replyNext(conversation, THIRD_BOARD_REPLY, 3);

    expect(guess.querySelector(".card-tag")).toHaveTextContent("UPDATED");
    expect(guess.querySelector(".card-tag")).not.toBe(addedTag);
    expect(guess.querySelector(".card-ring")).not.toBeNull();
    expect(guess.querySelector(".card-ring")).not.toBe(addedRing);
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

  describe("the current question", () => {
    const pinned = () => screen.getByRole("complementary", { name: "Current question" });
    const entries = (log: () => HTMLElement) => within(log()).getAllByRole("listitem").filter((item) => item.parentElement === log());

    it("pins the latest question once, above the conversation, and leaves earlier questions in their replies", async () => {
      const conversation = await replied(SECOND_BOARD_REPLY);
      await replyNext(conversation, THIRD_BOARD_REPLY, 3);
      const [first, second] = entries(conversation.log);

      expect(within(pinned()).getByRole("region", { name: "Question" })).toHaveTextContent("Does a resubmitted booking keep its number?");
      expect(within(first!).getByRole("region", { name: "Question" })).toHaveTextContent("Who picks the next carrier after a rejection?");
      expect(within(second!).queryByRole("region", { name: "Question" })).not.toBeInTheDocument();

      await conversation.user.click(within(second!).getByRole("button", { name: "↑ pinned above" }));
      expect(pinned()).toHaveFocus();
    });

    it("pins nothing before the first question", async () => {
      await startConversation();

      expect(screen.queryByRole("complementary", { name: "Current question" })).not.toBeInTheDocument();
    });
  });

  describe("a card's closest line in the paste", () => {
    const LATE_FEE_LINE = "Wed 08:10  Carrier desk: charged Carrier 3 the late pickup fee on 7731";
    const cardButton = (title: string) => within(board()).getByRole("button", { name: new RegExp(title) });
    const marks = (log: () => HTMLElement) => log().querySelectorAll("mark");

    async function exampleOnTheBoard() {
      const conversation = await startConversation();
      await conversation.user.click(screen.getByRole("button", { name: "Try an example thread" }));
      conversation.server.reply(await conversation.send(""), 200, { reply: V11_EXAMPLE_REPLY, signature: "sig-1" });
      await within(board()).findByRole("list", { name: "Events on the board" });
      return conversation;
    }

    it("opens beside the card and marks that line in the expanded paste", async () => {
      const { user, log } = await exampleOnTheBoard();

      await user.click(cardButton("Carrier desk charges Carrier 3"));

      expect(cardButton("Carrier desk charges Carrier 3")).toHaveAttribute("aria-pressed", "true");
      const note = within(board()).getByRole("note");
      expect(note).toHaveTextContent("CLOSEST LINE IN YOUR PASTE");
      expect(note).toHaveTextContent(LATE_FEE_LINE, { normalizeWhitespace: false });
      expect([...marks(log)].map((mark) => mark.textContent)).toEqual([LATE_FEE_LINE]);
    });

    it.each([
      ["pressing the card again", async (user: Conversation["user"], card: HTMLElement) => user.click(card)],
      ["Escape", async (user: Conversation["user"]) => user.keyboard("{Escape}")],
    ])("closes and clears the mark on %s", async (_case, close) => {
      const { user, log } = await exampleOnTheBoard();
      await user.click(cardButton("Carrier desk charges Carrier 3"));

      await close(user, cardButton("Carrier desk charges Carrier 3"));

      expect(within(board()).queryByRole("note")).not.toBeInTheDocument();
      expect(marks(log)).toHaveLength(0);
      expect(cardButton("Carrier desk charges Carrier 3")).toHaveAttribute("aria-pressed", "false");
    });

    it("finds the line while a swap is on, and shows it with the real name, as the card does", async () => {
      const conversation = await startConversation();
      await addSwap(conversation.user, "Acme Foods", "Customer B");
      const reply = "Events, in order\n1. From thread: Customer B billing issues a service credit for 7731.";
      conversation.server.reply(await conversation.send("Thu 09:30  Acme Foods billing: issued a service credit for 7731"), 200, { reply, signature: "s" });
      await within(board()).findByRole("list", { name: "Events on the board" });

      await conversation.user.click(cardButton("Acme Foods billing issues"));

      expect(within(board()).getByRole("note")).toHaveTextContent("Thu 09:30  Acme Foods billing: issued a service credit for 7731", { normalizeWhitespace: false });
      expect(marks(conversation.log)).toHaveLength(1);
    });

    it("says a guess has no line in the paste", async () => {
      const { user } = await replied(SECOND_BOARD_REPLY);

      await user.click(cardButton("Ops chooses another carrier"));

      expect(within(board()).getByRole("note")).toHaveTextContent("The coach's guess: no line in your paste says this.");
    });
  });
});
