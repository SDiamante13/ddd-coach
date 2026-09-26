import { fireEvent, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { pasteInto, renderApp, sendText } from "../test/appDriver.tsx";
import { stubFetch } from "../test/fetchStub.ts";

afterEach(() => vi.unstubAllGlobals());

describe("Sending a message", () => {
  it("shows a message sent with Enter as pending, then exactly one reply", async () => {
    const server = stubFetch();
    const { user, input, log } = await renderApp();

    await user.type(input(), "Hello coach{Enter}");
    expect(within(log()).getByText("Hello coach")).toBeInTheDocument();
    expect(within(log()).getByText("Coach is thinking…")).toBeInTheDocument();

    server.reply(0, 200, { reply: "Hi there", signature: "sig-1" });
    expect(await within(log()).findAllByText("Hi there")).toHaveLength(1);
    expect(within(log()).queryByText("Coach is thinking…")).not.toBeInTheDocument();
  });

  it("sends a pasted thread with its speaker lines and line breaks unchanged", async () => {
    const server = stubFetch();
    const { user, input } = await renderApp();
    const thread = "Ops: shipment delayed\nTom (Finance): we can't invoice until carrier confirms";

    await user.click(input());
    await user.paste(thread);
    await user.keyboard("{Enter}");

    expect(server.bodyOf(0)).toEqual({ message: thread, history: [] });
  });

  it("adds a line with Shift+Enter and sends both lines with Enter", async () => {
    const server = stubFetch();
    const { user, input } = await renderApp();

    await user.type(input(), "A{Shift>}{Enter}{/Shift}B");
    expect(server.fetchMock).not.toHaveBeenCalled();
    expect(input()).toHaveValue("A\nB");

    await user.keyboard("{Enter}");
    expect(server.bodyOf(0)).toEqual({ message: "A\nB", history: [] });
  });

  it("sends with the Send button, clears the input and disables Send while pending", async () => {
    stubFetch();
    const { user, input, log, sendButton } = await renderApp();

    await pasteInto(user, input(), "Hello coach");
    await user.click(sendButton());

    expect(within(log()).getByText("Hello coach")).toBeInTheDocument();
    expect(within(log()).getByText("Coach is thinking…")).toBeInTheDocument();
    expect(input()).toHaveValue("");
    expect(sendButton()).toBeDisabled();
  });

  it("returns focus to the message box after sending with the Send button", async () => {
    stubFetch();
    const { user, input, sendButton } = await renderApp();

    await pasteInto(user, input(), "Hello coach");
    await user.click(sendButton());

    expect(input()).toHaveFocus();
  });

  it("sends with Ctrl+Enter", async () => {
    const server = stubFetch();
    const { user, input } = await renderApp();

    await user.type(input(), "Hello coach{Control>}{Enter}{/Control}");

    expect(server.bodyOf(0)).toEqual({ message: "Hello coach", history: [] });
  });

  it.each([
    ["composing", { isComposing: true }],
    ["ending a composition in Safari", { keyCode: 229 }],
  ])("sends nothing on Enter while an input method is %s", async (_state, composition) => {
    const server = stubFetch();
    const { user, input } = await renderApp();
    await pasteInto(user, input(), "Hello coach");

    fireEvent.keyDown(input(), { key: "Enter", ...composition });

    expect(server.fetchMock).not.toHaveBeenCalled();
  });

  it("adds a line on Enter with a touch pointer and sends with the Send button", async () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    const server = stubFetch();
    const { user, input, sendButton } = await renderApp();

    await user.type(input(), "Hello coach{Enter}");
    expect(server.fetchMock).not.toHaveBeenCalled();
    expect(input()).toHaveValue("Hello coach\n");

    await user.click(sendButton());
    expect(server.bodyOf(0)).toEqual({ message: "Hello coach", history: [] });
  });

  it.each([
    ["whitespace-only", "   {Enter}"],
    ["newline-only", "{Shift>}{Enter}{Enter}{/Shift}{Enter}"],
  ])("sends nothing for a %s message and clears it", async (_kind, keys) => {
    const server = stubFetch();
    const { user, input, log } = await renderApp();

    await user.type(input(), keys);

    expect(within(log()).queryAllByRole("listitem")).toHaveLength(0);
    expect(server.fetchMock).not.toHaveBeenCalled();
    expect(input()).toHaveValue("");
  });

  it("ignores another submit while a reply is pending and keeps the draft", async () => {
    const server = stubFetch();
    const { user, input, log, sendButton } = await renderApp();

    await sendText(user, input(), "Hello coach");
    await sendText(user, input(), "Again");
    await user.click(sendButton());

    expect(within(log()).getAllByRole("listitem")).toHaveLength(1);
    expect(server.fetchMock).toHaveBeenCalledTimes(1);
    expect(input()).toHaveValue("Again");
  });
});
