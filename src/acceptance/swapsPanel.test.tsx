import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { addSwap, openSwaps, pasteInto, startConversation } from "../test/appDriver.tsx";

afterEach(() => vi.unstubAllGlobals());

const panel = () => screen.getByText(/^Your swaps/).closest("details");

describe("Swaps panel", () => {
  it("closes when a message is sent, so the conversation stays in view", async () => {
    const { user, send } = await startConversation();
    await addSwap(user, "Acme Foods", "Customer A");

    await send("Acme Foods wants the lane re-rated.");

    expect(panel()).not.toHaveAttribute("open");
  });

  it("opens again after a send with its swaps kept", async () => {
    const { user, send } = await startConversation();
    await addSwap(user, "Acme Foods", "Customer A");
    await send("Acme Foods wants the lane re-rated.");

    await openSwaps(user);

    expect(screen.getByText("Acme Foods → Customer A")).toBeInTheDocument();
  });

  it("heads the What's sent preview with a visible heading", async () => {
    const { user, input } = await startConversation();
    await pasteInto(user, input(), "Acme Foods wants the lane re-rated.");

    await user.click(screen.getByRole("button", { name: "Show what's sent" }));

    const preview = screen.getByRole("region", { name: "What's sent" });
    expect(within(preview).getByRole("heading", { name: "What's sent" })).toBeVisible();
  });
});
