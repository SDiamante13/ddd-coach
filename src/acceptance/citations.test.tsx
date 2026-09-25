import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderApp, startConversation } from "../test/appDriver.tsx";

afterEach(() => vi.unstubAllGlobals());

const GROUNDED_REPLY = [
  "A bounded context is the part of a system where one model, and its words, apply without ambiguity.",
  'Source: Evans, Domain-Driven Design Reference (2015), "Bounded Context".',
  "Paste a thread when you have one and I'll show where your teams' contexts meet.",
].join("\n");

async function askedAboutBoundedContexts() {
  const conversation = await startConversation();
  conversation.server.reply(await conversation.send("What's a bounded context?"), 200, { reply: GROUNDED_REPLY, signature: "sig-1" });
  await within(conversation.log()).findByText(/A bounded context is/);
  return conversation;
}

describe("Citations", () => {
  it("shows the Reference section a DDD answer draws on as a citation", async () => {
    const { log } = await askedAboutBoundedContexts();

    expect(log().querySelector("cite")).toHaveTextContent('Evans, Domain-Driven Design Reference (2015), "Bounded Context"');
  });

  it("leaves citations out of Copy the conversation, since they are never copied", async () => {
    const { user } = await askedAboutBoundedContexts();

    await user.click(screen.getByRole("button", { name: "New conversation" }));
    const question = screen.getByRole("group", { name: "Clear this conversation?" });
    await user.click(within(question).getByRole("button", { name: "Copy first" }));

    expect(await navigator.clipboard.readText()).toBe(
      [
        "You: What's a bounded context?",
        "Coach: A bounded context is the part of a system where one model, and its words, apply without ambiguity.",
        "Paste a thread when you have one and I'll show where your teams' contexts meet.",
      ].join("\n"),
    );
  });

  it("credits the DDD Reference under its CC BY 4.0 licence", async () => {
    await renderApp();

    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveTextContent("The coach draws on Eric Evans, Domain-Driven Design Reference (2015), CC BY 4.0.");
    expect(within(footer).getByRole("link", { name: "CC BY 4.0" })).toHaveAttribute("href", "https://creativecommons.org/licenses/by/4.0/");
    expect(within(footer).getByRole("link", { name: "Domain-Driven Design Reference" })).toHaveAttribute(
      "href",
      "https://www.domainlanguage.com/ddd/reference/",
    );
  });
});
