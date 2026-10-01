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

  it("still marks a new link Just drawn after you clear a check kept from before a reload (#124)", async () => {
    const reply = [WORDS_REPLY.replace("after the pickup window.", "after the pickup window.\n2. From thread: Billing adds load 7731 to the weekly late report.")].join("\n");
    const app = await startConversation();
    app.server.reply(await app.send(WORDS_PASTE), 200, { reply, signature: "sig" });
    await within(board()).findByRole("listitem", { name: /^Term “late”/ });
    await checkRow(app.user, "Billing", "Yes, it holds");
    cleanup();
    const { user } = await renderApp();
    await within(board()).findByRole("listitem", { name: /^Term “late”/ });

    await checkRow(user, "Billing", "Clear check");
    await user.click(within(board()).getByRole("button", { name: /^Event 1 of 2/ }));
    await user.click(within(board()).getByRole("button", { name: "Connect to…" }));
    await user.click(within(board()).getByRole("button", { name: /^Link to “Billing adds load 7731/ }));

    expect(await within(board()).findByText("Just drawn")).toBeInTheDocument();
  });

  it("keeps a cleared check open after a reload", async () => {
    const { user } = await onTheWords();
    await checkRow(user, "Billing", "Yes, it holds");
    await checkRow(user, "Billing", "Clear check");

    cleanup();
    await renderApp();

    await within(board()).findByRole("listitem", { name: /^Term “late”/ });
    expect(row("Billing")).toHaveTextContent("OPEN");
  });

  describe("in the copies, as things stand now (#132)", () => {
    async function checkedAndCorrected() {
      const app = await onTheWords();
      await checkRow(app.user, "Billing", "Yes, it holds", "Contract §4");
      await checkRow(app.user, "Ops (day desk)", "No, it's wrong");
      const field = within(row("Ops (day desk)")).getByRole("textbox", { name: "Correct this meaning" });
      await app.user.clear(field);
      await pasteInto(app.user, field, "A truck past its pickup appointment.");
      await app.user.keyboard("{Enter}");
      return app;
    }

    it("writes the checks and corrections into the RFC's rich text, dating only what you checked", async () => {
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
      const { user, log } = await checkedAndCorrected();

      await user.click(within(log()).getByRole("button", { name: "Copy for your RFC" }));

      const [item] = await navigator.clipboard.read();
      const html = await (await item!.getType("text/html")).text();
      expect(html).toContain("<td>From thread · checked by you, 1 Oct 2026, Contract §4</td>");
      expect(html).toContain("<td>A truck past its pickup appointment. (was: A truck not at pickup by the end of the pickup window.)</td>");
      expect(html.match(/by you, 1 Oct 2026/g)).toHaveLength(2);
    });

    it("writes the current checks and corrections into the repo glossary, and nothing for an untouched row", async () => {
      const { user, log } = await checkedAndCorrected();

      await user.click(within(log()).getByRole("button", { name: "Copy for your repo" }));

      const glossary = await navigator.clipboard.readText();
      expect(glossary).toContain("| Billing | A load on the weekly late report. | From thread | Settled · checked by you, 1 Oct 2026, Contract §4 |");
      expect(glossary).toContain("| Ops (day desk) | A truck past its pickup appointment. (was: A truck not at pickup by the end of the pickup window.) | From thread | Settled · marked wrong by you, 1 Oct 2026 |");
      expect(glossary).toContain("| Code | Guess: actual_pickup_at is after pickup_window_end. | Guess | **Unsettled**, a guess |");
    });
  });

  describe("from the keyboard (#132)", () => {
    const menuButton = (holder: string) => within(row(holder)).getByRole("button", { name: "I checked" });
    const press = async (user: UserEvent, button: HTMLElement) => {
      button.focus();
      await user.keyboard("{Enter}");
    };

    it("opens the menu, chooses an answer and clears it", async () => {
      const { user } = await onTheWords();

      await press(user, menuButton("Billing"));
      expect(menuButton("Billing")).toHaveAttribute("aria-expanded", "true");
      await press(user, within(row("Billing")).getByRole("button", { name: "Yes, it holds" }));
      expect(row("Billing")).toHaveTextContent("CHECKED BY YOU · 1 Oct 2026");

      await press(user, menuButton("Billing"));
      await press(user, within(row("Billing")).getByRole("button", { name: "Clear check" }));
      expect(row("Billing")).toHaveTextContent("OPEN");
    });

    it("closes the menu on Esc and puts focus back on I checked", async () => {
      const { user } = await onTheWords();
      await press(user, menuButton("Billing"));
      within(row("Billing")).getByRole("button", { name: "Yes, it holds" }).focus();

      await user.keyboard("{Escape}");

      expect(menuButton("Billing")).toHaveAttribute("aria-expanded", "false");
      expect(menuButton("Billing")).toHaveFocus();
    });
  });
});
