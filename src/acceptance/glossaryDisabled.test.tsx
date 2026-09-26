import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GLOSSARY_ENABLED } from "../shared/features.ts";
import { startConversation } from "../test/appDriver.tsx";
import { V11_EXAMPLE_REPLY } from "../test/v10Replies.ts";

const keptLate = {
  id: "row-1",
  termId: "term-1",
  word: "late",
  holder: "Carrier desk",
  meaning: "A missed pickup that can incur a carrier late fee.",
  source: "From thread",
  keptOn: "2026-09-25",
  from: "load 7731",
};

function keptInThisBrowser() {
  localStorage.setItem("ddd-coach.glossary.v1", JSON.stringify({ version: 1, rows: [keptLate] }));
}

describe.skipIf(GLOSSARY_ENABLED)("Glossary switched off", () => {
  it("sends no glossary, even with rows kept in this browser", async () => {
    keptInThisBrowser();
    const { send, server } = await startConversation();

    await send("Here is next week's thread.");

    expect(server.bodyOf(0)).not.toHaveProperty("glossary");
  });

  it("shows no Glossary panel, even with rows kept in this browser", async () => {
    keptInThisBrowser();

    await startConversation();

    expect(screen.queryByText(/^Glossary \(/)).not.toBeInTheDocument();
  });

  it("lists no kept glossary in What's sent", async () => {
    keptInThisBrowser();
    const { user, input } = await startConversation();
    await user.type(input(), "Next week's thread");

    await user.click(screen.getByRole("button", { name: "Show what's sent" }));

    expect(within(screen.getByRole("region", { name: "What's sent" })).queryByText(/kept/i)).not.toBeInTheDocument();
  });

  it("offers no Keep button under a reply with words that don't match", async () => {
    const { log, send, server } = await startConversation();

    server.reply(await send("Here is the thread."), 200, { reply: V11_EXAMPLE_REPLY, signature: "sig-1" });

    await within(log()).findByRole("table", { name: "Words that don't match" });
    expect(within(log()).queryByRole("button", { name: "Keep these words" })).not.toBeInTheDocument();
  });
});
