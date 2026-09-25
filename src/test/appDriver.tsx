import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../App.tsx";
import { stubFetch } from "./fetchStub.ts";

export const formatCount = (n: number) => new Intl.NumberFormat("en-US").format(n);

export function composerOf(box: HTMLElement): HTMLFormElement {
  const form = (box as HTMLTextAreaElement).form;
  if (!form) throw new Error("The message box is not in a form");
  return form;
}

export function renderApp() {
  const user = userEvent.setup();
  render(<App />);
  return {
    user,
    input: () => screen.getByRole("textbox", { name: "Message" }),
    log: () => screen.getByRole("log"),
    sendButton: () => screen.getByRole("button", { name: "Send" }),
  };
}

export function startConversation() {
  const server = stubFetch();
  const app = renderApp();

  async function send(message: string): Promise<number> {
    await app.user.type(app.input(), `${message}{Enter}`);
    return server.fetchMock.mock.calls.length - 1;
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
