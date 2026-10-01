import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
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
});
