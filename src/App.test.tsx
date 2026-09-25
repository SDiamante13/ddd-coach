import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App.tsx";
import {
  COACH_MESSAGE_TOO_LONG,
  COACH_TOO_LONG,
  COACH_UNAVAILABLE,
  COACH_UNVERIFIED,
  MAX_MESSAGE_CHARS,
} from "./shared/chatContract.ts";
import { stubFetch } from "./test/fetchStub.ts";
import { PASTE_EXAMPLE } from "./ui/PurposeLine.tsx";

afterEach(() => vi.unstubAllGlobals());

const formatCount = (n: number) => new Intl.NumberFormat("en-US").format(n);

function composerOf(box: HTMLElement): HTMLFormElement {
  const form = (box as HTMLTextAreaElement).form;
  if (!form) throw new Error("The message box is not in a form");
  return form;
}

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

  it("says on load what the coach is for", () => {
    renderApp();

    expect(
      screen.getByText(
        "Paste a messy thread or meeting notes about your domain, line breaks and all, " +
          "and talk it through with a DDD coach.",
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

    server.reply(0, 200, { reply: "Hi there", signature: "sig-1" });
    expect(await within(log()).findAllByText("Hi there")).toHaveLength(1);
    expect(within(log()).queryByText("Coach is thinking…")).not.toBeInTheDocument();
  });

  it("sends a pasted thread with its speaker lines and line breaks unchanged", async () => {
    const server = stubFetch();
    const { user, input } = renderApp();
    const thread = "Ops: shipment delayed\nTom (Finance): we can't invoice until carrier confirms";

    await user.click(input());
    await user.paste(thread);
    await user.keyboard("{Enter}");

    expect(server.bodyOf(0)).toEqual({ message: thread, history: [] });
  });

  it("adds a line with Shift+Enter and sends both lines with Enter", async () => {
    const server = stubFetch();
    const { user, input } = renderApp();

    await user.type(input(), "A{Shift>}{Enter}{/Shift}B");
    expect(server.fetchMock).not.toHaveBeenCalled();
    expect(input()).toHaveValue("A\nB");

    await user.keyboard("{Enter}");
    expect(server.bodyOf(0)).toEqual({ message: "A\nB", history: [] });
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

  it("sends with Ctrl+Enter", async () => {
    const server = stubFetch();
    const { user, input } = renderApp();

    await user.type(input(), "Hello coach{Control>}{Enter}{/Control}");

    expect(server.bodyOf(0)).toEqual({ message: "Hello coach", history: [] });
  });

  it.each([
    ["composing", { isComposing: true }],
    ["ending a composition in Safari", { keyCode: 229 }],
  ])("sends nothing on Enter while an input method is %s", async (_state, composition) => {
    const server = stubFetch();
    const { user, input } = renderApp();
    await user.type(input(), "Hello coach");

    fireEvent.keyDown(input(), { key: "Enter", ...composition });

    expect(server.fetchMock).not.toHaveBeenCalled();
  });

  it("adds a line on Enter with a touch pointer and sends with the Send button", async () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    const server = stubFetch();
    const { user, input, sendButton } = renderApp();

    await user.type(input(), "Hello coach{Enter}");
    expect(server.fetchMock).not.toHaveBeenCalled();
    expect(input()).toHaveValue("Hello coach\n");

    await user.click(sendButton());
    expect(server.bodyOf(0)).toEqual({ message: "Hello coach", history: [] });
  });

  it.each([
    ["whitespace-only", "   {Enter}"],
    ["newline-only", "{Shift>}{Enter}{Enter}{/Shift}{Enter}"],
  ])("ignores a %s message", async (_kind, keys) => {
    const server = stubFetch();
    const { user, input, log } = renderApp();

    await user.type(input(), keys);

    expect(within(log()).queryAllByRole("listitem")).toHaveLength(0);
    expect(server.fetchMock).not.toHaveBeenCalled();
  });

  it("ignores another submit while a reply is pending and keeps the draft", async () => {
    const server = stubFetch();
    const { user, input, log, sendButton } = renderApp();

    await user.type(input(), "Hello coach{Enter}");
    await user.type(input(), "Again{Enter}");
    await user.click(sendButton());

    expect(within(log()).getAllByRole("listitem")).toHaveLength(1);
    expect(server.fetchMock).toHaveBeenCalledTimes(1);
    expect(input()).toHaveValue("Again");
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

  it("shows a refusal of an unverifiable message inline, saying it was skipped, without Retry", async () => {
    const server = stubFetch();
    const { user, input, log } = renderApp();

    await user.type(input(), "Hello coach{Enter}");
    server.reply(0, 400, { error: COACH_UNVERIFIED });

    expect(await within(log()).findByRole("alert")).toHaveTextContent(
      "That message couldn't be checked, so it was skipped. Send it again. " +
        "If it keeps happening, copy the conversation so you don't lose it.",
    );
    expect(within(log()).queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
  });

  it.each([
    [413, COACH_MESSAGE_TOO_LONG],
    [413, COACH_TOO_LONG],
    [400, COACH_UNVERIFIED],
  ])("puts a message refused with %i back into the empty box: %s", async (status, error) => {
    const server = stubFetch();
    const { user, input, log } = renderApp();

    await user.type(input(), "Long one{Enter}");
    server.reply(0, status, { error });

    expect(await within(log()).findByRole("alert")).toHaveTextContent(error);
    expect(input()).toHaveValue("Long one");
    expect(within(log()).queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
  });

  it("keeps text typed while a refused message was pending", async () => {
    const server = stubFetch();
    const { user, input, log } = renderApp();

    await user.type(input(), "A{Enter}");
    await user.type(input(), "B");
    server.reply(0, 413, { error: COACH_TOO_LONG });

    await within(log()).findByRole("alert");
    expect(input()).toHaveValue("B");
  });

  it("leaves the box empty after a failure that can be retried", async () => {
    const server = stubFetch();
    const { user, input, log } = renderApp();

    await user.type(input(), "A{Enter}");
    server.reply(0, 502, { error: COACH_UNAVAILABLE });

    expect(await within(log()).findByRole("button", { name: "Retry" })).toBeInTheDocument();
    expect(input()).toHaveValue("");
  });

  it("copies the whole conversation as plain text from an unverifiable refusal", async () => {
    const { server, user, log, send, sendAndReply } = startConversation();
    await sendAndReply("A", "R1", "sig-A");
    server.reply(await send("B"), 400, { error: COACH_UNVERIFIED });

    await user.click(await within(log()).findByRole("button", { name: "Copy the conversation" }));

    expect(await navigator.clipboard.readText()).toBe("You: A\nCoach: R1\n\nYou: B");
    expect(within(log()).getByRole("button", { name: "Copied" })).toBeInTheDocument();
  });

  it("retries the same message without duplicating it in the log", async () => {
    const server = stubFetch();
    const { user, input, log } = renderApp();

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
    const { user, input, log } = renderApp();
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

  it("retries with the signed turns before it, then keeps the retried turn and its signature at its log position", async () => {
    const { server, user, log, send, sendAndReply, sendAndFail } = startConversation();
    await sendAndReply("A", "R1", "sig-A");
    await sendAndFail("B");
    await sendAndReply("C", "R3", "sig-C");

    await user.click(within(log()).getByRole("button", { name: "Retry" }));
    server.reply(3, 200, { reply: "RB", signature: "sig-B" });
    await within(log()).findByText("RB");
    await send("D");

    expect(server.bodyOf(3)).toEqual({ message: "B", history: [{ prompt: "A", reply: "R1", signature: "sig-A" }] });
    expect(server.bodyOf(4)).toEqual({
      message: "D",
      history: [
        { prompt: "A", reply: "R1", signature: "sig-A" },
        { prompt: "B", reply: "RB", signature: "sig-B" },
        { prompt: "C", reply: "R3", signature: "sig-C" },
      ],
    });
  });

  it("collapses a long message in the log to four lines with Show more and Show less", async () => {
    const server = stubFetch();
    const { user, input, log } = renderApp();
    const lines = Array.from({ length: 10 }, (_, i) => `line ${i + 1}`);
    await user.click(input());
    await user.paste(lines.join("\n"));
    await user.keyboard("{Enter}");
    server.reply(0, 200, { reply: "Noted", signature: "sig-1" });
    await within(log()).findByText("Noted");

    expect(within(log()).getByText("line 1 line 2 line 3 line 4…")).toBeInTheDocument();
    expect(within(log()).queryByText(/line 5/)).not.toBeInTheDocument();
    const toggle = within(log()).getByRole("button", { name: "Show more" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);
    expect(within(log()).getByText(/line 10$/)).toBeInTheDocument();
    expect(toggle).toHaveAccessibleName("Show less");
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    await user.click(toggle);
    expect(within(log()).queryByText(/line 10$/)).not.toBeInTheDocument();
  });

  it("shows a short multi-line message in full, without Show more", async () => {
    stubFetch();
    const { user, input, log } = renderApp();

    await user.type(input(), "line one{Shift>}{Enter}{/Shift}line two{Enter}");

    expect(within(log()).getByText("line one\nline two", { normalizer: (text) => text })).toBeInTheDocument();
    expect(within(log()).queryByRole("button", { name: "Show more" })).not.toBeInTheDocument();
  });

  it("shows HTML in a reply as literal text", async () => {
    const server = stubFetch();
    const { user, input, log } = renderApp();

    await user.type(input(), "Hello coach{Enter}");
    server.reply(0, 200, { reply: "<b>x</b>", signature: "sig-1" });

    expect(await within(log()).findByText("<b>x</b>")).toBeInTheDocument();
  });
});
