import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MAX_MESSAGE_CHARS } from "../shared/chatContract.ts";
import { composerOf, formatCount, renderApp } from "../test/appDriver.tsx";
import { stubFetch } from "../test/fetchStub.ts";

afterEach(() => vi.unstubAllGlobals());

function threadOf(chars: number, lines: number): string {
  const line = (i: number) => `Speaker ${i}: `.padEnd(Math.ceil(chars / lines), "m");
  return Array.from({ length: lines }, (_, i) => line(i)).join("\n").slice(0, chars);
}

describe("Message limit", () => {
  it("shows no character count below 80% of the limit, not counting surrounding whitespace", async () => {
    const { user, input } = await renderApp();

    await user.click(input());
    await user.paste(`${"M".repeat(MAX_MESSAGE_CHARS * 0.8 - 1)}\n\n\n`);

    expect(screen.queryByText(/characters$/)).not.toBeInTheDocument();
  });

  it("shows the character count once a draft reaches 80% of the limit", async () => {
    const { user, input } = await renderApp();
    const nearLimit = MAX_MESSAGE_CHARS * 0.8;

    await user.click(input());
    await user.paste("M".repeat(nearLimit));

    expect(
      screen.getByText(`${formatCount(nearLimit)} / ${formatCount(MAX_MESSAGE_CHARS)} characters`),
    ).toBeVisible();
  });

  it("does not flag a draft at the limit with surrounding spaces", async () => {
    const { user, input, sendButton } = await renderApp();

    await user.click(input());
    await user.paste(`  ${"M".repeat(MAX_MESSAGE_CHARS)}  `);

    expect(input()).not.toHaveAttribute("aria-invalid");
    expect(sendButton()).toBeEnabled();
    expect(within(composerOf(input())).queryByRole("alert")).not.toBeInTheDocument();
  });

  it.each([
    [1, "1 character"],
    [1412, "1,412 characters"],
  ])("flags a draft %i over the limit, disables Send and says by how much", async (over, overage) => {
    const { user, input, sendButton } = await renderApp();

    await user.click(input());
    await user.paste("M".repeat(MAX_MESSAGE_CHARS + over));

    expect(input()).toHaveAttribute("aria-invalid", "true");
    expect(sendButton()).toBeDisabled();
    expect(within(composerOf(input())).getByRole("alert")).toHaveTextContent(
      `${overage} over the ${formatCount(MAX_MESSAGE_CHARS)} limit. Your text stays here. Trim it to send.`,
    );
  });

  it("sends nothing on Enter over the limit and keeps the draft", async () => {
    const server = stubFetch();
    const { user, input, log } = await renderApp();
    const tooLong = "M".repeat(MAX_MESSAGE_CHARS + 1);
    await user.click(input());
    await user.paste(tooLong);

    await user.keyboard("{Enter}");

    expect(server.fetchMock).not.toHaveBeenCalled();
    expect(within(log()).queryAllByRole("listitem")).toHaveLength(0);
    expect(input()).toHaveValue(tooLong);
  });

  it("sends a 20,000-character thread of 40 lines with its line breaks kept", async () => {
    const server = stubFetch();
    const { user, input, sendButton } = await renderApp();
    const thread = threadOf(20_000, 40);
    await user.click(input());
    await user.paste(thread);

    expect(within(composerOf(input())).queryByRole("alert")).not.toBeInTheDocument();
    expect(sendButton()).toBeEnabled();
    await user.keyboard("{Enter}");

    expect(server.bodyOf(0)).toEqual({ message: thread, history: [] });
  });
});
