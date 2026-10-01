import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { addSwap, pasteInto, startConversation } from "../test/appDriver.tsx";

afterEach(() => vi.unstubAllGlobals());

const KEY = "ddd-coach.whos-who.v1";
const SLACK_PASTE = ["#carrier-desk", "", "Luis Ortega  8:12 AM", "customer D asked why 7731 says Confirmed", "", "Rosa Delgado  8:15 AM", "for us Confirmed means the carrier accepted the tender"].join("\n");
const REPLY = ["Words that don't match", '"confirmed"', "- From thread: Carriers means the carrier accepted the tender.", "- From thread: Account team means the customer was told 7731 is confirmed."].join("\n");

const board = () => screen.getByRole("region", { name: "Event board" });
const lineOf = async () => (await within(board()).findByRole("listitem", { name: /^Term “confirmed”/ })).querySelector(".term-line")!;

async function onTheWords() {
  const app = await startConversation();
  app.server.reply(await app.send(SLACK_PASTE), 200, { reply: REPLY, signature: "sig" });
  return app;
}

describe("Who's who (#133)", () => {
  it("finds a row's line from a person you put on that team, and lists them next to your swaps", async () => {
    localStorage.setItem(KEY, JSON.stringify([{ speaker: "Rosa Delgado", team: "Carrier desk" }]));

    await onTheWords();

    expect(await lineOf()).toHaveTextContent("for us Confirmed means the carrier accepted the tender");
    const panel = screen.getByRole("group", { name: "Saved who's who" });
    expect(within(panel).getByText("Who's who (1)")).toBeInTheDocument();
    expect(within(panel).getByText("Rosa Delgado → Carrier desk")).toBeInTheDocument();
  });

  it("forgets everyone when you clear it, and the row says it has no line again", async () => {
    localStorage.setItem(KEY, JSON.stringify([{ speaker: "Rosa Delgado", team: "Carrier desk" }]));
    const { user } = await onTheWords();
    await lineOf();
    const panel = screen.getByRole("group", { name: "Saved who's who" });
    await user.click(within(panel).getByText("Who's who (1)"));

    await user.click(within(panel).getByRole("button", { name: "Clear who's who" }));

    expect(await lineOf()).toHaveTextContent("No line in your paste matches closely.");
    expect(localStorage.getItem(KEY)).toBeNull();
    expect(screen.queryByRole("group", { name: "Saved who's who" })).not.toBeInTheDocument();
  });

  it("says in the notice that who's who stays in this browser until you delete it", async () => {
    await startConversation();

    expect(screen.getByRole("complementary", { name: "Where your text goes" })).toHaveTextContent("your word swaps and who's who, with real names, stay until you delete them.");
  });

  describe("the strip in the margin", () => {
    it("offers who's who under a reply when more than half its rows have no source line", async () => {
      const { log } = await onTheWords();

      const callout = await within(log()).findByRole("group", { name: "Who's who" });
      expect(callout).toHaveTextContent("2 of 2 rows have no source line. Your thread is written by people, and the rows are by team. Say who's on which team (about 30 s) and the rows find their lines.");
      expect(within(callout).getByRole("button", { name: "Who's who · 2 people" })).toBeInTheDocument();
      expect(within(callout).getByRole("button", { name: "Not now" })).toBeInTheDocument();
    });

    it("lets you put each person on one of this reply's teams, Code or Not sure, with nothing chosen for you, then finds the lines", async () => {
      const { user, log } = await onTheWords();
      const callout = await within(log()).findByRole("group", { name: "Who's who" });
      await user.click(within(callout).getByRole("button", { name: "Who's who · 2 people" }));
      const rosa = within(callout).getByRole("group", { name: "Rosa Delgado" });
      expect(within(rosa).getAllByRole("button").map((chip) => chip.textContent)).toEqual(["Carriers?", "Account team", "Code", "Not sure"]);
      expect(within(rosa).getAllByRole("button").filter((chip) => chip.getAttribute("aria-pressed") === "true")).toHaveLength(0);
      expect(within(callout).getByText("Code: for people describing what the code does")).toBeInTheDocument();

      await user.click(within(rosa).getByRole("button", { name: "Carriers?" }));
      await user.click(within(within(callout).getByRole("group", { name: "Luis Ortega" })).getByRole("button", { name: "Not sure" }));
      await user.click(within(callout).getByRole("button", { name: "Apply · find source lines" }));

      expect(await lineOf()).toHaveTextContent("for us Confirmed means the carrier accepted the tender");
      expect(within(callout).getByText("1 more source line found · 1 still none")).toBeInTheDocument();
      expect(within(callout).getByText(/^Who's who · 2 people/)).toBeInTheDocument();
      expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual([{ speaker: "Rosa Delgado", team: "Carriers" }]);
      expect(board().querySelector(".board-header")).toHaveTextContent("1 with a source line");
    });

    it("keeps a typed team and the names behind your swaps", async () => {
      const app = await startConversation();
      await addSwap(app.user, "Rosa Delgado", "Person R");
      app.server.reply(await app.send(SLACK_PASTE), 200, { reply: REPLY, signature: "sig" });
      const callout = await within(app.log()).findByRole("group", { name: "Who's who" });
      await app.user.click(within(callout).getByRole("button", { name: "Who's who · 2 people" }));

      await pasteInto(app.user, within(callout).getByRole("textbox", { name: "Rosa Delgado's team" }), "Rosa Delgado's carriers");
      await app.user.keyboard("{Enter}");
      await app.user.click(within(callout).getByRole("button", { name: "Apply · find source lines" }));

      expect(localStorage.getItem(KEY)).not.toContain("Rosa");
      expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual([{ speaker: "Person R", team: "Person R's carriers" }]);
    });

    it("goes away when you say Not now", async () => {
      const { user, log } = await onTheWords();
      const callout = await within(log()).findByRole("group", { name: "Who's who" });

      await user.click(within(callout).getByRole("button", { name: "Not now" }));

      expect(within(log()).queryByRole("group", { name: "Who's who" })).not.toBeInTheDocument();
    });

    it("suggests the team a person names as their own, to confirm, never chosen for them", async () => {
      const { user, log } = await onTheWords();
      const callout = await within(log()).findByRole("group", { name: "Who's who" });
      await user.click(within(callout).getByRole("button", { name: "Who's who · 2 people" }));
      const rosa = within(callout).getByRole("group", { name: "Rosa Delgado" });

      const suggestion = within(rosa).getByRole("button", { name: "Carriers?" });
      expect(suggestion).toHaveAttribute("aria-pressed", "false");
      expect(rosa).toHaveTextContent("Suggested from “for us Confirmed means the carrier accepted the tender”; tap to confirm");
      expect(within(within(callout).getByRole("group", { name: "Luis Ortega" })).queryByRole("button", { name: /\?$/ })).not.toBeInTheDocument();

      await user.click(suggestion);

      expect(within(rosa).getByRole("button", { name: "Carriers" })).toHaveAttribute("aria-pressed", "true");
    });

    it("asks only about a new speaker in a later paste, reusing who you've already placed", async () => {
      localStorage.setItem(KEY, JSON.stringify([{ speaker: "Rosa Delgado", team: "Carriers" }]));
      const { user, log } = await onTheWords();
      const ask = await within(log()).findByRole("group", { name: "Who's who" });

      expect(ask).toHaveTextContent("One new speaker: Luis Ortega (1 line). Which team?");
      expect(within(ask).queryByRole("group", { name: "Rosa Delgado" })).not.toBeInTheDocument();
      await user.click(within(within(ask).getByRole("group", { name: "Luis Ortega" })).getByRole("button", { name: "Account team" }));
      await user.click(within(ask).getByRole("button", { name: "Apply · find source lines" }));

      expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual([
        { speaker: "Rosa Delgado", team: "Carriers" },
        { speaker: "Luis Ortega", team: "Account team" },
      ]);
    });
  });
});
