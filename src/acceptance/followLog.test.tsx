import { fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { startConversation } from "../test/appDriver.tsx";

const COMPOSER_TOP = 400;
const AT_NEWEST = COMPOSER_TOP;
const READING_UP = COMPOSER_TOP + 300;
const scrollIntoView = vi.fn();
let newestEntryBottom = AT_NEWEST;

beforeEach(() => {
  newestEntryBottom = AT_NEWEST;
  scrollIntoView.mockClear();
  vi.spyOn(Element.prototype, "scrollIntoView").mockImplementation(function (this: Element, options) {
    scrollIntoView(this, options);
  });
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
    if (this.tagName === "FORM") return new DOMRect(0, COMPOSER_TOP, 600, 150);
    return new DOMRect(0, newestEntryBottom - 100, 600, 100);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function scrollTo(entryBottom: number) {
  newestEntryBottom = entryBottom;
  fireEvent.scroll(window);
}

async function replyArrivesWhileReadingUp() {
  const conversation = await startConversation();
  const index = await conversation.send("Hello coach");
  scrollTo(READING_UP);
  scrollIntoView.mockClear();
  conversation.server.reply(index, 200, { reply: "Hi there", signature: "sig-1" });
  await within(conversation.log()).findByText("Hi there");
  return conversation;
}

function lastRevealed(): Element | undefined {
  return scrollIntoView.mock.lastCall?.[0];
}

describe("Following the log", () => {
  it("brings a failed send's Retry into view above the composer", async () => {
    const { sendAndFail, log } = await startConversation();

    await sendAndFail("Hello coach");

    expect(lastRevealed()).toBe(within(log()).getByRole("button", { name: "Retry" }));
    expect(scrollIntoView.mock.lastCall?.[1]).toMatchObject({ block: "end" });
  });

  it("jumps without animation when the visitor prefers reduced motion", async () => {
    vi.stubGlobal("matchMedia", (query: string) => ({ matches: query === "(prefers-reduced-motion: reduce)" }));
    const { sendAndFail } = await startConversation();

    await sendAndFail("Hello coach");

    expect(scrollIntoView.mock.lastCall?.[1]).toMatchObject({ behavior: "auto" });
  });

  it("leaves the view where it is when a reply arrives while the visitor reads further up", async () => {
    await replyArrivesWhileReadingUp();

    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it("always brings the visitor's own send into view, even from further up", async () => {
    const { send, sendAndReply, log } = await startConversation();
    await sendAndReply("Hello coach", "Hi there");
    scrollTo(READING_UP);
    scrollIntoView.mockClear();

    await send("And the booking?");

    expect(lastRevealed()).toBe(within(log()).getByText("Coach is thinking…"));
  });

  it("offers New reply ↓ when a reply arrives while the visitor reads further up", async () => {
    await replyArrivesWhileReadingUp();

    expect(screen.getByRole("button", { name: "New reply ↓" })).toBeInTheDocument();
  });

  it("brings the newest reply into view from New reply ↓", async () => {
    const { user, log } = await replyArrivesWhileReadingUp();

    await user.click(screen.getByRole("button", { name: "New reply ↓" }));

    expect(lastRevealed()).toBe(within(log()).getByText("Hi there"));
  });

  it("drops New reply ↓ once the visitor is back at the newest entry", async () => {
    await replyArrivesWhileReadingUp();

    scrollTo(AT_NEWEST);

    expect(screen.queryByRole("button", { name: "New reply ↓" })).not.toBeInTheDocument();
  });

  it("drops New reply ↓ when the visitor sends again", async () => {
    const { send } = await replyArrivesWhileReadingUp();

    await send("And the booking?");

    expect(screen.queryByRole("button", { name: "New reply ↓" })).not.toBeInTheDocument();
  });

  it("follows the reply to a send made from further up", async () => {
    const { send, server, sendAndReply, log } = await startConversation();
    await sendAndReply("Hello coach", "Hi there");
    scrollTo(READING_UP);
    const index = await send("And the booking?");
    scrollIntoView.mockClear();

    server.reply(index, 502, { error: "The coach is unavailable." });
    await within(log()).findByRole("alert");

    expect(lastRevealed()).toBe(within(log()).getByRole("button", { name: "Retry" }));
  });
});
