import { within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CUT_SHORT_NOTE } from "../shared/chatContract.ts";
import { startConversation } from "../test/appDriver.tsx";

afterEach(() => vi.unstubAllGlobals());

const LAID_OUT_REPLY = [
  "Events, in order",
  "1. From thread: The customer submits a booking on the portal.",
  "2. Guess: Ops rebooks a date change at night.",
  "",
  "Words that don't match",
  '"rebook"',
  "- From thread: Ops (day desk) means a date change with the same carrier is AMENDED.",
  "- From thread: Ops (night shift) means every change is REBOOKED.",
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

describe("Structured reply", () => {
  it("shows the words that don't match as a table", async () => {
    const { log } = await replyWith(LAID_OUT_REPLY);

    expect(await within(log()).findByRole("table", { name: "Words that don't match" })).toBeInTheDocument();
  });

  it("puts each meaning on a row under its word, with its team, meaning and source", async () => {
    const { log } = await replyWith(LAID_OUT_REPLY);
    const table = await within(log()).findByRole("table", { name: "Words that don't match" });
    const rows = within(table).getAllByRole("row").map((row) => row.textContent);

    expect(rows).toEqual([
      "WordTeamMeaningSource",
      "rebookOps (day desk)A date change with the same carrier is AMENDED.From thread",
      "Ops (night shift)Every change is REBOOKED.From thread",
      "CodeCounts both rows of a rebook.Guess",
    ]);
  });

  it("lists the events in order, each with its source", async () => {
    const { log } = await replyWith(LAID_OUT_REPLY);
    const events = await within(log()).findByRole("list", { name: "Events, in order" });

    expect(within(events).getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "From threadThe customer submits a booking on the portal.",
      "GuessOps rebooks a date change at night.",
    ]);
  });

  it("sets the question apart as a card with its roles and the two thread lines it joins", async () => {
    const { log } = await replyWith(LAID_OUT_REPLY);
    const card = await within(log()).findByRole("region", { name: "Question" });

    expect(within(card).getByText("Question for the ops lead and the finance controller, at the 27 Oct review")).toBeInTheDocument();
    expect(within(card).getByText("For load 48213, which count includes the old row, the new row, or neither?")).toBeInTheDocument();
    expect(within(card).getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "“carrier billed TONU on orig load, then hauled the new one”",
      "“finance only needs one invoice per shipment that actually moves”",
    ]);
  });

  it("keeps the question card last when the model writes a line after it", async () => {
    const { log } = await replyWith(`${LAID_OUT_REPLY}\nHope this helps with the review.`);
    const card = await within(log()).findByRole("region", { name: "Question" });

    expect(card.parentElement?.lastElementChild).toBe(card);
    expect(within(log()).getByText("Hope this helps with the review.")).toBeInTheDocument();
  });

  it("shows the parts a cut reply has, then the cut-short note", async () => {
    const cut = `${LAID_OUT_REPLY.split("\n\nQuestion for")[0]}\n\n${CUT_SHORT_NOTE}`;
    const { log } = await replyWith(cut);

    expect(await within(log()).findByRole("note")).toHaveTextContent(CUT_SHORT_NOTE);
    expect(within(log()).queryByRole("region", { name: "Question" })).not.toBeInTheDocument();
  });

  it("keeps a word that has no meaning lines as a row of its own", async () => {
    const { log } = await replyWith(["Words that don't match", '"hold"', '"rebook"', "- Guess: Ops means a date change."].join("\n"));
    const table = await within(log()).findByRole("table", { name: "Words that don't match" });

    expect(within(table).getByRole("rowheader", { name: "hold" })).toBeInTheDocument();
  });

  it("shows markup in a reply as literal text and renders no element from it", async () => {
    const markup = ["**booking**", "<img src=x onerror=alert(1)>", "# heading", "<b>x</b>"].join("\n");
    const { log } = await replyWith(markup);

    expect(await within(log()).findByText(markup, { normalizer: (text) => text })).toBeInTheDocument();
    expect(log().querySelector("img, strong, b, h1")).toBeNull();
  });

  it("sends the reply exactly as the model wrote it in the next message's history", async () => {
    const conversation = await replyWith(LAID_OUT_REPLY);
    await within(conversation.log()).findByRole("table", { name: "Words that don't match" });

    await conversation.send("Which of those are guesses?");

    expect(conversation.server.bodyOf(1)).toMatchObject({ history: [{ prompt: "Here is our #booking-split thread.", reply: LAID_OUT_REPLY }] });
  });
});
