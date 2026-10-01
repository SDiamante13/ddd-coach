import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { addSwap, startConversation } from "../test/appDriver.tsx";
import { QUESTION_PASTE, QUESTION_REPLY, ROW_QUOTE_PASTE, ROW_QUOTE_REPLY } from "../test/questionReplies.ts";
import { SECOND_BOARD_REPLY } from "../test/boardReplies.ts";

afterEach(() => vi.unstubAllGlobals());

const board = () => screen.getByRole("region", { name: "Event board" });
const onBoard = () => within(within(board()).getByRole("list", { name: "Events on the board" })).getAllByRole("listitem");

async function asked() {
  const conversation = await startConversation();
  conversation.server.reply(await conversation.send(QUESTION_PASTE), 200, { reply: QUESTION_REPLY, signature: "sig-1" });
  await within(board()).findByRole("list", { name: "Events on the board" });
  return conversation;
}

describe("The open question on the board (#97)", () => {
  it("puts the question after the events, relating to the two events it joins", async () => {
    await asked();

    const hotspot = onBoard().at(-1)!;
    expect(hotspot).toHaveAccessibleName("Open question: Does a late pickup earn the credit?, relates to Event 1 and Event 2");
    expect(hotspot).toHaveTextContent("QUESTIONOPEN");
    expect(hotspot).toHaveTextContent("JUST ADDED");
  });

  it("counts the open question in the board's header", async () => {
    await asked();

    expect(within(board()).getByText("3 events · 1 guess · 1 open question")).toBeInTheDocument();
  });

  it("draws a dotted line from each event it joins", async () => {
    await asked();

    expect(board().querySelectorAll(".relates-edge")).toHaveLength(2);
  });

  it("puts no question on the board when the reply asks none", async () => {
    const conversation = await startConversation();
    conversation.server.reply(await conversation.send("Here is our thread."), 200, { reply: SECOND_BOARD_REPLY.split("\n\n")[0], signature: "sig-1" });
    await within(board()).findByRole("list", { name: "Events on the board" });

    expect(onBoard().map((item) => item.getAttribute("aria-label") ?? "")).not.toContainEqual(expect.stringMatching(/^Open question/));
  });

  it("takes you from the pinned question to its hotspot on the board", async () => {
    const { user } = await asked();
    const pinned = screen.getByRole("complementary", { name: "Current question" });

    await user.click(within(pinned).getByRole("button", { name: "On the board ↖ linked to 2 events" }));

    expect(document.activeElement).toBe(board().querySelector(".hotspot-card"));
  });

  it("links through your swaps and shows the question with your real names", async () => {
    const conversation = await startConversation();
    await addSwap(conversation.user, "Customer D", "Globex");
    const reply = QUESTION_REPLY.replaceAll("Customer D", "Globex")
      .replace("Does a late pickup earn the credit?", "Does Globex keep the credit?")
      .replace('"issued Globex a service credit for 7731"', '"Globex credit"');
    conversation.server.reply(await conversation.send(QUESTION_PASTE), 200, { reply, signature: "sig-1" });
    await within(board()).findByRole("list", { name: "Events on the board" });

    expect(onBoard().at(-1)).toHaveAccessibleName("Open question: Does Customer D keep the credit?, relates to Event 1 and Event 2");
  });

  describe("a quote no card comes from (#126)", () => {
    const UNPLACED = "who owns the weekly late report now";
    const reply = QUESTION_REPLY.replace('"issued Customer D a service credit for 7731"', `"${UNPLACED}"`);

    async function askedWithAStrayQuote() {
      const conversation = await startConversation();
      conversation.server.reply(await conversation.send(QUESTION_PASTE), 200, { reply, signature: "sig-1" });
      await within(board()).findByRole("list", { name: "Events on the board" });
      return conversation;
    }

    it("says on the hotspot that a quote isn't on the board, and shows it when asked", async () => {
      const { user } = await askedWithAStrayQuote();
      const hotspot = onBoard().at(-1)!;
      expect(hotspot).toHaveAccessibleName("Open question: Does a late pickup earn the credit?, relates to Event 1, 1 quote not on the board");

      await user.click(within(hotspot).getByRole("button", { name: "1 quote not on the board" }));

      expect(within(hotspot).getByText(`“${UNPLACED}”`)).toBeVisible();
    });

    it("keeps the quote button out of the Tab order until the question is the board's focus (#127)", async () => {
      await askedWithAStrayQuote();

      expect(within(onBoard().at(-1)!).getByRole("button", { name: "1 quote not on the board" })).toHaveAttribute("tabindex", "-1");
    });

    it("says it on the pinned question's chip too, inside the card", async () => {
      await askedWithAStrayQuote();
      const pinned = screen.getByRole("complementary", { name: "Current question" });

      const chip = within(pinned).getByRole("button", { name: "On the board ↖ linked to 1 event · 1 quote not on the board" });

      expect(chip.closest(".question-card")).not.toBeNull();
    });
  });

  it("reads the pinned question before its chip, and the chip before the quotes (#126)", async () => {
    await asked();
    const card = within(screen.getByRole("complementary", { name: "Current question" })).getByRole("region", { name: "Question" });

    const order = [...card.children].map((child) => child.className);

    expect(order).toEqual(["question-for", "question-text", "question-action", "question-sources"]);
  });

  describe("a quote that is a term row on the board (#109 hotfix)", () => {
    async function askedAboutARow() {
      const conversation = await startConversation();
      conversation.server.reply(await conversation.send(ROW_QUOTE_PASTE), 200, { reply: ROW_QUOTE_REPLY, signature: "sig-1" });
      await within(board()).findByRole("list", { name: "Events on the board" });
      return conversation;
    }

    it("relates the question to the row, with a dotted line to it, and calls nothing missing", async () => {
      await askedAboutARow();
      const hotspot = within(board()).getByRole("listitem", { name: /^Open question/ });

      expect(hotspot).toHaveAccessibleName("Open question: Which late counts for the credit?, relates to Event 1 and the “late” row for Account team");
      expect(board().querySelectorAll(".relates-edge")).toHaveLength(2);
    });

    it("counts the row on the pinned question's chip", async () => {
      await askedAboutARow();
      const pinned = screen.getByRole("complementary", { name: "Current question" });

      expect(within(pinned).getByRole("button", { name: "On the board ↖ linked to 1 event · 1 term row" })).toBeInTheDocument();
    });
  });
});
