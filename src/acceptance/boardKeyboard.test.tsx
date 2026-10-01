import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { startConversation } from "../test/appDriver.tsx";
import { SECOND_BOARD_REPLY } from "../test/boardReplies.ts";
import { entityId } from "../domain/entityId.ts";

afterEach(() => vi.unstubAllGlobals());

const FIRST = "Customer submits a bkg on the portal.";
const board = () => screen.getByRole("region", { name: "Event board" });
const card = (place: number) => within(board()).getByRole("button", { name: new RegExp(`^Event ${place} of 3`) });
const nodeOf = (text: string) => board().querySelector(`[data-id="${entityId("event", text)}"]`) as HTMLElement;

async function onTheBoard() {
  const conversation = await startConversation();
  conversation.server.reply(await conversation.send("Here is our #booking-split thread."), 200, { reply: SECOND_BOARD_REPLY, signature: "sig-1" });
  await within(board()).findByRole("list", { name: "Events on the board" });
  card(1).focus();
  return conversation;
}

describe("The board from the keyboard (#20)", () => {
  it("moves between cards in lane order with the arrow keys", async () => {
    const { user } = await onTheBoard();

    await user.keyboard("{ArrowRight}");
    expect(card(2)).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(card(1)).toHaveFocus();
  });

  it("nudges a card with Shift and an arrow, and keeps it there", async () => {
    const { user } = await onTheBoard();

    await user.keyboard("{Shift>}{ArrowRight}{ArrowDown}{/Shift}");

    expect(nodeOf(FIRST).style.transform).toBe("translate(16px,16px)");
    expect(card(1)).toHaveFocus();
  });

  it("opens the card for correcting on Enter", async () => {
    const { user } = await onTheBoard();

    await user.keyboard("{Enter}");

    expect(within(board()).getByRole("textbox", { name: "Correct this event" })).toHaveFocus();
  });

  it("leaves the board for the message box on Escape", async () => {
    const { user, input } = await onTheBoard();

    await user.keyboard("{Escape}");

    expect(input()).toHaveFocus();
  });

  it("says how to get around on first focus", async () => {
    await onTheBoard();

    expect(board().querySelector(".board-hint")).toHaveTextContent("← → move between cards · Shift + arrows nudge · Enter corrects · Esc leaves");
  });

  it("comes back to the card when you leave the correction with Escape, and then off the board", async () => {
    const { user, input } = await onTheBoard();
    await user.keyboard("{Enter}");

    await user.keyboard("{Escape}");
    expect(card(1)).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(input()).toHaveFocus();
  });

  it("gives screen readers the keys on every card", async () => {
    await onTheBoard();

    expect(card(2)).toHaveAccessibleDescription("← → move between cards · Shift + arrows nudge · Enter corrects · Esc leaves");
  });
});
