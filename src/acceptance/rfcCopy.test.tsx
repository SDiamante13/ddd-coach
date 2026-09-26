import { within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { addSwap, startConversation } from "../test/appDriver.tsx";

afterEach(() => vi.unstubAllGlobals());

const LAID_OUT_REPLY = [
  "Events, in order",
  "1. From thread: The customer submits a booking on the portal.",
  "2. Guess: Ops rebooks a date change at night.",
  "",
  "Words that don't match",
  '"rebook"',
  "- From thread: Ops (day desk) means a date change with the same carrier is AMENDED.",
  "- Guess: Code counts both rows of a rebook.",
  "",
  "Question for the ops lead and the finance controller, at the 27 Oct review: For load 48213, which count includes the old row, the new row, or neither?",
  'From thread: "carrier billed TONU on orig load, then hauled the new one"',
  'From thread: "finance only needs one invoice per shipment that actually moves"',
].join("\n");

async function replyWith(reply: string) {
  const conversation = await startConversation();
  conversation.server.reply(await conversation.send("Here is our #booking-split thread."), 200, { reply, signature: "sig-1" });
  return conversation;
}

describe("Copy for your RFC", () => {
  it("is offered under a laid-out reply", async () => {
    const { log } = await replyWith(LAID_OUT_REPLY);

    expect(await within(log()).findByRole("button", { name: "Copy for your RFC" })).toBeInTheDocument();
  });

  it("isn't offered under a prose reply", async () => {
    const { log } = await replyWith("Hi! Paste a thread when you have one.");
    await within(log()).findByText("Hi! Paste a thread when you have one.");

    expect(within(log()).queryByRole("button", { name: "Copy for your RFC" })).not.toBeInTheDocument();
  });

  it("puts the term table on the clipboard as a Markdown table", async () => {
    const { user, log } = await replyWith(LAID_OUT_REPLY);

    await user.click(await within(log()).findByRole("button", { name: "Copy for your RFC" }));

    expect(await navigator.clipboard.readText()).toContain("| Term | Team | Meaning | Source |");
  });

  it("writes rich text for Confluence and the Markdown mirror together when the browser can", async () => {
    vi.stubGlobal(
      "ClipboardItem",
      class {
        constructor(private readonly data: Record<string, Blob>) {}
        get types() {
          return Object.keys(this.data);
        }
        async getType(type: string) {
          return this.data[type];
        }
      },
    );
    const { user, log } = await replyWith(LAID_OUT_REPLY);

    await user.click(await within(log()).findByRole("button", { name: "Copy for your RFC" }));

    const [item] = await navigator.clipboard.read();
    const html = await (await item!.getType("text/html")).text();
    expect(html).toContain("<th>Term</th><th>Team</th><th>Meaning</th><th>Source</th>");
    expect(await (await item!.getType("text/plain")).text()).toContain("| Term | Team | Meaning | Source |");
  });

  it("says it copied and how many rows are still guesses", async () => {
    const { user, log } = await replyWith(LAID_OUT_REPLY);

    await user.click(await within(log()).findByRole("button", { name: "Copy for your RFC" }));

    expect(await within(log()).findByText("Copied for your RFC. 1 row is still a guess.")).toHaveAttribute("role", "status");
  });

  it("says so when the clipboard refuses", async () => {
    const { user, log } = await replyWith(LAID_OUT_REPLY);
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new DOMException("Denied", "NotAllowedError"));

    await user.click(await within(log()).findByRole("button", { name: "Copy for your RFC" }));

    expect(await within(log()).findByText("Couldn't copy. Select the reply and copy it instead.")).toBeInTheDocument();
  });

  it("copies the real names restored from the swap list, never the placeholders", async () => {
    const { user, log, server, send } = await startConversation();
    await addSwap(user, "Acme Foods", "Customer A");
    server.reply(await send("Acme Foods rebooked twice."), 200, { reply: LAID_OUT_REPLY.replace("For load 48213", "For Customer A's load 48213"), signature: "sig-1" });

    await user.click(await within(log()).findByRole("button", { name: "Copy for your RFC" }));

    const copied = await navigator.clipboard.readText();
    expect(copied).toContain("For Acme Foods's load 48213");
    expect(copied).not.toContain("Customer A");
  });
});
