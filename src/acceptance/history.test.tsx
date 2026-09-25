import { within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { startConversation } from "../test/appDriver.tsx";

afterEach(() => vi.unstubAllGlobals());

describe("History", () => {
  it("sends a follow-up with the earlier replied turn and its signature as history", async () => {
    const { server, send, sendAndReply } = await startConversation();
    await sendAndReply("A", "R1", "sig-A");

    await send("B");

    expect(server.bodyOf(0)).toEqual({ message: "A", history: [] });
    expect(server.bodyOf(1)).toEqual({ message: "B", history: [{ prompt: "A", reply: "R1", signature: "sig-A" }] });
  });

  it("leaves a failed turn out of the next message's history", async () => {
    const { server, send, sendAndFail } = await startConversation();
    await sendAndFail("A");

    await send("B");

    expect(server.bodyOf(1)).toEqual({ message: "B", history: [] });
  });

  it("retries with the signed turns before it, then keeps the retried turn and its signature at its log position", async () => {
    const { server, user, log, send, sendAndReply, sendAndFail } = await startConversation();
    await sendAndReply("A", "R1", "sig-A");
    await sendAndFail("B");
    await sendAndReply("C", "R3", "sig-C");

    await user.click(within(log()).getByRole("button", { name: "Retry" }));
    server.reply(3, 200, { reply: "RB", signature: "sig-B" });
    await within(log()).findByText("RB");
    await send("D");

    expect(server.bodyOf(3)).toEqual({ message: "B", history: [{ prompt: "A", reply: "R1", signature: "sig-A" }] });
    expect(server.bodyOf(4)).toEqual({
      message: "D",
      history: [
        { prompt: "A", reply: "R1", signature: "sig-A" },
        { prompt: "B", reply: "RB", signature: "sig-B" },
        { prompt: "C", reply: "R3", signature: "sig-C" },
      ],
    });
  });
});
