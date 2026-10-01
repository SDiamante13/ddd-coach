import { screen, within } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { startConversation } from "../test/appDriver.tsx";
import { EXAMPLE_THREAD } from "../shared/exampleThread.ts";
import { BOARD_DEMO_REPLIES } from "../test/boardDemoReplies.ts";
import { WORDS_PASTE, WORDS_QUESTION_REPLY } from "../test/wordReplies.ts";

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 9, 1, 10, 0));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const board = () => screen.getByRole("region", { name: "Event board" });
const pinned = () => screen.getByRole("complementary", { name: "Current question" });
const lines = () => within(pinned()).getByRole("list", { name: /^Lines for the billing lead/ });
const hotspot = () => within(board()).getByRole("listitem", { name: /^Open question/ });
const row = (holder: string) => within(within(board()).getByRole("listitem", { name: /^Term “late”/ })).getAllByRole("listitem").find((item) => item.querySelector(".term-holder")?.textContent === holder)!;

async function asked() {
  const conversation = await startConversation();
  conversation.server.reply(await conversation.send(WORDS_PASTE), 200, { reply: WORDS_QUESTION_REPLY, signature: "sig" });
  await within(board()).findByRole("listitem", { name: /^Term “late”/ });
  return conversation;
}

async function checkRow(user: UserEvent, holder: string, verdict: string) {
  await user.click(within(row(holder)).getByRole("button", { name: "I checked" }));
  await user.click(within(row(holder)).getByRole("button", { name: verdict }));
}

const lineTexts = () => within(lines()).getAllByRole("listitem").map((line) => line.textContent);

async function openLines(user: UserEvent) {
  await user.click(within(pinned()).getByRole("button", { name: /^\d+ lines? for the billing lead ▸$/ }));
}

describe("One fact, one place (#90b)", () => {
  it("collapses the lines to a count, then shows one line per term with the open desks inline, from your table (#132)", async () => {
    const { user } = await asked();
    expect(within(pinned()).queryByRole("list", { name: /^Lines for / })).not.toBeInTheDocument();

    await openLines(user);

    expect(within(pinned()).getByText("Lines for the billing lead · only what's open")).toBeInTheDocument();
    expect(within(pinned()).getByText("from your table")).toBeInTheDocument();
    expect(lineTexts()).toEqual(["“late”: still current for Ops (day desk), Billing, Code?"]);
    expect(hotspot()).toHaveTextContent("0 OF 3 ANSWERED");
  });

  it("drops a desk you checked yourself and counts it answered, saying where it changed", async () => {
    const { user, log } = await asked();
    await openLines(user);

    await checkRow(user, "Billing", "Yes, it holds");

    expect(lineTexts()).toEqual(["“late”: still current for Ops (day desk), Code?"]);
    expect(hotspot()).toHaveTextContent("1 OF 3 ANSWERED");
    expect(within(log()).getByText("Updated in 3 places: the row, the question card and the lines for the billing lead.")).toBeInTheDocument();
    expect([row("Billing"), hotspot().querySelector(".hotspot-card"), lines().closest(".expert-lines")].map((place) => place?.hasAttribute("data-rung"))).toEqual([true, true, true]);
  });

  it("asks for evidence when you couldn't tell", async () => {
    const { user, log } = await asked();
    await openLines(user);

    await checkRow(user, "Code", "Couldn't tell");

    expect(within(log()).getByText("Updated: the row and the lines for the billing lead.")).toBeInTheDocument();
    expect(within(log()).queryByText(/Updated in 3 places/)).not.toBeInTheDocument();
    expect(lineTexts()).toEqual(["“late”: still current for Ops (day desk), Billing? Where is it written down for Code?"]);
    expect(hotspot()).toHaveTextContent("0 OF 3 ANSWERED");
  });

  it("asks nothing about a row you said is wrong", async () => {
    const { user } = await asked();
    await openLines(user);

    await checkRow(user, "Ops (day desk)", "No, it's wrong");

    expect(lineTexts()).toEqual(["“late”: still current for Billing, Code?"]);
    expect(hotspot()).toHaveTextContent("1 OF 3 ANSWERED");
  });

  it("returns a row you clear to open, asking its desk again and uncounting it", async () => {
    const { user } = await asked();
    await openLines(user);
    await checkRow(user, "Billing", "Yes, it holds");

    await checkRow(user, "Billing", "Clear check");

    expect(row("Billing")).toHaveTextContent("OPEN");
    expect(lineTexts()).toEqual(["“late”: still current for Ops (day desk), Billing, Code?"]);
    expect(hotspot()).toHaveTextContent("0 OF 3 ANSWERED");
  });

  it("gives each term the question ties to its own line", async () => {
    const conversation = await startConversation();
    conversation.server.reply(await conversation.send(EXAMPLE_THREAD), 200, { reply: BOARD_DEMO_REPLIES[0], signature: "sig" });
    const toggle = await within(await screen.findByRole("complementary", { name: "Current question" })).findByRole("button", { name: /^\d+ lines? for .* ▸$/ });
    const count = Number(toggle.textContent!.split(" ")[0]);

    await conversation.user.click(toggle);

    const words = within(screen.getByRole("list", { name: /^Lines for / })).getAllByRole("listitem").map((line) => line.textContent!.split(":")[0]);
    expect(words).toHaveLength(count);
    expect(new Set(words).size).toBe(count);
  });
});
