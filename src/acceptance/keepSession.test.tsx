import { act, cleanup, screen, waitFor, within } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { COACH_UNVERIFIED } from "../shared/chatContract.ts";
import { addSwap, composerOf, pasteInto, renderApp, sendText, startConversation } from "../test/appDriver.tsx";
import { stubFetch } from "../test/fetchStub.ts";
import { FIRST_BOARD_REPLY, SECOND_BOARD_REPLY } from "../test/boardReplies.ts";

afterEach(() => {
  vi.useRealTimers();
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

async function correctCard(user: UserEvent, from: string, to: string) {
  await user.dblClick(within(cardItem(from)!).getByRole("button"));
  const field = within(board()).getByRole("textbox", { name: "Correct this event" });
  await user.clear(field);
  await pasteInto(user, field, to);
  await user.keyboard("{Enter}");
  await waitFor(() => expect(cardItem(to)).toHaveTextContent(`YOU SAID${to}`));
}

const linkNamed = (from: string, to: string) => within(board()).findByRole("img", { name: `Link from “${from}” to “${to}”` });

async function reload() {
  cleanup();
  return renderApp();
}

describe("Keeping the session across a reload (#5)", () => {
  it("keeps the conversation after a reload", async () => {
    const { sendAndReply } = await startConversation();
    await sendAndReply("Here is our thread.", "R1", "sig-1");

    const { log } = await reload();

    expect(await within(log()).findByText("Here is our thread.")).toBeInTheDocument();
    expect(within(log()).getByText("R1")).toBeInTheDocument();
  });

  it("keeps a corrected card after a reload", async () => {
    const { user } = await onTheBoard();
    await correctCard(user, GUESS, FIXED);

    await reload();

    await waitFor(() => expect(cardItem(FIXED)).toHaveTextContent(`YOU SAID${FIXED}`));
  });

  it("keeps a link between cards after a reload", async () => {
    const { user } = await onTheBoard();
    await user.click(within(cardItem(FIRST)!).getByRole("button"));
    await user.click(within(board()).getByRole("button", { name: "Connect to…" }));
    await user.click(within(board()).getByRole("button", { name: `Link to “${GUESS}”` }));
    await linkNamed(FIRST, GUESS);

    await reload();

    expect(await linkNamed(FIRST, GUESS)).toBeInTheDocument();
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

  it("brings back a message still waiting at the reload as a failure you can retry", async () => {
    const { send, server } = await startConversation();
    await send("Here is our thread.");

    const { log, user } = await reload();

    expect(within(log()).getByRole("alert")).toHaveTextContent("The page reloaded before the coach answered.");
    await user.click(within(log()).getByRole("button", { name: "Retry" }));
    expect(server.bodyOf(1)).toEqual({ message: "Here is our thread.", history: [] });
  });

  it("offers New conversation when the server no longer trusts the restored history", async () => {
    stored({ version: 1, exchanges: [REPLIED], visitorActions: [] });
    const server = stubFetch();
    const { user, input, log } = await renderApp();

    await sendText(user, input(), "And 48102?");
    expect(server.bodyOf(0)).toMatchObject({ history: [{ signature: "sig-1" }] });
    server.reply(0, 400, { error: COACH_UNVERIFIED, reason: "unverified" });

    expect(await within(log()).findByRole("alert")).toHaveTextContent(COACH_UNVERIFIED);
    expect(within(log()).getByRole("button", { name: "New conversation" })).toBeEnabled();
  });

  it("rests the composer after a reload, as after Send, so the log doesn't jump under a click", async () => {
    const { sendAndReply } = await startConversation();
    await sendAndReply("Here is our thread.", "R1", "sig-1");

    const { input } = await reload();

    expect(composerOf(input())).toHaveAttribute("data-resting");
  });

  describe("the restored board at rest (#124)", () => {
    it("marks no card JUST ADDED after a reload, but keeps Undo for your correction", async () => {
      const { user } = await onTheBoard();
      expect(within(board()).getAllByText("JUST ADDED").length).toBeGreaterThan(0);
      await correctCard(user, GUESS, FIXED);

      await reload();

      expect(await within(board()).findByRole("button", { name: "Undo" })).toBeInTheDocument();
      expect(within(board()).queryAllByText("JUST ADDED")).toHaveLength(0);
      expect(within(board()).queryByRole("button", { name: /^Show the .*(new|updated)/ })).not.toBeInTheDocument();
    });

    it("shows a restored correction's log line settled, and rings only a new one", async () => {
      const { user } = await onTheBoard();
      await correctCard(user, GUESS, FIXED);

      const { user: after } = await reload();
      await waitFor(() => expect(cardItem(FIRST)).toBeDefined());
      await correctCard(after, FIRST, "Customer books on the portal.");

      const lineAbout = (words: string) => [...document.querySelectorAll("p.correction-line")].find((line) => line.textContent?.includes(words));
      expect(lineAbout(FIXED)).toHaveAttribute("data-settled");
      expect(lineAbout("Customer books on the portal.")).not.toHaveAttribute("data-settled");
    });

    it("draws a restored link in ink, not as Just drawn", async () => {
      const { user } = await onTheBoard();
      await user.click(within(cardItem(FIRST)!).getByRole("button"));
      await user.click(within(board()).getByRole("button", { name: "Connect to…" }));
      await user.click(within(board()).getByRole("button", { name: `Link to “${GUESS}”` }));
      await within(board()).findByText("Just drawn");

      await reload();

      await linkNamed(FIRST, GUESS);
      expect(within(board()).queryByText("Just drawn")).not.toBeInTheDocument();
      expect(within(board()).getByRole("img", { name: /^Link from/ }).querySelector("path")!.getAttribute("marker-end")).toContain("--color-ink");
      expect(document.querySelector("p.correction-line")).toHaveAttribute("data-settled");
    });
  });

  describe("the picked-up line (#124)", () => {
    const savedAt = new Date(2026, 8, 29, 14, 5).toISOString();

    it("says when you left off", async () => {
      stored({ version: 1, exchanges: [REPLIED], visitorActions: [], savedAt });

      await renderApp();

      expect(screen.getByText("Picked up where you left off · 29 Sep 2026, 14:05")).toBeInTheDocument();
    });

    it("fades out after 5 seconds", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      stored({ version: 1, exchanges: [REPLIED], visitorActions: [], savedAt });
      await renderApp();
      await screen.findByText(/Picked up where you left off/);

      await act(() => vi.advanceTimersByTimeAsync(5000));

      await waitFor(() => expect(screen.queryByText(/Picked up where you left off/)).not.toBeInTheDocument());
    });

    it("says nothing on a fresh start", async () => {
      await renderApp();

      expect(screen.queryByText(/Picked up where you left off/)).not.toBeInTheDocument();
    });
  });

  it("lands on the board where you left it, at the same pan and zoom (#124)", async () => {
    const onBoard = { ...REPLIED, reply: FIRST_BOARD_REPLY };
    stored({ version: 1, exchanges: [onBoard], visitorActions: [], viewport: { x: -300, y: 16, zoom: 1.25 } });

    await renderApp();

    await waitFor(() => expect(document.querySelector(".react-flow__viewport")).toHaveStyle({ transform: "translate(-300px,16px) scale(1.25)" }));
  });

  it("starts the board at its beginning when the stored pan and zoom are out of range", async () => {
    const onBoard = { ...REPLIED, reply: FIRST_BOARD_REPLY };
    stored({ version: 1, exchanges: [onBoard], visitorActions: [], viewport: { x: -300, y: 16, zoom: 9 } });

    await renderApp();

    expect(screen.getByText(/Customer submits a bkg/)).toBeInTheDocument();
    await waitFor(() => expect(document.querySelector(".react-flow__viewport")).toHaveStyle({ transform: "translate(8px,16px) scale(1)" }));
  });

  it("says so when this browser can't save the session, and keeps working (#124)", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Full", "QuotaExceededError");
    });

    const { sendAndReply, log } = await startConversation();
    await sendAndReply("Here is our thread.", "R1", "sig-1");

    expect(screen.getByText("This browser isn't saving your session, so a reload will lose the conversation and board.")).toBeVisible();
    expect(within(log()).getByText("R1")).toBeInTheDocument();
  });

  it("says nothing about saving when this browser saves the session", async () => {
    const { sendAndReply } = await startConversation();
    await sendAndReply("Here is our thread.", "R1", "sig-1");

    expect(screen.queryByText(/isn't saving your session/)).not.toBeInTheDocument();
  });
});
