import { screen, within } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { startConversation } from "../test/appDriver.tsx";

afterEach(() => vi.unstubAllGlobals());

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
});
