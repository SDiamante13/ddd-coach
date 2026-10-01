import { act, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { pasteInto, startConversation } from "../test/appDriver.tsx";
import { SECOND_BOARD_REPLY, THIRD_BOARD_REPLY } from "../test/boardReplies.ts";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const FIRST = "Customer submits a bkg on the portal.";
const GUESS = "Ops chooses another carrier and resubmits the booking.";
const board = () => screen.getByRole("region", { name: "Event board" });
const cardButton = (title: string) => within(board()).getByRole("button", { name: new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) });
const linkEdge = () => within(board()).queryByRole("img", { name: `Link from “${FIRST}” to “${GUESS}”` });
const LOGGED = "You connected “Customer submits a bkg on the…” → “Ops chooses another carrier and resubmits…”";
const linkLine = () => within(screen.getByRole("log")).queryByText(LOGGED);

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
  await within(board()).findByRole("img", { name: `Link from “${FIRST}” to “${GUESS}”` });
}

const FIXED = "Ops asks the customer before picking another carrier.";

async function correctGuess(user: Awaited<ReturnType<typeof onTheBoard>>["user"]) {
  await user.dblClick(cardButton(GUESS));
  const field = within(board()).getByRole("textbox", { name: "Correct this event" });
  await user.clear(field);
  await pasteInto(user, field, FIXED);
  await user.keyboard("{Enter}");
  await within(board()).findByRole("button", { name: `Event 3 of 3, YOU SAID: ${FIXED}` });
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

  it("draws a link in coach blue only while it's Just drawn, then in ink (#124)", async () => {
    const conversation = await onTheBoard();
    await connectFromKeyboard(conversation.user);
    const arrowhead = () => linkEdge()!.querySelector("path")!.getAttribute("marker-end");
    expect(arrowhead()).toContain("--color-coach");

    conversation.server.reply(await conversation.send("And the next part."), 200, { reply: THIRD_BOARD_REPLY, signature: "sig-2" });
    await within(conversation.log()).findAllByRole("button", { name: /on the board/ });

    expect(arrowhead()).toContain("--color-ink");
  });

  it("announces a new link and its undo in the one 'Board changes' region", async () => {
    const { user } = await onTheBoard();

    await connectFromKeyboard(user);

    const announcer = screen.getByRole("status", { name: "Board changes" });
    await waitFor(() => expect(announcer).toHaveTextContent(`You connected “${FIRST}” → “${GUESS}”`));
    await user.click(within(linkLine()!.closest("p")!).getByRole("button", { name: "Undo" }));
    await waitFor(() => expect(announcer).toHaveTextContent("Link undone."));
  });

  it("records nothing for a link that already exists, so one Undo takes the link back", async () => {
    const { user } = await onTheBoard();
    await connectFromKeyboard(user);

    await user.click(within(board()).getByRole("button", { name: `Link to “${GUESS}”` }));

    await waitFor(() => expect(screen.getByRole("status", { name: "Board changes" })).toHaveTextContent("Already linked."));
    await user.click(within(linkLine()!.closest("p")!).getByRole("button", { name: "Undo" }));
    expect(linkEdge()).not.toBeInTheDocument();
  });

  describe("links and corrected cards (#124)", () => {
    it("links to a guess you corrected, under your words", async () => {
      const { user } = await onTheBoard();
      await correctGuess(user);

      await user.click(cardButton(FIRST));
      await user.click(within(board()).getByRole("button", { name: "Connect to…" }));
      await user.click(within(board()).getByRole("button", { name: `Link to “${FIXED}”` }));

      expect(await within(board()).findByRole("img", { name: `Link from “${FIRST}” to “${FIXED}”` })).toBeInTheDocument();
      expect(await within(screen.getByRole("log")).findByText("You connected “Customer submits a bkg on the…” → “Ops asks the customer before picking…”")).toBeInTheDocument();
    });

    it("keeps a link to a guess when you then correct it, naming it by your words", async () => {
      const { user } = await onTheBoard();
      await connectFromKeyboard(user);
      await user.keyboard("{Escape}");

      await correctGuess(user);

      expect(within(board()).getByRole("img", { name: `Link from “${FIRST}” to “${FIXED}”` })).toBeInTheDocument();
    });
  });

  it("runs each further link 12 px lower, so stacked links don't share a line (#124)", async () => {
    const SECOND = "The carrier rejects the booking.";
    const { user } = await onTheBoard();
    await connectFromKeyboard(user);
    await user.click(within(board()).getByRole("button", { name: `Link to “${SECOND}”` }));
    await within(board()).findByRole("img", { name: `Link from “${FIRST}” to “${SECOND}”` });

    const depth = (to: string) => {
      const path = within(board()).getByRole("img", { name: `Link from “${FIRST}” to “${to}”` }).querySelector("path")!;
      const ys = [...path.getAttribute("d")!.matchAll(/(-?[\d.]+)[ ,](-?[\d.]+)/g)].map(([, , y]) => Number(y));
      return Math.max(...ys);
    };
    expect(depth(SECOND) - depth(GUESS)).toBe(12);
  });

  describe("clearing 'Board changes' so a repeat is read again (#124)", () => {
    const announcer = () => screen.getByRole("status", { name: "Board changes" });

    it("clears it when the coach's next reply lands", async () => {
      const conversation = await onTheBoard();
      await connectFromKeyboard(conversation.user);
      await waitFor(() => expect(announcer()).not.toBeEmptyDOMElement());

      conversation.server.reply(await conversation.send("And the next part."), 200, { reply: THIRD_BOARD_REPLY, signature: "sig-2" });
      await within(conversation.log()).findAllByRole("button", { name: /on the board/ });

      expect(announcer()).toBeEmptyDOMElement();
    });

    it("clears it on New conversation", async () => {
      const { user } = await onTheBoard();
      await connectFromKeyboard(user);
      await waitFor(() => expect(announcer()).not.toBeEmptyDOMElement());

      await user.click(screen.getByRole("button", { name: "New conversation" }));
      await user.click(screen.getByRole("button", { name: "Clear" }));

      expect(announcer()).toBeEmptyDOMElement();
    });

    it("clears it 5 seconds after the message", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const { user } = await onTheBoard();
      await connectFromKeyboard(user);
      await waitFor(() => expect(announcer()).not.toBeEmptyDOMElement());

      await act(() => vi.advanceTimersByTimeAsync(3000));
      expect(announcer()).not.toBeEmptyDOMElement();
      await act(() => vi.advanceTimersByTimeAsync(2000));

      await waitFor(() => expect(announcer()).toBeEmptyDOMElement());
    });
  });
});
