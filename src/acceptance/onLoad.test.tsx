import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MAX_MESSAGE_CHARS } from "../shared/chatContract.ts";
import { formatCount, renderApp } from "../test/appDriver.tsx";
import { PASTE_EXAMPLE } from "../ui/MessageBox.tsx";

afterEach(() => vi.unstubAllGlobals());

describe("On load", () => {
  it("tells the user on load where their messages are sent", () => {
    renderApp();

    expect(
      screen.getByText(
        "Your messages are sent to OpenRouter, an AI model provider, to generate replies. " +
          "Nothing is stored on our server. Don't paste customer names or rates.",
      ),
    ).toBeVisible();
  });

  it("says on load what the coach is for", () => {
    renderApp();

    expect(
      screen.getByText(
        "Paste a messy thread or meeting notes. The coach puts the events in order, " +
          "shows which words each team uses differently, and gives you one question for your expert.",
      ),
    ).toBeVisible();
  });

  it("shows an example of what to paste in the empty message box", () => {
    const { input } = renderApp();

    expect(input()).toHaveAttribute("placeholder", PASTE_EXAMPLE);
  });

  it("describes the message box with its keys and its character limit", () => {
    const { input } = renderApp();

    expect(input()).toHaveAccessibleDescription(
      `Enter sends · Shift+Enter adds a line Up to ${formatCount(MAX_MESSAGE_CHARS)} characters.`,
    );
  });

  it("leaves the Enter key hint out with a touch pointer, where Enter adds a line", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    const { input } = renderApp();

    expect(input()).toHaveAccessibleDescription(`Up to ${formatCount(MAX_MESSAGE_CHARS)} characters.`);
    expect(screen.queryByText(/Enter sends/)).not.toBeInTheDocument();
  });

  it("starts with the message input focused and an empty log", () => {
    const { input, log } = renderApp();

    expect(input()).toHaveFocus();
    expect(within(log()).queryAllByRole("listitem")).toHaveLength(0);
  });
});
