import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TOO_MANY_TRIES } from "../api/access.ts";
import { ACCESS_REQUIRED, ACCESS_WRONG_PASSWORD, UNLOCKED_FOR } from "../shared/accessContract.ts";
import { App } from "../App.tsx";
import { openGate, pasteInto, sendText, startConversation } from "../test/appDriver.tsx";
import { stubFetch } from "../test/fetchStub.ts";
import { ACCESS_UNREACHABLE } from "../ui/AccessUnreachable.tsx";
import { DATA_FLOW_NOTICE } from "../ui/DataFlowNotice.tsx";
import { PURPOSE_LINE } from "../ui/PurposeLine.tsx";

afterEach(() => vi.unstubAllGlobals());

describe("Access gate", () => {
  it("asks for the conference password on a first visit, under the purpose line and notice, with no message box", async () => {
    const { field } = await openGate();

    expect(field()).toBeVisible();
    expect(field()).toHaveAttribute("type", "password");
    expect(field()).toHaveFocus();
    expect(screen.getByRole("button", { name: "Enter" })).toBeVisible();
    expect(screen.getByText(PURPOSE_LINE)).toBeVisible();
    expect(screen.getByText(DATA_FLOW_NOTICE)).toBeVisible();
    expect(screen.queryByRole("textbox", { name: "Message" })).not.toBeInTheDocument();
  });

  it("says a wrong password isn't right and keeps it in the field, flagged and focused", async () => {
    const { user, server, field } = await openGate();

    await pasteInto(user, field(), "nope");
    await user.click(screen.getByRole("button", { name: "Enter" }));
    expect(server.bodyOf(0)).toEqual({ password: "nope" });
    server.reply(0, 401, { error: ACCESS_WRONG_PASSWORD });

    expect(await screen.findByRole("alert")).toHaveTextContent(ACCESS_WRONG_PASSWORD);
    expect(ACCESS_WRONG_PASSWORD).not.toMatch(/slide/i);
    expect(field()).toHaveValue("nope");
    expect(field()).toHaveAttribute("aria-invalid", "true");
    expect(field()).toHaveAccessibleDescription(ACCESS_WRONG_PASSWORD);
    expect(field()).toHaveFocus();
  });

  it("disables the button while it checks the password", async () => {
    const { user, field } = await openGate();

    await sendText(user, field(), "local-coach-dev");

    expect(screen.getByRole("button", { name: "Checking…" })).toBeDisabled();
  });

  it("opens the coach on the right password, with the message box focused", async () => {
    const { user, server, field } = await openGate();

    await sendText(user, field(), "local-coach-dev");
    server.replyNoContent(0);

    expect(await screen.findByRole("textbox", { name: "Message" })).toHaveFocus();
    expect(screen.queryByLabelText("Conference password")).not.toBeInTheDocument();
  });

  it("says the browser stays unlocked for 90 days after the right password", async () => {
    const { user, server, field } = await openGate();

    await sendText(user, field(), "local-coach-dev");
    server.replyNoContent(0);

    expect(await screen.findByRole("status")).toHaveTextContent(UNLOCKED_FOR);
    expect(UNLOCKED_FOR).toBe("This browser stays unlocked for 90 days.");
  });

  it("doesn't mention the 90 days when the browser is already unlocked on load", async () => {
    await startConversation();

    expect(screen.queryByText(UNLOCKED_FOR)).not.toBeInTheDocument();
  });

  it("asks to wait a minute when the network has made too many tries", async () => {
    const { user, server, field } = await openGate();

    await sendText(user, field(), "guess");
    server.replyText(0, 429, "Too Many Requests");

    expect(await screen.findByRole("alert")).toHaveTextContent(TOO_MANY_TRIES);
  });

  it("asks for the password again inline when access expires, keeping the log and the draft", async () => {
    const { server, send, input, log } = await startConversation();

    server.reply(await send("Hello coach"), 401, { error: ACCESS_REQUIRED });

    expect(await within(log()).findByRole("alert")).toHaveTextContent(ACCESS_REQUIRED);
    expect(ACCESS_REQUIRED).not.toMatch(/reload/i);
    expect(within(log()).queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Conference password")).toHaveFocus();
    expect(within(log()).getByText("Hello coach")).toBeInTheDocument();
    expect(input()).toHaveValue("Hello coach");
  });

  it("hides the inline password form once unlocked, back in the message box with the log kept", async () => {
    const { user, server, send, input, log } = await startConversation();
    server.reply(await send("Hello coach"), 401, { error: ACCESS_REQUIRED });
    const field = await screen.findByLabelText("Conference password");

    await sendText(user, field, "local-coach-dev");
    expect(server.bodyOf(1)).toEqual({ password: "local-coach-dev" });
    server.replyNoContent(1);

    await waitFor(() => expect(screen.queryByLabelText("Conference password")).not.toBeInTheDocument());
    expect(screen.getByText(UNLOCKED_FOR)).toHaveAttribute("role", "status");
    expect(input()).toHaveFocus();
    expect(input()).toHaveValue("Hello coach");
    expect(within(log()).getByText("Hello coach")).toBeInTheDocument();
  });

  it("says it can't reach the coach when the access check fails offline, and tries again", async () => {
    stubFetch({ session: ["offline", 204] });
    const user = userEvent.setup();
    render(<App />);

    expect(await screen.findByRole("alert")).toHaveTextContent(ACCESS_UNREACHABLE);
    expect(screen.queryByLabelText("Conference password")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByRole("textbox", { name: "Message" })).toBeVisible();
  });
});
