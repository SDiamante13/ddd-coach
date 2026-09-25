import { cleanup, screen, within } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { COACH_MESSAGE_TOO_LONG, MAX_MESSAGE_CHARS } from "../shared/chatContract.ts";
import { composerOf, formatCount, startConversation } from "../test/appDriver.tsx";

afterEach(() => vi.unstubAllGlobals());

const fullText = (text: string) => (_: string, element: Element | null) =>
  element?.tagName === "P" && element.textContent === text;

async function openSwaps(user: UserEvent) {
  const summary = screen.getByText(/^Your swaps/);
  if (!summary.closest("details")?.open) await user.click(summary);
}

async function addSwap(user: UserEvent, from: string, to: string) {
  await openSwaps(user);
  await user.type(screen.getByRole("textbox", { name: "Replace" }), from);
  await user.type(screen.getByRole("textbox", { name: "With" }), to);
  await user.click(screen.getByRole("button", { name: "Add swap" }));
}

describe("Swapping sensitive words", () => {
  it("sends the placeholder instead of a swapped word", async () => {
    const { user, server, send } = await startConversation();

    await addSwap(user, "Acme", "Customer A");
    await send("Acme is late");

    expect(server.bodyOf(0)).toEqual({ message: "Customer A is late", history: [] });
  });

  it("shows an added swap as a chip and counts it in the summary", async () => {
    const { user } = await startConversation();

    await addSwap(user, "Acme Foods", "Customer A");

    expect(screen.getByText("Your swaps (1)")).toBeInTheDocument();
    expect(screen.getByText("Acme Foods → Customer A")).toBeVisible();
  });

  it("sends and shows only placeholders for every listed word in any case", async () => {
    const { user, server, send, log } = await startConversation();
    await addSwap(user, "Acme Foods", "Customer A");
    await addSwap(user, "Acme", "Customer A");
    await addSwap(user, "Laredo", "Lane 1");

    await send("Acme Foods wants the Laredo lane re-rated. ACME is late again.");

    const sent = "Customer A wants the Lane 1 lane re-rated. Customer A is late again.";
    expect(server.bodyOf(0)).toEqual({ message: sent, history: [] });
    expect(JSON.stringify(server.bodyOf(0))).not.toMatch(/acme|laredo/i);
    expect(within(log()).getByText(sent)).toBeInTheDocument();
  });

  it("shows in 'What's sent' exactly the next request, with each placeholder marked", async () => {
    const { user, server, input } = await startConversation();
    await addSwap(user, "Acme", "Customer A");
    await addSwap(user, "Laredo", "Lane 1");
    await user.type(input(), "acme wants the Laredo lane");

    await user.click(screen.getByRole("button", { name: "Show what's sent" }));

    const preview = screen.getByRole("region", { name: "What's sent" });
    const sent = "Customer A wants the Lane 1 lane";
    expect(within(preview).getByText(fullText(sent))).toBeVisible();
    expect([...preview.querySelectorAll("mark")].map((mark) => mark.textContent)).toEqual(["Customer A", "Lane 1"]);
    expect(within(preview).getByText("2 swaps applied")).toBeVisible();
    await user.type(input(), "{Enter}");
    expect(server.bodyOf(0)).toEqual({ message: sent, history: [] });
  });

  it("shows the draft as it is in 'What's sent' when there are no swaps", async () => {
    const { user, input } = await startConversation();
    await user.type(input(), "Acme is late");

    await user.click(screen.getByRole("button", { name: "Show what's sent" }));

    const preview = screen.getByRole("region", { name: "What's sent" });
    expect(within(preview).getByText(fullText("Acme is late"))).toBeVisible();
    expect(within(preview).getByText("No swaps applied")).toBeVisible();
  });

  it("updates 'What's sent' as the draft and the list change", async () => {
    const { user, input } = await startConversation();
    await user.type(input(), "Acme");
    await user.click(screen.getByRole("button", { name: "Show what's sent" }));
    const preview = screen.getByRole("region", { name: "What's sent" });

    await addSwap(user, "Acme", "Customer A");
    expect(within(preview).getByText(fullText("Customer A"))).toBeVisible();
    expect(within(preview).getByText("1 swap applied")).toBeVisible();

    await user.type(input(), " and ACME");
    expect(within(preview).getByText(fullText("Customer A and Customer A"))).toBeVisible();
    expect(within(preview).getByText("2 swaps applied")).toBeVisible();
  });

  it("offers 'Show what's sent' only for a draft, and says whether it is open", async () => {
    const { user, input } = await startConversation();
    const toggle = () => screen.queryByRole("button", { name: "Show what's sent" });
    expect(toggle()).not.toBeInTheDocument();

    await user.type(input(), "Acme");
    await user.click(toggle()!);
    expect(toggle()).toHaveAttribute("aria-expanded", "true");
    expect(toggle()).toHaveAttribute("aria-controls", screen.getByRole("region", { name: "What's sent" }).id);

    await user.clear(input());
    expect(toggle()).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "What's sent" })).not.toBeInTheDocument();
    await user.type(input(), "A");
    expect(toggle()).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps the swaps in this browser for the next visit", async () => {
    const first = await startConversation();
    await addSwap(first.user, "Acme Foods", "Customer A");

    cleanup();
    const { user } = await startConversation();
    await openSwaps(user);

    expect(screen.getByText("Your swaps (1)")).toBeInTheDocument();
    expect(screen.getByText("Acme Foods → Customer A")).toBeVisible();
  });

  it("removes a swap for good", async () => {
    const first = await startConversation();
    await addSwap(first.user, "Acme Foods", "Customer A");
    await addSwap(first.user, "Laredo", "Lane 1");

    await first.user.click(screen.getByRole("button", { name: "Remove swap Acme Foods" }));
    cleanup();
    const { user } = await startConversation();
    await openSwaps(user);

    expect(screen.getByText("Your swaps (1)")).toBeInTheDocument();
    expect(screen.queryByText("Acme Foods → Customer A")).not.toBeInTheDocument();
    expect(screen.getByText("Laredo → Lane 1")).toBeVisible();
  });

  it("says in 'Your swaps' what swaps don't cover", async () => {
    const { user } = await startConversation();

    await openSwaps(user);

    expect(
      screen.getByText(
        "Swaps run in this browser before anything is sent. They hide only the words you list: rates, " +
          "load IDs and contract terms you haven't listed still go. They don't make an unapproved vendor approved.",
      ),
    ).toBeVisible();
  });

  it("refuses a one-letter word inline and keeps what was typed", async () => {
    const { user } = await startConversation();

    await addSwap(user, "A", "Customer A");

    const replace = screen.getByRole("textbox", { name: "Replace" });
    expect(replace).toHaveAccessibleDescription("Use at least 2 characters, so common letters aren't swapped.");
    expect(replace).toHaveAttribute("aria-invalid", "true");
    expect(replace).toHaveValue("A");
    expect(screen.getByRole("textbox", { name: "With" })).toHaveValue("Customer A");
    expect(screen.getByText("Your swaps (0)")).toBeInTheDocument();
  });

  it("updates the placeholder when a listed word is added again in another case", async () => {
    const { user } = await startConversation();
    await addSwap(user, "Acme", "Customer A");

    await addSwap(user, "ACME", "Customer B");

    expect(screen.getByText("Your swaps (1)")).toBeInTheDocument();
    expect(screen.getByText("ACME → Customer B")).toBeVisible();
  });

  it("replays the sent text as history, so a follow-up verifies", async () => {
    const { user, server, send, sendAndReply } = await startConversation();
    await addSwap(user, "Acme", "Customer A");
    await sendAndReply("Acme is late", "Ask Customer A why.", "sig-1");

    await send("Acme says the carrier");

    expect(server.bodyOf(1)).toEqual({
      message: "Customer A says the carrier",
      history: [{ prompt: "Customer A is late", reply: "Ask Customer A why.", signature: "sig-1" }],
    });
  });

  it("retries with the sent text", async () => {
    const { user, server, log, sendAndFail } = await startConversation();
    await addSwap(user, "Acme", "Customer A");
    await sendAndFail("Acme is late");

    await user.click(within(log()).getByRole("button", { name: "Retry" }));

    expect(server.bodyOf(1)).toEqual(server.bodyOf(0));
    expect(server.bodyOf(1)).toEqual({ message: "Customer A is late", history: [] });
  });

  it("puts the sent text back into the empty box when a message is refused", async () => {
    const { user, server, input, log, send } = await startConversation();
    await addSwap(user, "Acme", "Customer A");

    server.reply(await send("Acme is late"), 413, { error: COACH_MESSAGE_TOO_LONG });

    expect(await within(log()).findByRole("alert")).toHaveTextContent(COACH_MESSAGE_TOO_LONG);
    expect(input()).toHaveValue("Customer A is late");
  });

  it("counts the sent text against the limit, so a swap can tip a draft over", async () => {
    const { user, input, sendButton } = await startConversation();
    await addSwap(user, "Acme", "Customer A");

    await user.click(input());
    await user.paste(`Acme ${"M".repeat(MAX_MESSAGE_CHARS - 10)}`);

    expect(within(composerOf(input())).getByRole("alert")).toHaveTextContent(
      `1 character over the ${formatCount(MAX_MESSAGE_CHARS)} limit.`,
    );
    expect(sendButton()).toBeDisabled();
  });

  it("warns while typing a placeholder that reads as a team or role name, and still adds it", async () => {
    const { user } = await startConversation();
    await openSwaps(user);

    await user.type(screen.getByRole("textbox", { name: "Replace" }), "Maya");
    await user.type(screen.getByRole("textbox", { name: "With" }), "Ops");

    expect(screen.getByRole("textbox", { name: "With" })).toHaveAccessibleDescription(
      '"Ops" reads as a team or role name, so the coach may mix the two up. ' +
        'Try a made-up placeholder like "Customer A" or "Person 1".',
    );
    await user.click(screen.getByRole("button", { name: "Add swap" }));
    expect(screen.getByText("Maya → Ops")).toBeVisible();
  });

  it("warns while typing a placeholder the message already uses", async () => {
    const { user, input } = await startConversation();
    await user.type(input(), "Maya asked dana to rebook");
    await openSwaps(user);

    await user.type(screen.getByRole("textbox", { name: "Replace" }), "Maya");
    await user.type(screen.getByRole("textbox", { name: "With" }), "Dana");

    expect(screen.getByRole("textbox", { name: "With" })).toHaveAccessibleDescription(
      '"Dana" is already in your message, so the coach can\'t tell the two apart. ' +
        'Try a made-up placeholder like "Customer A" or "Person 1".',
    );
  });

  it("warns in 'What's sent' when a listed placeholder is already in the message", async () => {
    const { user, input } = await startConversation();
    await addSwap(user, "Maya", "Dana");
    await user.type(input(), "Maya asked Dana to rebook");

    await user.click(screen.getByRole("button", { name: "Show what's sent" }));

    const preview = screen.getByRole("region", { name: "What's sent" });
    expect(
      within(preview).getByText(
        '"Dana" is already in your message, so the coach can\'t tell the two apart. ' +
          'Try a made-up placeholder like "Customer A" or "Person 1".',
      ),
    ).toBeVisible();
  });

  it("clears every swap from this browser", async () => {
    const first = await startConversation();
    await addSwap(first.user, "Acme Foods", "Customer A");
    await addSwap(first.user, "Laredo", "Lane 1");

    await first.user.click(screen.getByRole("button", { name: "Clear swaps" }));

    expect(screen.getByText("Your swaps (0)")).toBeInTheDocument();
    expect(JSON.stringify({ ...localStorage })).not.toMatch(/Acme|Laredo/);
    cleanup();
    await startConversation();
    expect(screen.getByText("Your swaps (0)")).toBeInTheDocument();
  });
});
