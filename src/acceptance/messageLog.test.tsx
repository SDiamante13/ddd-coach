import { within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderApp, sendText } from "../test/appDriver.tsx";
import { stubFetch } from "../test/fetchStub.ts";

afterEach(() => vi.unstubAllGlobals());

describe("Message log", () => {
  it("collapses a long message in the log to four lines with Show more and Show less", async () => {
    const server = stubFetch();
    const { user, input, log } = await renderApp();
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
    const { user, input, log } = await renderApp();

    await user.type(input(), "line one{Shift>}{Enter}{/Shift}line two{Enter}");

    expect(within(log()).getByText("line one\nline two", { normalizer: (text) => text })).toBeInTheDocument();
    expect(within(log()).queryByRole("button", { name: "Show more" })).not.toBeInTheDocument();
  });

  it("shows HTML in a reply as literal text", async () => {
    const server = stubFetch();
    const { user, input, log } = await renderApp();

    await sendText(user, input(), "Hello coach");
    server.reply(0, 200, { reply: "<b>x</b>", signature: "sig-1" });

    expect(await within(log()).findByText("<b>x</b>")).toBeInTheDocument();
  });
});
