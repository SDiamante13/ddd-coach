import { cleanup, screen, within } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addSwap, pasteInto, renderApp, startConversation } from "../test/appDriver.tsx";
import { WORDS_PASTE, WORDS_REPLY } from "../test/wordReplies.ts";

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 9, 1, 10, 0));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const board = () => screen.getByRole("region", { name: "Event board" });
const row = (holder: string) => within(within(board()).getByRole("listitem", { name: /^Term “late”/ })).getAllByRole("listitem").find((item) => item.querySelector(".term-holder")?.textContent === holder)!;

async function onTheWords(conversation?: Awaited<ReturnType<typeof startConversation>>) {
  const app = conversation ?? (await startConversation());
  app.server.reply(await app.send(WORDS_PASTE), 200, { reply: WORDS_REPLY, signature: "sig" });
  await within(board()).findByRole("listitem", { name: /^Term “late”/ });
  return app;
}

async function checkRow(user: UserEvent, holder: string, verdict: string, where?: string) {
  await user.click(within(row(holder)).getByRole("button", { name: "I checked" }));
  if (where) await pasteInto(user, within(row(holder)).getByRole("textbox", { name: "Where? (optional)" }), where);
  await user.click(within(row(holder)).getByRole("button", { name: verdict }));
}

describe("Checking a term row yourself (#90a)", () => {
  it("shows every unchecked row as open, with an I checked menu", async () => {
    await onTheWords();

    expect(row("Billing")).toHaveTextContent("OPEN");
    expect(within(row("Billing")).getByRole("button", { name: "I checked" })).toHaveAttribute("aria-expanded", "false");
  });

  it("marks a row checked by you, with today's date and where you looked", async () => {
    const { user } = await onTheWords();

    await checkRow(user, "Billing", "Yes, it holds", "Contract §4");

    expect(row("Billing")).toHaveTextContent("CHECKED BY YOU · 1 Oct 2026");
    expect(row("Billing")).toHaveTextContent("Where: Contract §4");
    expect(row("Billing")).not.toHaveTextContent("OPEN");
  });

  it("says when you couldn't tell", async () => {
    const { user } = await onTheWords();

    await checkRow(user, "Code", "Couldn't tell");

    expect(row("Code")).toHaveTextContent("COULDN'T TELL · 1 Oct 2026");
  });

  it("records a no, until it can hand off to a correction (#90c)", async () => {
    const { user } = await onTheWords();

    await checkRow(user, "Ops (day desk)", "No, it's wrong");

    expect(row("Ops (day desk)")).toHaveTextContent("MARKED WRONG BY YOU · 1 Oct 2026");
  });

  it("keeps your check after a reload", async () => {
    const { user } = await onTheWords();
    await checkRow(user, "Billing", "Yes, it holds");

    cleanup();
    await renderApp();

    expect(await within(board()).findByText("CHECKED BY YOU · 1 Oct 2026")).toBeInTheDocument();
  });

  it("keeps where you looked behind your swaps, showing your real names", async () => {
    const conversation = await startConversation();
    await addSwap(conversation.user, "Acme Foods", "Customer A");
    await onTheWords(conversation);

    await checkRow(conversation.user, "Billing", "Yes, it holds", "Acme Foods contract §4");

    expect(row("Billing")).toHaveTextContent("Where: Acme Foods contract §4");
    expect(localStorage.getItem("ddd-coach.session.v1")).toContain("Customer A contract §4");
    expect(localStorage.getItem("ddd-coach.session.v1")).not.toContain("Acme Foods");
  });

  it("hands a no to a correction of the row's meaning, striking the coach's words through (#90c)", async () => {
    const { user } = await onTheWords();

    await checkRow(user, "Billing", "No, it's wrong");
    const field = within(row("Billing")).getByRole("textbox", { name: "Correct this meaning" });
    expect(field).toHaveFocus();
    await user.clear(field);
    await pasteInto(user, field, "Any load past the booked appointment.");
    await user.keyboard("{Enter}");

    expect(row("Billing")).toHaveTextContent("YOU SAID");
    expect(row("Billing").querySelector(".term-meaning")).toHaveTextContent("Any load past the booked appointment.");
    expect(row("Billing").querySelector("s")).toHaveTextContent("A load on the weekly late report.");

    cleanup();
    await renderApp();
    expect(await within(board()).findByText("Any load past the booked appointment.")).toBeInTheDocument();
  });

  it("offers Clear check only on a row you've checked", async () => {
    const { user } = await onTheWords();

    await user.click(within(row("Billing")).getByRole("button", { name: "I checked" }));

    expect(within(row("Billing")).queryByRole("button", { name: "Clear check" })).not.toBeInTheDocument();
  });

  it("keeps your correction when you clear a no", async () => {
    const { user } = await onTheWords();
    await checkRow(user, "Billing", "No, it's wrong");
    await pasteInto(user, within(row("Billing")).getByRole("textbox", { name: "Correct this meaning" }), " Past the appointment.");
    await user.keyboard("{Enter}");

    await checkRow(user, "Billing", "Clear check");

    expect(row("Billing")).toHaveTextContent("OPEN");
    expect(row("Billing")).toHaveTextContent("YOU SAID");
    expect(row("Billing").querySelector(".term-meaning")).toHaveTextContent("Past the appointment.");
  });

  it("copies your check into the RFC's source column (#90e)", async () => {
    const { user, log } = await onTheWords();
    await checkRow(user, "Billing", "Yes, it holds", "Contract §4");

    await user.click(within(log()).getByRole("button", { name: "Copy for your RFC" }));

    expect(await navigator.clipboard.readText()).toContain("| Billing | A load on the weekly late report. | From thread · checked by you, 1 Oct 2026, Contract §4 |");
  });

  it("copies your correction and check into the repo glossary (#90e)", async () => {
    const { user, log } = await onTheWords();
    await checkRow(user, "Billing", "No, it's wrong");
    const field = within(row("Billing")).getByRole("textbox", { name: "Correct this meaning" });
    await user.clear(field);
    await pasteInto(user, field, "Any load past the booked appointment.");
    await user.keyboard("{Enter}");

    await user.click(within(log()).getByRole("button", { name: "Copy for your repo" }));

    expect(await navigator.clipboard.readText()).toContain("| Billing | Any load past the booked appointment. (was: A load on the weekly late report.) | From thread | Settled · marked wrong by you, 1 Oct 2026 |");
  });
});
