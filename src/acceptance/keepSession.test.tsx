import { cleanup, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { addSwap, renderApp, startConversation } from "../test/appDriver.tsx";
import { SECOND_BOARD_REPLY } from "../test/boardReplies.ts";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const FIRST = "Customer submits a bkg on the portal.";
const GUESS = "Ops chooses another carrier and resubmits the booking.";
const FIXED = "Ops asks the customer before picking another carrier.";
const board = () => screen.getByRole("region", { name: "Event board" });
const cardItem = (words: string) => within(board()).getAllByRole("listitem").find((item) => item.textContent?.includes(words));

async function onTheBoard() {
  const conversation = await startConversation();
  conversation.server.reply(await conversation.send("Here is our #booking-split thread."), 200, { reply: SECOND_BOARD_REPLY, signature: "sig-1" });
  await within(board()).findByRole("list", { name: "Events on the board" });
  return conversation;
}

const SESSION_KEY = "ddd-coach.session.v1";

const REPLIED = { id: "e1", prompt: "Here is our thread.", status: "replied", reply: "R1", signature: "sig-1" };
const stored = (session: object) => localStorage.setItem(SESSION_KEY, JSON.stringify(session));

async function reload() {
  cleanup();
  return renderApp();
}

describe("Keeping the session across a reload (#5)", () => {
  it("keeps the conversation after a reload", async () => {
    const { sendAndReply } = await startConversation();
    await sendAndReply("Here is our thread.", "R1", "sig-1");

    const { log } = await reload();

    expect(within(log()).getByText("Here is our thread.")).toBeInTheDocument();
    expect(within(log()).getByText("R1")).toBeInTheDocument();
  });

  it("keeps a corrected card after a reload", async () => {
    const { user } = await onTheBoard();
    await user.dblClick(within(cardItem(GUESS)!).getByRole("button"));
    const field = within(board()).getByRole("textbox", { name: "Correct this event" });
    await user.clear(field);
    await user.type(field, `${FIXED}{Enter}`);

    await reload();

    expect(cardItem(FIXED)).toHaveTextContent(`YOU SAID${FIXED}`);
  });

  it("keeps a link between cards after a reload", async () => {
    const { user } = await onTheBoard();
    await user.click(within(cardItem(FIRST)!).getByRole("button"));
    await user.click(within(board()).getByRole("button", { name: "Connect to…" }));
    await user.click(within(board()).getByRole("button", { name: `Link to “${GUESS}”` }));
    await within(board()).findByRole("img", { name: `Link from “${FIRST}” to “${GUESS}”` });

    await reload();

    expect(within(board()).getByRole("img", { name: `Link from “${FIRST}” to “${GUESS}”` })).toBeInTheDocument();
  });

  it("forgets the conversation and board after New conversation, but keeps the swaps", async () => {
    const { user } = await onTheBoard();
    await addSwap(user, "Acme Foods", "Customer A");
    await user.click(screen.getByRole("button", { name: "New conversation" }));
    await user.click(screen.getByRole("button", { name: "Clear" }));

    const { log } = await reload();

    expect(within(log()).queryAllByRole("listitem")).toHaveLength(0);
    expect(screen.queryByRole("list", { name: "Events on the board" })).not.toBeInTheDocument();
    expect(screen.getByText("Your swaps (1)")).toBeInTheDocument();
  });

  it("starts an empty session when the stored one is corrupt", async () => {
    localStorage.setItem(SESSION_KEY, "{not json");

    const { log } = await renderApp();

    expect(within(log()).queryAllByRole("listitem")).toHaveLength(0);
  });

  it.each([0, 2])("starts an empty session when the stored one is version %i", async (version) => {
    stored({ version, exchanges: [REPLIED], visitorActions: [] });

    const { log } = await renderApp();

    expect(within(log()).queryAllByRole("listitem")).toHaveLength(0);
  });

  it.each([
    ["exchanges that aren't a list", { exchanges: "nope" }],
    ["an unknown status", { exchanges: [{ ...REPLIED, status: "thinking" }] }],
    ["a blank prompt", { exchanges: [{ ...REPLIED, prompt: "  " }] }],
    ["a reply without a signature", { exchanges: [{ ...REPLIED, signature: 7 }] }],
    ["a failure without its remedy", { exchanges: [{ id: "e1", prompt: "Hi", status: "failed", error: "Down." }] }],
    ["an unknown action", { visitorActions: [{ kind: "delete", after: "e1" }] }],
    ["a correction without its text", { visitorActions: [{ kind: "correct", id: "event:x", after: "e1" }] }],
    ["a link without its end", { visitorActions: [{ kind: "connect", from: "event:x", after: "e1" }] }],
  ])("starts an empty session when the stored one has %s", async (_case, broken) => {
    stored({ version: 1, exchanges: [REPLIED], visitorActions: [], ...broken });

    const { log } = await renderApp();

    expect(within(log()).queryAllByRole("listitem")).toHaveLength(0);
  });

  it.each(["getItem", "setItem"] as const)("keeps working when the browser's storage throws on %s", async (method) => {
    vi.spyOn(Storage.prototype, method).mockImplementation(() => {
      throw new DOMException("Blocked", "SecurityError");
    });

    const { sendAndReply, log } = await startConversation();
    await sendAndReply("Here is our thread.", "R1", "sig-1");

    expect(within(log()).getByText("R1")).toBeInTheDocument();
  });
});
