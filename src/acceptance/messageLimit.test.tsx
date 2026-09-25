import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MAX_MESSAGE_CHARS } from "../shared/chatContract.ts";
import { composerOf, formatCount, renderApp } from "../test/appDriver.tsx";
import { stubFetch } from "../test/fetchStub.ts";

afterEach(() => vi.unstubAllGlobals());

describe("Message limit", () => {
  it("shows no character count below 80% of the limit, not counting surrounding whitespace", async () => {
    const { user, input } = renderApp();

    await user.click(input());
    await user.paste(`${"M".repeat(MAX_MESSAGE_CHARS * 0.8 - 1)}\n\n\n`);

    expect(screen.queryByText(/characters$/)).not.toBeInTheDocument();
  });

  it("shows the character count once a draft reaches 80% of the limit", async () => {
    const { user, input } = renderApp();
    const nearLimit = MAX_MESSAGE_CHARS * 0.8;

    await user.click(input());
    await user.paste("M".repeat(nearLimit));

    expect(
      screen.getByText(`${formatCount(nearLimit)} / ${formatCount(MAX_MESSAGE_CHARS)} characters`),
    ).toBeVisible();
  });

  it("does not flag a draft at the limit with surrounding spaces", async () => {
    const { user, input, sendButton } = renderApp();

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
    const { user, input, sendButton } = renderApp();

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
    const { user, input, log } = renderApp();
    const tooLong = "M".repeat(MAX_MESSAGE_CHARS + 1);
    await user.click(input());
    await user.paste(tooLong);

    await user.keyboard("{Enter}");

    expect(server.fetchMock).not.toHaveBeenCalled();
    expect(within(log()).queryAllByRole("listitem")).toHaveLength(0);
    expect(input()).toHaveValue(tooLong);
  });
});
