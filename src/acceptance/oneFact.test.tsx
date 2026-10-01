import { screen, within } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { startConversation } from "../test/appDriver.tsx";
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

describe("One fact, one place (#90b)", () => {
  it("lists one line per open row for the people the question is for, labelled as from your table", async () => {
    await asked();

    expect(within(pinned()).getByText("Lines for the billing lead · only what's open")).toBeInTheDocument();
    expect(within(pinned()).getByText("from your table")).toBeInTheDocument();
    expect(within(lines()).getAllByRole("listitem").map((line) => line.textContent)).toEqual([
      "Does Ops (day desk)'s “late” still mean: A truck not at pickup by the end of the pickup window?",
      "Does Billing's “late” still mean: A load on the weekly late report?",
      "Does Code's “late” still mean: actual_pickup_at is after pickup_window_end?",
    ]);
    expect(hotspot()).toHaveTextContent("0 OF 3 ANSWERED");
  });

  it("drops a line you checked yourself and counts it answered, saying where it changed", async () => {
    const { user, log } = await asked();

    await checkRow(user, "Billing", "Yes, it holds");

    expect(within(lines()).getAllByRole("listitem")).toHaveLength(2);
    expect(hotspot()).toHaveTextContent("1 OF 3 ANSWERED");
    expect(within(log()).getByText("Updated in 3 places: the row, the question card and the lines for the billing lead.")).toBeInTheDocument();
    expect([row("Billing"), hotspot().querySelector(".hotspot-card"), lines().closest(".expert-lines")].map((place) => place?.hasAttribute("data-rung"))).toEqual([true, true, true]);
  });

  it("asks for evidence when you couldn't tell", async () => {
    const { user } = await asked();

    await checkRow(user, "Code", "Couldn't tell");

    expect(within(lines()).getAllByRole("listitem").at(-1)).toHaveTextContent("Code on “late”: can you point me to where it's written down now?");
    expect(hotspot()).toHaveTextContent("0 OF 3 ANSWERED");
  });

  it("asks nothing about a row you said is wrong", async () => {
    const { user } = await asked();

    await checkRow(user, "Ops (day desk)", "No, it's wrong");

    expect(within(lines()).getAllByRole("listitem").map((line) => line.textContent)).not.toContainEqual(expect.stringContaining("Ops (day desk)"));
    expect(hotspot()).toHaveTextContent("1 OF 3 ANSWERED");
  });

  it("returns a row you clear to open, asking its line again and uncounting it", async () => {
    const { user } = await asked();
    await checkRow(user, "Billing", "Yes, it holds");

    await checkRow(user, "Billing", "Clear check");

    expect(row("Billing")).toHaveTextContent("OPEN");
    expect(within(lines()).getAllByRole("listitem")).toHaveLength(3);
    expect(hotspot()).toHaveTextContent("0 OF 3 ANSWERED");
  });
});
