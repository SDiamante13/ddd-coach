import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { App } from "../App.tsx";
import { stubFetch } from "./fetchStub.ts";

export const formatCount = (n: number) => new Intl.NumberFormat("en-US").format(n);

export function composerOf(box: HTMLElement): HTMLFormElement {
  const form = (box as HTMLTextAreaElement).form;
  if (!form) throw new Error("The message box is not in a form");
  return form;
}

export async function renderApp() {
  if (!vi.isMockFunction(globalThis.fetch)) stubFetch();
  const user = userEvent.setup();
  render(<App />);
  await screen.findByRole("textbox", { name: "Message" });
  return {
    user,
    input: () => screen.getByRole("textbox", { name: "Message" }),
    log: () => screen.getByRole("log"),
    sendButton: () => screen.getByRole("button", { name: "Send" }),
  };
}

export async function startConversation() {
  const server = stubFetch();
  const app = await renderApp();

  async function send(message: string): Promise<number> {
    await app.user.type(app.input(), `${message}{Enter}`);
    return server.pendingCount() - 1;
  }

  return {
    ...app,
    server,
    send,
    sendAndReply: async (message: string, reply: string, signature = "") => {
      server.reply(await send(message), 200, { reply, signature });
      await within(app.log()).findByText(reply);
    },
    sendAndFail: async (message: string) => {
      server.reply(await send(message), 502, { error: "The coach is unavailable." });
      await within(app.log()).findByRole("alert");
    },
  };
}
