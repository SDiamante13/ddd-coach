import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  COACH_MESSAGE_TOO_LONG,
  COACH_OUT_OF_CREDIT,
  COACH_TOO_LONG,
  COACH_UNAVAILABLE,
  COACH_UNVERIFIED,
} from "../shared/chatContract.ts";
import { ACCESS_REQUIRED } from "../shared/accessContract.ts";
import { composerOf, renderApp, startConversation } from "../test/appDriver.tsx";
import { stubFetch } from "../test/fetchStub.ts";

afterEach(() => vi.unstubAllGlobals());

describe("Refusals", () => {
  it("shows a refusal of an overlong message inline, asking to shorten it, without Retry", async () => {
    const server = stubFetch();
    const { user, input, log } = await renderApp();

    await user.type(input(), "A very long message{Enter}");
    server.reply(0, 413, { error: "This message is too long for the coach. Shorten it and send it again." });

    expect(await within(log()).findByRole("alert")).toHaveTextContent(
      "This message is too long for the coach. Shorten it and send it again.",
    );
    expect(within(log()).queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
  });

  it("shows a refusal of an unverifiable message inline, saying it was skipped, without Retry", async () => {
    const server = stubFetch();
    const { user, input, log } = await renderApp();

    await user.type(input(), "Hello coach{Enter}");
    server.reply(0, 400, { error: COACH_UNVERIFIED });

    expect(await within(log()).findByRole("alert")).toHaveTextContent(
      "That message couldn't be checked, so it was skipped. Send it again. " +
        "If it keeps happening, copy the conversation and start a new one.",
    );
    expect(within(log()).queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
  });

  it.each([
    [413, COACH_MESSAGE_TOO_LONG],
    [413, COACH_TOO_LONG],
    [400, COACH_UNVERIFIED],
    [503, COACH_OUT_OF_CREDIT],
  ])("puts a message refused with %i back into the empty box: %s", async (status, error) => {
    const server = stubFetch();
    const { user, input, log } = await renderApp();

    await user.type(input(), "Long one{Enter}");
    server.reply(0, status, { error });

    expect(await within(log()).findByRole("alert")).toHaveTextContent(error);
    expect(input()).toHaveValue("Long one");
    expect(within(log()).queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
  });

  it("keeps text typed while a refused message was pending", async () => {
    const server = stubFetch();
    const { user, input, log } = await renderApp();

    await user.type(input(), "A{Enter}");
    await user.type(input(), "B");
    server.reply(0, 413, { error: COACH_TOO_LONG });

    await within(log()).findByRole("alert");
    expect(input()).toHaveValue("B");
  });

  it("leaves the box empty after a failure that can be retried", async () => {
    const server = stubFetch();
    const { user, input, log } = await renderApp();

    await user.type(input(), "A{Enter}");
    server.reply(0, 502, { error: COACH_UNAVAILABLE });

    expect(await within(log()).findByRole("button", { name: "Retry" })).toBeInTheDocument();
    expect(input()).toHaveValue("");
  });

  it("copies the whole conversation as plain text from an unverifiable refusal", async () => {
    const { server, user, log, send, sendAndReply } = await startConversation();
    await sendAndReply("A", "R1", "sig-A");
    server.reply(await send("B"), 400, { error: COACH_UNVERIFIED });

    await user.click(await within(log()).findByRole("button", { name: "Copy the conversation" }));

    expect(await navigator.clipboard.readText()).toBe("You: A\nCoach: R1\n\nYou: B");
    expect(within(log()).getByRole("button", { name: "Copied" })).toBeInTheDocument();
    expect(within(log()).getByRole("status")).toHaveTextContent("Copied");
  });

  it("keeps the refusal's actions outside its alert, so copying is announced once", async () => {
    const { server, log, send } = await startConversation();
    server.reply(await send("A"), 400, { error: COACH_UNVERIFIED });

    const alert = await within(log()).findByRole("alert");

    expect(within(log()).getByRole("button", { name: "Copy the conversation" })).toBeInTheDocument();
    expect(within(alert).queryAllByRole("button")).toHaveLength(0);
  });

  it("asks to clear the conversation from an unverifiable refusal, with focus on Keep", async () => {
    const { server, user, log, send } = await startConversation();
    server.reply(await send("A"), 400, { error: COACH_UNVERIFIED });

    await user.click(await within(log()).findByRole("button", { name: "New conversation" }));

    const question = screen.getByRole("group", { name: "Clear this conversation?" });
    expect(within(question).getByRole("button", { name: "Keep" })).toHaveFocus();
  });

  it("moves focus to Keep from an unverifiable refusal even when the question is already open", async () => {
    const { server, user, input, log, send } = await startConversation();
    server.reply(await send("A"), 400, { error: COACH_UNVERIFIED });
    await user.click(await within(composerOf(input())).findByRole("button", { name: "New conversation" }));

    await user.click(within(log()).getByRole("button", { name: "New conversation" }));

    expect(screen.getByRole("button", { name: "Keep" })).toHaveFocus();
  });

  it("says when the conversation couldn't be copied", async () => {
    const { server, user, log, send } = await startConversation();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new DOMException("Denied", "NotAllowedError"));
    server.reply(await send("A"), 400, { error: COACH_UNVERIFIED });

    await user.click(await within(log()).findByRole("button", { name: "Copy the conversation" }));

    expect(
      await within(log()).findByRole("button", { name: "Couldn't copy. Select the text in the log instead." }),
    ).toBeInTheDocument();
  });

  it.each([
    [503, COACH_OUT_OF_CREDIT],
    [401, ACCESS_REQUIRED],
    [413, COACH_MESSAGE_TOO_LONG],
  ])("offers only Copy after a %i refusal a new conversation can't fix: %s", async (status, error) => {
    const { server, log, send } = await startConversation();
    server.reply(await send("A"), status, { error });

    await within(log()).findByRole("alert");

    expect(within(log()).getByRole("button", { name: "Copy the conversation" })).toBeInTheDocument();
    expect(within(log()).queryByRole("button", { name: "New conversation" })).not.toBeInTheDocument();
  });

  it("offers a new conversation when the conversation itself is too long", async () => {
    const { server, log, send } = await startConversation();
    server.reply(await send("A"), 413, { error: COACH_TOO_LONG });

    expect(await within(log()).findByRole("button", { name: "New conversation" })).toBeInTheDocument();
  });
});
