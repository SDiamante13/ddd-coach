import { screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { startConversation } from "../test/appDriver.tsx";
import { FIRST_BOARD_REPLY } from "../test/boardReplies.ts";

const LANE_WIDTH = 600;

beforeEach(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: query.includes("reduce"), media: query, addEventListener: () => {}, removeEventListener: () => {} }));
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function (this: HTMLElement) {
    return this.classList.contains("board-lane") ? LANE_WIDTH : 0;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const board = () => screen.getByRole("region", { name: "Event board" });

async function onTheBoard() {
  const conversation = await startConversation();
  conversation.server.reply(await conversation.send("Here is our #booking-split thread."), 200, { reply: FIRST_BOARD_REPLY, signature: "sig-1" });
  await within(board()).findByRole("list", { name: "Events on the board" });
  return conversation;
}

describe("Finding your way along the board (#20)", () => {
  it("counts the cards past the lane's right edge in a chip, so none is cut silently", async () => {
    await onTheBoard();

    expect(within(board()).getByRole("button", { name: "Show the 2 later events" })).toHaveTextContent("2 later ▸");
    expect(within(board()).queryByRole("button", { name: /earlier/ })).not.toBeInTheDocument();
  });

  it("brings the later cards in when you use the chip, then counts the earlier ones", async () => {
    const { user } = await onTheBoard();

    await user.click(within(board()).getByRole("button", { name: "Show the 2 later events" }));

    await waitFor(() => expect(within(board()).getByRole("button", { name: "Show the 3 earlier events" })).toHaveTextContent("◂ 3 earlier"));
    await waitFor(() => expect(board().querySelector(".react-flow__viewport")).toHaveStyle({ transform: "translate(-468px,16px) scale(1)" }));
    expect(within(board()).queryByRole("button", { name: /later/ })).not.toBeInTheDocument();
    expect(within(board()).getByRole("button", { name: "Follow coach" })).toHaveAttribute("aria-pressed", "false");
  });

  it("zooms from the controls, shows the zoom level, and stops following the coach", async () => {
    const { user } = await onTheBoard();
    const zoomLevel = () => within(board()).getByText(/^\d+%$/);
    expect(zoomLevel()).toHaveTextContent("100%");

    await user.click(within(board()).getByRole("button", { name: "Zoom in" }));

    await waitFor(() => expect(zoomLevel()).toHaveTextContent("120%"));
    expect(within(board()).getByRole("button", { name: "Follow coach" })).toHaveAttribute("aria-pressed", "false");
    expect(within(board()).getByRole("button", { name: "Zoom out" })).toBeEnabled();
    expect(within(board()).getByRole("button", { name: "Fit the board" })).toBeEnabled();
  });

  it("shows a small overview of the whole board", async () => {
    await onTheBoard();

    expect(within(board()).getByRole("img", { name: "Board overview" })).toBeInTheDocument();
  });

  it("brings a card you select fully into view, clear of the edge chips, moving the board no further than needed (#126, #127)", async () => {
    const { user } = await onTheBoard();

    await user.click(within(board()).getByRole("button", { name: /^Event 5 of 5/ }));

    await waitFor(() => expect(board().querySelector(".react-flow__viewport")).toHaveStyle({ transform: "translate(-460px,16px) scale(1)" }));
  });

  it("leaves the board where it is when the card you select is already in view (#126)", async () => {
    const { user } = await onTheBoard();

    await user.click(within(board()).getByRole("button", { name: /^Event 2 of 5/ }));

    expect(board().querySelector(".react-flow__viewport")).toHaveStyle({ transform: "translate(8px,16px) scale(1)" });
  });
});
