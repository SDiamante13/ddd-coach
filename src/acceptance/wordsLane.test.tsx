import { screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addSwap, startConversation } from "../test/appDriver.tsx";
import { WORDS_ONLY_REPLY, WORDS_PASTE, WORDS_REPLY } from "../test/wordReplies.ts";

afterEach(() => vi.unstubAllGlobals());

const board = () => screen.getByRole("region", { name: "Event board" });
const term = (word: string) => within(board()).getByRole("listitem", { name: new RegExp(`^Term “${word}”`) });

async function replied(reply = WORDS_REPLY, conversation?: Awaited<ReturnType<typeof startConversation>>) {
  const app = conversation ?? (await startConversation());
  app.server.reply(await app.send(WORDS_PASTE), 200, { reply, signature: "sig" });
  await within(board()).findByRole("list", { name: "Events on the board" });
  return app;
}

describe("The Words lane (#109)", () => {
  it("puts one term card per word on the board, with a row per team and whether it came from the thread", async () => {
    await replied();

    const late = term("late");
    expect(late).toHaveAccessibleName("Term “late”, 3 meanings: Ops (day desk), Billing, Code");
    const rows = within(late).getAllByRole("listitem");
    expect(rows.map((row) => row.querySelector(".term-holder")?.textContent)).toEqual(["Ops (day desk)", "Billing", "Code"]);
    expect(rows.map((row) => row.querySelector(".term-source")?.textContent)).toEqual(["FROM THREAD", "FROM THREAD", "GUESS"]);
    expect(rows[0]).toHaveTextContent("Mon Ops (day desk): late means the truck missed the pickup window");
    expect(late).toHaveTextContent("JUST ADDED");
  });

  it("counts the words in the board's header", async () => {
    await replied();

    expect(within(board()).getByText("Words · 1 term · 3 rows")).toBeInTheDocument();
  });

  it("matches through your swaps and shows your real names", async () => {
    const conversation = await startConversation();
    await addSwap(conversation.user, "Billing", "Team B");
    await addSwap(conversation.user, "late", "tardy");
    await replied(WORDS_REPLY.replaceAll("late", "tardy").replace("Billing means", "Team B means"), conversation);

    const late = term("late");
    expect(late).toHaveAccessibleName("Term “late”, 3 meanings: Ops (day desk), Billing, Code");
    expect(within(late).getAllByRole("listitem")[1]).toHaveTextContent("Tue Billing: late is anything on the weekly late report");
  });

  it("leaves term cards out of the new-events chip, which counts events only", async () => {
    const conversation = await replied();
    await conversation.user.click(within(board()).getByRole("button", { name: /^Event 1 of 1/ }));

    conversation.server.reply(await conversation.send("And the next part."), 200, { reply: WORDS_ONLY_REPLY, signature: "sig-2" });
    await within(board()).findByRole("listitem", { name: /^Term “on time”/ });

    expect(within(board()).queryByRole("button", { name: /^Show the .*(new|updated)/ })).not.toBeInTheDocument();
    expect(within(board()).getByText("Words · 2 terms · 4 rows")).toBeInTheDocument();
  });

  it("says when a thread row's line can't be found, and never calls it a guess", async () => {
    await replied(WORDS_REPLY.replace("- Guess: Code means", "- From thread: Finance means an invoice dispute.\n- Guess: Code means"));

    const finance = within(term("late")).getAllByRole("listitem")[2]!;
    expect(finance).toHaveTextContent("No line in your paste matches closely.");
    expect(within(term("late")).getAllByRole("listitem")[3]).toHaveTextContent("The coach's guess: no line in your paste says this.");
  });

  it("nudges a term card from the keyboard and keeps it there", async () => {
    const { user } = await replied();
    const card = within(term("late")).getByRole("group", { name: /^Term “late”/ });
    card.focus();

    await user.keyboard("{Shift>}{ArrowDown}{/Shift}");

    await waitFor(() => expect(term("late").style.transform).toBe("translate(0px,436px)"));
  });

  it("goes down from the events to the Words lane with the arrow keys, as one Tab stop (#127)", async () => {
    const { user } = await replied();
    within(board()).getByRole("button", { name: /^Event 1 of 1/ }).focus();

    await user.keyboard("{ArrowDown}");

    expect(within(term("late")).getByRole("group", { name: "Term “late”" })).toHaveFocus();
    expect(board().querySelectorAll('[data-board-item][tabindex="0"]')).toHaveLength(1);
  });

  it("shows the board with its Words lane when a reply has words but no events (#127)", async () => {
    const conversation = await startConversation();
    conversation.server.reply(await conversation.send(WORDS_PASTE), 200, { reply: WORDS_ONLY_REPLY, signature: "sig" });

    expect(await within(board()).findByRole("listitem", { name: /^Term “on time”/ })).toBeInTheDocument();
    expect(within(board()).getByText("Words · 1 term · 1 row")).toBeInTheDocument();
    expect(board().querySelector(".board-header")?.textContent).not.toMatch(/Events|0 events/);

    within(term("on time")).getByRole("group", { name: "Term “on time”" }).focus();
    await conversation.user.keyboard("{Shift>}{ArrowRight}{/Shift}");
    await waitFor(() => expect(term("on time").style.transform).toBe("translate(16px,0px)"));
  });

  it("collapses the reply's word table to a chip that takes you to the term cards, keeping the table one click away (#127)", async () => {
    const { user, log } = await replied();

    const chip = within(log()).getByRole("button", { name: "← 1 term on the board · 3 rows" });
    expect(within(log()).getByText("Show as table").closest("details")).not.toHaveAttribute("open");
    expect(within(log()).getByRole("button", { name: "Copy for your RFC" })).toBeInTheDocument();

    await user.click(chip);

    expect(within(term("late")).getByRole("group", { name: "Term “late”" })).toHaveFocus();
  });

  it("takes you to a term whose word has a quote and a backslash, and stops following the coach (#127)", async () => {
    const word = '7" pallet\\';
    const conversation = await startConversation();
    conversation.server.reply(await conversation.send(WORDS_PASTE), 200, { reply: ["Words that don't match", `"${word}"`, "- Guess: Ops means a pallet seven inches high."].join("\n"), signature: "sig" });
    const chip = await within(conversation.log()).findByRole("button", { name: "← 1 term on the board · 1 row" });

    await conversation.user.click(chip);

    expect(within(board()).getByRole("group", { name: `Term “${word}”` })).toHaveFocus();
    expect(within(board()).getByRole("button", { name: "Follow coach" })).toHaveAttribute("aria-pressed", "false");
  });

  it("shows one 'N new on the board' line instead of a ring on every card when a reply adds more than 5 things (#127)", async () => {
    const conversation = await startConversation();
    const many = ["Events, in order", ...[1, 2, 3, 4, 5].map((n) => `${n}. From thread: Ops step ${n} happens on load 7731.`), "", WORDS_REPLY.slice(WORDS_REPLY.indexOf("Words that don't match"))].join("\n");
    conversation.server.reply(await conversation.send(WORDS_PASTE), 200, { reply: many, signature: "sig" });
    await within(board()).findByRole("list", { name: "Events on the board" });

    expect(within(board()).getByText("6 new on the board")).toBeInTheDocument();
    expect(within(board()).queryAllByText("JUST ADDED")).toHaveLength(0);
  });

  describe("reaching the Words lane at 100% (#109 hotfix)", () => {
    beforeEach(() => {
      vi.stubGlobal("matchMedia", (query: string) => ({ matches: query.includes("reduce"), media: query, addEventListener: () => {}, removeEventListener: () => {} }));
      vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function (this: HTMLElement) {
        return this.classList.contains("board-lane") ? 900 : 0;
      });
      vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(function (this: HTMLElement) {
        return this.classList.contains("board-lane") ? 400 : 0;
      });
    });
    afterEach(() => vi.restoreAllMocks());

    it("brings a term card below the fold into view when you move to it", async () => {
      const { user } = await replied();
      within(board()).getByRole("button", { name: /^Event 1 of 1/ }).focus();

      await user.keyboard("{ArrowDown}");

      await waitFor(() => expect(board().querySelector(".react-flow__viewport")).toHaveStyle({ transform: "translate(8px,-404px) scale(1)" }));
    });
  });
});
