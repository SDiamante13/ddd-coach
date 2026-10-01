import { screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { startConversation } from "../test/appDriver.tsx";
import { BOARD_DEMO_REPLIES } from "../test/boardDemoReplies.ts";

const LANE = { width: 600, height: 250 };

beforeEach(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: query.includes("reduce"), media: query, addEventListener: () => {}, removeEventListener: () => {} }));
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function (this: HTMLElement) {
    return this.classList.contains("board-lane") ? LANE.width : 0;
  });
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(function (this: HTMLElement) {
    return this.classList.contains("board-lane") ? LANE.height : 0;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const board = () => screen.getByRole("region", { name: "Event board" });
const viewport = () => board().querySelector(".react-flow__viewport");

async function onTheBoard() {
  const conversation = await startConversation();
  conversation.server.reply(await conversation.send("Here is our thread."), 200, { reply: BOARD_DEMO_REPLIES[0], signature: "sig-1" });
  await within(board()).findAllByRole("group", { name: /^Term / });
  return conversation;
}

describe("Fit on a board taller than 50% zoom allows (#131)", () => {
  it("keeps the 50% floor and starts the event row just under the header, centred across", async () => {
    const { user } = await onTheBoard();

    await user.click(within(board()).getByRole("button", { name: "Fit the board" }));

    await waitFor(() => expect(viewport()).toHaveStyle({ transform: "translate(65px,16px) scale(0.5)" }));
  });

  it("counts the terms cut off at the bottom in a chip that pans down to them", async () => {
    const { user } = await onTheBoard();
    await user.click(within(board()).getByRole("button", { name: "Fit the board" }));
    const chip = await within(board()).findByRole("button", { name: "Show the 3 terms below" });
    expect(chip).toHaveTextContent("more below ▾ (3 terms)");

    await user.click(chip);

    await waitFor(() => expect(viewport()).toHaveStyle({ transform: "translate(65px,-36px) scale(0.5)" }));
  });
});
