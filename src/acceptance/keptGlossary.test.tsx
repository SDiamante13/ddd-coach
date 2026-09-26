import { cleanup, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EXAMPLE_THREAD } from "../shared/exampleThread.ts";
import { addSwap, startConversation } from "../test/appDriver.tsx";
import { V11_EXAMPLE_REPLY } from "../test/v10Replies.ts";

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 8, 25, 14, 30));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

async function exampleAnalysed() {
  const conversation = await startConversation();
  await conversation.user.click(conversation.input());
  await conversation.user.paste(EXAMPLE_THREAD);
  conversation.server.reply(await conversation.send(""), 200, { reply: V11_EXAMPLE_REPLY, signature: "sig-1" });
  await within(conversation.log()).findByRole("table", { name: "Words that don't match" });
  return conversation;
}

async function openGlossary(user: Awaited<ReturnType<typeof startConversation>>["user"]) {
  const summary = screen.getByText(/^Glossary \(/);
  if (!summary.closest("details")?.open) await user.click(summary);
  return screen.getByRole("table", { name: "Kept glossary" });
}

describe("Kept glossary", () => {
  it("keeps a reply's term rows, dated and sourced from the case its question names", async () => {
    const { user, log } = await exampleAnalysed();

    await user.click(within(log()).getByRole("button", { name: "Keep these words" }));

    expect(within(log()).getByText("Kept 11 rows from load 7731.")).toBeInTheDocument();
  });

  it("lists the kept rows by word, each with the day it was kept and where from", async () => {
    const { user, log } = await exampleAnalysed();
    await user.click(within(log()).getByRole("button", { name: "Keep these words" }));

    expect(screen.getByText("Glossary (11)")).toBeInTheDocument();
    const table = await openGlossary(user);
    expect(within(table).getByRole("rowheader", { name: "late" })).toBeInTheDocument();
    expect(within(table).getAllByText("25 Sep 2026 from load 7731")).toHaveLength(11);
  });

  it("shows kept rows with the real names restored from the swap list", async () => {
    const { user, log } = await exampleAnalysed();
    await addSwap(user, "Brightline Foods", "Customer D");
    await user.click(within(log()).getByRole("button", { name: "Keep these words" }));

    const table = await openGlossary(user);

    expect(within(table).getByText("The basis for service credits and Brightline Foods's Q3 on-time percentage.")).toBeInTheDocument();
    expect(within(table).queryByText(/Customer D/)).not.toBeInTheDocument();
  });

  it("removes one kept row", async () => {
    const { user, log } = await exampleAnalysed();
    await user.click(within(log()).getByRole("button", { name: "Keep these words" }));
    const table = await openGlossary(user);

    await user.click(within(table).getByRole("button", { name: "Remove late, Carrier desk" }));

    expect(screen.getByText("Glossary (10)")).toBeInTheDocument();
    expect(within(table).queryByText("A missed pickup that can incur a carrier late fee.")).not.toBeInTheDocument();
  });

  it("clears the whole glossary", async () => {
    const { user, log } = await exampleAnalysed();
    await user.click(within(log()).getByRole("button", { name: "Keep these words" }));
    await openGlossary(user);

    await user.click(screen.getByRole("button", { name: "Clear glossary" }));

    expect(screen.getByText("Glossary (0)")).toBeInTheDocument();
    expect(screen.getByText("Nothing kept yet. Use Keep these words under a reply.")).toBeInTheDocument();
  });

  it("keeps the glossary in this browser across a reload", async () => {
    const { user, log } = await exampleAnalysed();
    await user.click(within(log()).getByRole("button", { name: "Keep these words" }));

    cleanup();
    await startConversation();

    expect(screen.getByText("Glossary (11)")).toBeInTheDocument();
  });

  it("sends the kept rows with the next message, swapped as they leave and without ids", async () => {
    const { user, log, send, server } = await exampleAnalysed();
    const named = V11_EXAMPLE_REPLY.replaceAll("Customer D", "Brightline Foods");
    server.reply(await send("And the named version?"), 200, { reply: named, signature: "sig-2" });
    await within(log()).findAllByRole("table", { name: "Words that don't match" });
    await user.click(within(log()).getAllByRole("button", { name: "Keep these words" })[1]!);
    await addSwap(user, "Brightline Foods", "Customer D");

    await send("Here is next week's thread.");

    const body = server.bodyOf(2) as { glossary: Record<string, string>[] };
    expect(body.glossary).toHaveLength(11);
    expect(JSON.stringify(body.glossary)).not.toContain("Brightline Foods");
    expect(body.glossary[6]).toEqual({
      word: "weekly late report",
      holder: "Billing",
      meaning: "The basis for service credits and Customer D's Q3 on-time percentage.",
      source: "From thread",
      keptOn: "2026-09-25",
      from: "load 7731",
    });
  });

  it("lists in What's sent the kept rows that go with the next message", async () => {
    const { user, log, input } = await exampleAnalysed();
    await user.click(within(log()).getByRole("button", { name: "Keep these words" }));
    await user.type(input(), "Next week's thread");

    await user.click(screen.getByRole("button", { name: "Show what's sent" }));

    const kept = within(screen.getByRole("region", { name: "What's sent" })).getByRole("list", { name: "Kept glossary sent with this message" });
    expect(within(kept).getAllByRole("listitem")).toHaveLength(11);
    expect(within(kept).getAllByRole("listitem")[3]).toHaveTextContent('"late": Carrier desk means A missed pickup that can incur a carrier late fee. (kept 25 Sep 2026 from load 7731)');
  });
});
