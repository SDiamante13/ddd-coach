import { cleanup, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { addSwap, pasteInto, renderApp, startConversation } from "../test/appDriver.tsx";
import { WORDS_PASTE, WORDS_QUESTION_REPLY } from "../test/wordReplies.ts";

afterEach(() => vi.unstubAllGlobals());

const board = () => screen.getByRole("region", { name: "Event board" });
const pinned = () => screen.getByRole("complementary", { name: "Current question" });

async function asked(conversation?: Awaited<ReturnType<typeof startConversation>>) {
  const app = conversation ?? (await startConversation());
  app.server.reply(await app.send(WORDS_PASTE), 200, { reply: WORDS_QUESTION_REPLY, signature: "sig" });
  await within(board()).findByRole("listitem", { name: /^Term “late”/ });
  return app;
}

async function settleBy(user: Awaited<ReturnType<typeof startConversation>>["user"], forum: string, date: string) {
  await user.click(within(board()).getByRole("button", { name: "+ Add a settle-by date (only if you have one)" }));
  await pasteInto(user, within(board()).getByRole("textbox", { name: "Where it gets settled" }), forum);
  await pasteInto(user, within(board()).getByLabelText("By when"), date);
  await user.click(within(board()).getByRole("button", { name: "Keep settle-by" }));
}

describe("A settle-by date, only if you have one (#90d)", () => {
  it("offers to add one, and invents nothing until you do", async () => {
    await asked();

    expect(within(board()).getByRole("button", { name: "+ Add a settle-by date (only if you have one)" })).toBeInTheDocument();
    expect(screen.queryByText(/^Settle by /)).toBeNull();
    expect(within(pinned()).queryByText(/^Before /)).toBeNull();
  });

  it("shows what you typed above the table and under the expert's lines", async () => {
    const { user } = await asked();

    await settleBy(user, "Finance review", "2026-10-27");

    const line = within(board()).getByText("Settle by 27 Oct · Finance review");
    expect(line).toHaveAttribute("title", "Settle by: Finance review, 27 Oct 2026 · typed by you");
    expect(line).toHaveAttribute("aria-hidden", "true");
    expect(within(board()).getByText("Settle by: Finance review, 27 Oct 2026 · typed by you")).toHaveClass("visually-hidden");
    expect(within(pinned()).getByText("Before Finance review, 27 Oct 2026.")).toBeInTheDocument();
  });

  it("keeps it across a reload, behind your swaps", async () => {
    const conversation = await startConversation();
    await addSwap(conversation.user, "Acme Foods", "Customer A");
    const { user } = await asked(conversation);
    await settleBy(user, "Acme Foods QBR", "2026-10-27");
    expect(localStorage.getItem("ddd-coach.session.v1")).not.toContain("Acme Foods");

    cleanup();
    await renderApp();

    expect(await within(board()).findByText("Settle by 27 Oct · Acme Foods QBR")).toBeInTheDocument();
  });

  it("clears it with New conversation", async () => {
    const { user } = await asked();
    await settleBy(user, "Finance review", "2026-10-27");

    await user.click(screen.getByRole("button", { name: "New conversation" }));
    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(screen.queryByText(/^Settle by /)).toBeNull();
  });

  it("puts what you typed at the top of the RFC copy (#90e)", async () => {
    const { user, log } = await asked();
    await settleBy(user, "Finance review", "2026-10-27");

    await user.click(within(log()).getByRole("button", { name: "Copy for your RFC" }));

    expect((await navigator.clipboard.readText()).split("\n")[1]).toBe("Settle by: Finance review, 27 Oct 2026 (typed by you)");
  });

  it("sits on the board's counts line, not a line of its own (#132)", async () => {
    const { user } = await asked();
    expect(within(board()).getByRole("button", { name: "+ Add a settle-by date (only if you have one)" }).closest(".board-counts")).not.toBeNull();

    await settleBy(user, "Finance review", "2026-10-27");

    expect(within(board()).getByText("Settle by 27 Oct · Finance review").closest(".board-counts")).not.toBeNull();
  });

  it("lets you change it from ✎ (#132)", async () => {
    const { user } = await asked();
    await settleBy(user, "Finance review", "2026-10-27");

    await user.click(within(board()).getByRole("button", { name: "Change the settle-by" }));
    expect(within(board()).getByRole("textbox", { name: "Where it gets settled" })).toHaveValue("Finance review");
    expect(within(board()).getByLabelText("By when")).toHaveValue("2026-10-27");
    await user.clear(within(board()).getByRole("textbox", { name: "Where it gets settled" }));
    await pasteInto(user, within(board()).getByRole("textbox", { name: "Where it gets settled" }), "Ops review");
    await user.click(within(board()).getByRole("button", { name: "Keep settle-by" }));

    expect(within(board()).getByText("Settle by 27 Oct · Ops review")).toBeInTheDocument();
  });
});
