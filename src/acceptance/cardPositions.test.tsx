import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderApp } from "../test/appDriver.tsx";
import { SECOND_BOARD_REPLY } from "../test/boardReplies.ts";
import { entityId } from "../domain/entityId.ts";

afterEach(() => vi.unstubAllGlobals());

const FIRST = "Customer submits a bkg on the portal.";
const GUESS = "Ops chooses another carrier and resubmits the booking.";
const board = () => screen.getByRole("region", { name: "Event board" });
const nodeOf = (text: string) => board().querySelector(`[data-id="${entityId("event", text)}"]`) as HTMLElement;
const REPLIED = { id: "e1", prompt: "Here is our #booking-split thread.", status: "replied", reply: SECOND_BOARD_REPLY, signature: "sig-1" };
const LINK = { kind: "connect", from: entityId("event", FIRST), to: entityId("event", GUESS), after: "e1" };
const MOVE = { kind: "move", id: entityId("event", FIRST), x: 40, y: 260, after: "e1" };
const stored = (visitorActions: object[]) =>
  localStorage.setItem("ddd-coach.session.v1", JSON.stringify({ version: 1, exchanges: [REPLIED], visitorActions }));

describe("Cards keep where you put them (#20)", () => {
  it("puts a moved card back where you left it after a reload", async () => {
    stored([MOVE]);

    await renderApp();

    expect(await within(board()).findByRole("list", { name: "Events on the board" })).toBeInTheDocument();
    expect(nodeOf(FIRST).style.transform).toBe("translate(40px,260px)");
  });

  it("takes back your last link, not your last move, on Undo", async () => {
    stored([LINK, MOVE]);
    const { user } = await renderApp();
    await within(board()).findByRole("img", { name: `Link from “${FIRST}” to “${GUESS}”` });

    await user.click(within(screen.getByRole("log")).getByRole("button", { name: "Undo" }));

    expect(within(board()).queryByRole("img", { name: /^Link from/ })).not.toBeInTheDocument();
    expect(nodeOf(FIRST).style.transform).toBe("translate(40px,260px)");
  });
});
