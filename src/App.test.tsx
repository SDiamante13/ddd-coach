import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App.tsx";
import { stubFetch } from "./test/fetchStub.ts";

afterEach(() => vi.unstubAllGlobals());

function renderApp() {
  const user = userEvent.setup();
  render(<App />);
  return {
    user,
    input: () => screen.getByRole("textbox", { name: "Message" }),
    log: () => screen.getByRole("log"),
    sendButton: () => screen.getByRole("button", { name: "Send" }),
  };
}

function startConversation() {
  const server = stubFetch();
  const app = renderApp();

  async function send(message: string): Promise<number> {
    await app.user.type(app.input(), `${message}{Enter}`);
    return server.fetchMock.mock.calls.length - 1;
  }

  return {
    ...app,
    server,
    send,
    sendAndReply: async (message: string, reply: string, signature = "") => {
      server.reply(await send(message), 200, { reply, signature });
      await within(app.log()).findByText(reply);
    },
    sendAndFail: async (message: string) => {
      server.reply(await send(message), 502, { error: "The coach is unavailable." });
      await within(app.log()).findByRole("alert");
    },
  };
}

describe("Connection test", () => {
  it("tells the user on load where their messages are sent", () => {
    renderApp();

    expect(
      screen.getByText(
        "Your messages are sent to OpenRouter, an AI model provider, to generate replies. " +
          "Nothing is stored on our server. Don't paste customer names or rates.",
      ),
    ).toBeVisible();
  });

  it("starts with the message input focused and an empty log", () => {
    const { input, log } = renderApp();

    expect(input()).toHaveFocus();
    expect(within(log()).queryAllByRole("listitem")).toHaveLength(0);
  });

  it("shows a message sent with Enter as pending, then exactly one reply", async () => {
    const server = stubFetch();
    const { user, input, log } = renderApp();

    await user.type(input(), "Hello coach{Enter}");
    expect(within(log()).getByText("Hello coach")).toBeInTheDocument();
    expect(within(log()).getByText("Coach is thinking…")).toBeInTheDocument();

    server.reply(0, 200, { reply: "Hi there" });
    expect(await within(log()).findAllByText("Hi there")).toHaveLength(1);
    expect(within(log()).queryByText("Coach is thinking…")).not.toBeInTheDocument();
  });

  it("sends with the Send button, clears the input and disables Send while pending", async () => {
    stubFetch();
    const { user, input, log, sendButton } = renderApp();

    await user.type(input(), "Hello coach");
    await user.click(sendButton());

    expect(within(log()).getByText("Hello coach")).toBeInTheDocument();
    expect(within(log()).getByText("Coach is thinking…")).toBeInTheDocument();
    expect(input()).toHaveValue("");
    expect(sendButton()).toBeDisabled();
  });

  it("ignores blank or whitespace-only messages", async () => {
    const server = stubFetch();
    const { user, input, log } = renderApp();

    await user.type(input(), "   {Enter}");

    expect(within(log()).queryAllByRole("listitem")).toHaveLength(0);
    expect(server.fetchMock).not.toHaveBeenCalled();
  });

  it("ignores another submit while a reply is pending", async () => {
    const server = stubFetch();
    const { user, input, log, sendButton } = renderApp();

    await user.type(input(), "Hello coach{Enter}");
    await user.type(input(), "Again{Enter}");
    await user.click(sendButton());

    expect(within(log()).getAllByRole("listitem")).toHaveLength(1);
    expect(server.fetchMock).toHaveBeenCalledTimes(1);
  });

  it("shows a server failure inline with Retry beside the message", async () => {
    const server = stubFetch();
    const { user, input, log } = renderApp();

    await user.type(input(), "Hello coach{Enter}");
    server.reply(0, 502, { error: "The coach sent an empty reply. Try again." });

    const entry = await within(log()).findByRole("listitem");
    expect(await within(entry).findByRole("alert")).toHaveTextContent("The coach sent an empty reply. Try again.");
    expect(within(entry).getByRole("button", { name: "Retry" })).toBeInTheDocument();
    expect(within(log()).getAllByText("Hello coach")).toHaveLength(1);
  });

  it("shows a refusal of an overlong message inline, asking to shorten it, without Retry", async () => {
    const server = stubFetch();
    const { user, input, log } = renderApp();

    await user.type(input(), "A very long message{Enter}");
    server.reply(0, 413, { error: "This message is too long for the coach. Shorten it and send it again." });

    expect(await within(log()).findByRole("alert")).toHaveTextContent(
      "This message is too long for the coach. Shorten it and send it again.",
    );
    expect(within(log()).queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
  });

  it("retries the same message without duplicating it in the log", async () => {
    const server = stubFetch();
    const { user, input, log } = renderApp();

    await user.type(input(), "Hello coach{Enter}");
    server.reply(0, 502, { error: "The coach is unavailable." });
    await user.click(await within(log()).findByRole("button", { name: "Retry" }));

    expect(within(log()).getByText("Coach is thinking…")).toBeInTheDocument();
    expect(server.bodyOf(1)).toEqual(server.bodyOf(0));
    server.reply(1, 200, { reply: "Hi there" });
    expect(await within(log()).findAllByText("Hi there")).toHaveLength(1);
    expect(within(log()).getAllByText("Hello coach")).toHaveLength(1);
    expect(within(log()).queryByRole("alert")).not.toBeInTheDocument();
  });

  it("disables Retry while another exchange is pending, then enables it once that settles", async () => {
    const server = stubFetch();
    const { user, input, log } = renderApp();
    await user.type(input(), "First message{Enter}");
    server.fail(0);
    const retryButton = await within(log()).findByRole("button", { name: "Retry" });

    await user.type(input(), "Second message{Enter}");
    await user.click(retryButton);

    expect(retryButton).toBeDisabled();
    expect(server.fetchMock).toHaveBeenCalledTimes(2);
    server.reply(1, 200, { reply: "Hi there" });
    await within(log()).findByText("Hi there");
    expect(retryButton).toBeEnabled();
  });

  it("shows a network failure inline with Retry", async () => {
    const server = stubFetch();
    const { user, input, log } = renderApp();

    await user.type(input(), "Hello coach{Enter}");
    server.fail(0);

    expect(await within(log()).findByRole("alert")).toHaveTextContent("Could not reach the coach.");
    expect(within(log()).getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("sends a follow-up with the earlier replied turn and its signature as history", async () => {
    const { server, send, sendAndReply } = startConversation();
    await sendAndReply("A", "R1", "sig-A");

    await send("B");

    expect(server.bodyOf(0)).toEqual({ message: "A", history: [] });
    expect(server.bodyOf(1)).toEqual({ message: "B", history: [{ prompt: "A", reply: "R1", signature: "sig-A" }] });
  });

  it("leaves a failed turn out of the next message's history", async () => {
    const { server, send, sendAndFail } = startConversation();
    await sendAndFail("A");

    await send("B");

    expect(server.bodyOf(1)).toEqual({ message: "B", history: [] });
  });

  it("retries with the turns before it, then keeps the retried turn at its log position", async () => {
    const { server, user, log, send, sendAndReply, sendAndFail } = startConversation();
    await sendAndReply("A", "R1");
    await sendAndFail("B");
    await sendAndReply("C", "R3");

    await user.click(within(log()).getByRole("button", { name: "Retry" }));
    server.reply(3, 200, { reply: "RB" });
    await within(log()).findByText("RB");
    await send("D");

    expect(server.bodyOf(3)).toEqual({ message: "B", history: [{ prompt: "A", reply: "R1", signature: "" }] });
    expect(server.bodyOf(4)).toEqual({
      message: "D",
      history: [
        { prompt: "A", reply: "R1", signature: "" },
        { prompt: "B", reply: "RB", signature: "" },
        { prompt: "C", reply: "R3", signature: "" },
      ],
    });
  });

  it("shows HTML in a reply as literal text", async () => {
    const server = stubFetch();
    const { user, input, log } = renderApp();

    await user.type(input(), "Hello coach{Enter}");
    server.reply(0, 200, { reply: "<b>x</b>" });

    expect(await within(log()).findByText("<b>x</b>")).toBeInTheDocument();
  });
});
