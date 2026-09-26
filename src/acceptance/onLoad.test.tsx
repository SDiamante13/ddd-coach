import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MAX_MESSAGE_CHARS } from "../shared/chatContract.ts";
import { formatCount, renderApp } from "../test/appDriver.tsx";
import { PASTE_EXAMPLE } from "../ui/MessageBox.tsx";

afterEach(() => vi.unstubAllGlobals());

describe("On load", () => {
  it("tells the user on load where their messages go and how long the model company may keep them", async () => {
    await renderApp();

    expect(
      screen.getByText(
        "Your messages go to OpenRouter, which routes them to OpenAI to write replies. " +
          "OpenAI doesn't train on them but may keep them for up to 30 days for abuse monitoring. " +
          "Nothing is stored on our server. Don't paste customer names, rates, lanes or contract terms. " +
          "Add swaps below to replace names before sending.",
      ),
    ).toBeVisible();
  });

  it("links the notice to OpenAI's data policy", async () => {
    await renderApp();

    expect(screen.getByRole("link", { name: "OpenAI's data policy" })).toHaveAttribute(
      "href",
      "https://developers.openai.com/api/docs/guides/your-data",
    );
  });

  it("says on load what the coach is for", async () => {
    await renderApp();

    expect(
      screen.getByText(
        "Paste a messy thread or meeting notes. The coach puts the events in order, " +
          "shows which words each team uses differently, and gives you one question for your expert.",
      ),
    ).toBeVisible();
  });

  it("shows an example of what to paste in the empty message box", async () => {
    const { input } = await renderApp();

    expect(input()).toHaveAttribute("placeholder", PASTE_EXAMPLE);
  });

  it("describes the message box with its keys and its character limit", async () => {
    const { input } = await renderApp();

    expect(input()).toHaveAccessibleDescription(
      `Enter sends · Shift+Enter adds a line Up to ${formatCount(MAX_MESSAGE_CHARS)} characters.`,
    );
  });

  it("leaves the Enter key hint out with a touch pointer, where Enter adds a line", async () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    const { input } = await renderApp();

    expect(input()).toHaveAccessibleDescription(`Up to ${formatCount(MAX_MESSAGE_CHARS)} characters.`);
    expect(screen.queryByText(/Enter sends/)).not.toBeInTheDocument();
  });

  it("starts with the message input focused and an empty log", async () => {
    const { input, log } = await renderApp();

    expect(input()).toHaveFocus();
    expect(within(log()).queryAllByRole("listitem")).toHaveLength(0);
  });
});
