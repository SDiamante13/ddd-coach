import { within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderApp } from "../test/appDriver.tsx";
import { stubFetch } from "../test/fetchStub.ts";

afterEach(() => vi.unstubAllGlobals());

describe("Retry", () => {
  it("shows a server failure inline with Retry beside the message", async () => {
    const server = stubFetch();
    const { user, input, log } = await renderApp();

    await user.type(input(), "Hello coach{Enter}");
    server.reply(0, 502, { error: "The coach sent an empty reply. Try again." });

    const entry = await within(log()).findByRole("listitem");
    expect(await within(entry).findByRole("alert")).toHaveTextContent("The coach sent an empty reply. Try again.");
    expect(within(entry).getByRole("button", { name: "Retry" })).toBeInTheDocument();
    expect(within(log()).getAllByText("Hello coach")).toHaveLength(1);
  });

  it("retries the same message without duplicating it in the log", async () => {
    const server = stubFetch();
    const { user, input, log } = await renderApp();

    await user.type(input(), "Hello coach{Enter}");
    server.reply(0, 502, { error: "The coach is unavailable." });
    await user.click(await within(log()).findByRole("button", { name: "Retry" }));

    expect(within(log()).getByText("Coach is thinking…")).toBeInTheDocument();
    expect(server.bodyOf(1)).toEqual(server.bodyOf(0));
    server.reply(1, 200, { reply: "Hi there", signature: "sig-1" });
    expect(await within(log()).findAllByText("Hi there")).toHaveLength(1);
    expect(within(log()).getAllByText("Hello coach")).toHaveLength(1);
    expect(within(log()).queryByRole("alert")).not.toBeInTheDocument();
  });

  it("disables Retry while another exchange is pending, then enables it once that settles", async () => {
    const server = stubFetch();
    const { user, input, log } = await renderApp();
    await user.type(input(), "First message{Enter}");
    server.fail(0);
    const retryButton = await within(log()).findByRole("button", { name: "Retry" });

    await user.type(input(), "Second message{Enter}");
    await user.click(retryButton);

    expect(retryButton).toBeDisabled();
    expect(server.fetchMock).toHaveBeenCalledTimes(2);
    server.reply(1, 200, { reply: "Hi there", signature: "sig-1" });
    await within(log()).findByText("Hi there");
    expect(retryButton).toBeEnabled();
  });

  it("shows a network failure inline with Retry", async () => {
    const server = stubFetch();
    const { user, input, log } = await renderApp();

    await user.type(input(), "Hello coach{Enter}");
    server.fail(0);

    expect(await within(log()).findByRole("alert")).toHaveTextContent("Could not reach the coach.");
    expect(within(log()).getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });
});
