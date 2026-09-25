import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TOO_MANY_TRIES } from "../api/access.ts";
import { ACCESS_REQUIRED, ACCESS_WRONG_PASSWORD } from "../shared/accessContract.ts";
import { openGate, startConversation } from "../test/appDriver.tsx";
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

    await user.type(field(), "nope");
    await user.click(screen.getByRole("button", { name: "Enter" }));
    expect(server.bodyOf(0)).toEqual({ password: "nope" });
    server.reply(0, 401, { error: ACCESS_WRONG_PASSWORD });

    expect(await screen.findByRole("alert")).toHaveTextContent(ACCESS_WRONG_PASSWORD);
    expect(field()).toHaveValue("nope");
    expect(field()).toHaveAttribute("aria-invalid", "true");
    expect(field()).toHaveAccessibleDescription(ACCESS_WRONG_PASSWORD);
    expect(field()).toHaveFocus();
  });

  it("disables the button while it checks the password", async () => {
    const { user, field } = await openGate();

    await user.type(field(), "local-coach-dev{Enter}");

    expect(screen.getByRole("button", { name: "Checking…" })).toBeDisabled();
  });

  it("opens the coach on the right password, with the message box focused", async () => {
    const { user, server, field } = await openGate();

    await user.type(field(), "local-coach-dev{Enter}");
    server.replyNoContent(0);

    expect(await screen.findByRole("textbox", { name: "Message" })).toHaveFocus();
    expect(screen.queryByLabelText("Conference password")).not.toBeInTheDocument();
  });

  it("asks to wait a minute when the network has made too many tries", async () => {
    const { user, server, field } = await openGate();

    await user.type(field(), "guess{Enter}");
    server.replyText(0, 429, "Too Many Requests");

    expect(await screen.findByRole("alert")).toHaveTextContent(TOO_MANY_TRIES);
  });

  it("says access has expired when the coach refuses the pass, without Retry, and puts the message back", async () => {
    const { server, send, input, log } = await startConversation();

    server.reply(await send("Hello coach"), 401, { error: ACCESS_REQUIRED });

    expect(await within(log()).findByRole("alert")).toHaveTextContent(ACCESS_REQUIRED);
    expect(within(log()).queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
    expect(input()).toHaveValue("Hello coach");
  });
});
