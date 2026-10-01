import { act, cleanup, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderApp, startConversation } from "../test/appDriver.tsx";
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

    await waitFor(() => expect(nodeOf(FIRST).style.transform).toBe("translate(16px,16px)"));
    expect(card(1)).toHaveFocus();
  });

  it("opens the card for correcting on Enter", async () => {
    const { user } = await onTheBoard();

    await user.keyboard("{Enter}");

    expect(within(board()).getByRole("textbox", { name: "Correct this event" })).toHaveFocus();
  });

  it("leaves the board for its next control on Escape (#127)", async () => {
    const { user } = await onTheBoard();

    await user.keyboard("{Escape}");

    expect(within(board()).getByRole("button", { name: "Zoom out" })).toHaveFocus();
  });

  it("has no Tab stop before the roving card, not even the board's list (#127)", async () => {
    const { user } = await onTheBoard();
    const list = within(board()).getByRole("list", { name: "Events on the board" });

    await user.tab({ shift: true });

    expect(list).not.toHaveFocus();
    expect(list).toHaveAttribute("tabindex", "-1");
  });

  it("is one Tab stop: only one card at a time can be tabbed to (#127)", async () => {
    const { user } = await onTheBoard();
    await user.keyboard("{ArrowRight}");

    expect(board().querySelectorAll('[data-board-item][tabindex="0"]')).toHaveLength(1);
    expect(card(2)).toHaveAttribute("tabindex", "0");
    expect(card(1)).toHaveAttribute("tabindex", "-1");
  });

  it("goes down from an event to the open question and back up (#127)", async () => {
    const { user } = await onTheBoard();

    await user.keyboard("{ArrowDown}");
    expect(within(board()).getByRole("listitem", { name: /^Open question/ }).querySelector(".hotspot-card")).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(document.activeElement?.getAttribute("aria-label")).toMatch(/^Event \d of 3/);
  });

  describe("the keys hint (#127)", () => {
    const hint = () => board().querySelector(".board-hint");
    const reachByKeyboard = async (user: Awaited<ReturnType<typeof onTheBoard>>["user"]) => {
      await user.keyboard("{Shift}");
      act(() => card(2).focus());
    };

    it("says how to get around when you first reach the board from the keyboard", async () => {
      const { user } = await onTheBoard();

      await reachByKeyboard(user);

      expect(hint()).toHaveTextContent("← → along a row · ↑ ↓ between rows · Shift + arrows nudge · Enter corrects · Esc to the controls");
    });

    it("keeps quiet for a mouse click, so the click doesn't use it up", async () => {
      const { user } = await onTheBoard();

      await user.click(card(2));

      expect(hint()).toBeNull();
    });

    it("isn't shown again in this browser once seen", async () => {
      const { user, input } = await onTheBoard();
      await reachByKeyboard(user);
      act(() => input().focus());

      cleanup();
      const again = await renderApp();
      await within(board()).findByRole("list", { name: "Events on the board" });
      await again.user.keyboard("{Shift}");
      act(() => card(2).focus());

      expect(hint()).toBeNull();
    });
  });

  it("comes back to the card when you leave the correction with Escape, and then off the board", async () => {
    const { user } = await onTheBoard();
    await user.keyboard("{Enter}");

    await user.keyboard("{Escape}");
    expect(card(1)).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(within(board()).getByRole("button", { name: "Zoom out" })).toHaveFocus();
  });

  it("gives screen readers the keys on every card", async () => {
    await onTheBoard();

    expect(card(2)).toHaveAccessibleDescription("← → along a row · ↑ ↓ between rows · Shift + arrows nudge · Enter corrects · Esc to the controls");
  });
});
