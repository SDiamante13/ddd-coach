import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { startConversation } from "../test/appDriver.tsx";
import { QUESTION_PASTE, QUESTION_REPLY } from "../test/questionReplies.ts";
import { SECOND_BOARD_REPLY } from "../test/boardReplies.ts";

afterEach(() => vi.unstubAllGlobals());

const board = () => screen.getByRole("region", { name: "Event board" });
const onBoard = () => within(within(board()).getByRole("list", { name: "Events on the board" })).getAllByRole("listitem");

async function asked() {
  const conversation = await startConversation();
  conversation.server.reply(await conversation.send(QUESTION_PASTE), 200, { reply: QUESTION_REPLY, signature: "sig-1" });
  await within(board()).findByRole("list", { name: "Events on the board" });
  return conversation;
}

describe("The open question on the board (#97)", () => {
  it("puts the question after the events, relating to the two events it joins", async () => {
    await asked();

    const hotspot = onBoard().at(-1)!;
    expect(hotspot).toHaveAccessibleName("Open question: Does a late pickup earn the credit?, relates to Event 1 and Event 2");
    expect(hotspot).toHaveTextContent("QUESTIONOPEN");
    expect(hotspot).toHaveTextContent("JUST ADDED");
  });

  it("counts the open question in the board's header", async () => {
    await asked();

    expect(within(board()).getByText("3 events · 1 guess · 1 open question")).toBeInTheDocument();
  });

  it("draws a dotted line from each event it joins", async () => {
    await asked();

    expect(board().querySelectorAll(".relates-edge")).toHaveLength(2);
  });

  it("puts no question on the board when the reply asks none", async () => {
    const conversation = await startConversation();
    conversation.server.reply(await conversation.send("Here is our thread."), 200, { reply: SECOND_BOARD_REPLY.split("\n\n")[0], signature: "sig-1" });
    await within(board()).findByRole("list", { name: "Events on the board" });

    expect(onBoard().map((item) => item.getAttribute("aria-label") ?? "")).not.toContainEqual(expect.stringMatching(/^Open question/));
  });
});
