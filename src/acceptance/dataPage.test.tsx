import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "../App.tsx";
import { renderApp } from "../test/appDriver.tsx";
import { stubFetch } from "../test/fetchStub.ts";

afterEach(() => {
  vi.unstubAllGlobals();
  window.history.replaceState(null, "", "/");
});

function openDataPage() {
  stubFetch({ session: 401 });
  window.history.replaceState(null, "", "/data");
  render(<App />);
}

const section = (heading: string) => screen.getByRole("region", { name: heading });

describe("Data page", () => {
  it("opens at /data without asking for the conference password", () => {
    openDataPage();

    expect(screen.getByRole("heading", { level: 1, name: "Where your text goes" })).toBeVisible();
    expect(screen.queryByLabelText("Conference password")).not.toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("says who handles a message: our server, then OpenRouter, which routes it to OpenAI", () => {
    openDataPage();

    expect(section("Who handles it")).toHaveTextContent(
      "When you press Send, your browser sends your message, with your swaps applied, to our server, " +
        "along with the conversation so far and any glossary rows you kept. " +
        "Our server passes it to OpenRouter, which routes it to a model provider. " +
        "OpenRouter currently routes it to OpenAI's own API.",
    );
  });

  it("says OpenAI may keep messages up to 30 days and OpenRouter keeps only metadata by default", () => {
    openDataPage();

    expect(section("How long it's kept")).toHaveTextContent(
      "OpenAI may keep your messages and its replies for up to 30 days in abuse-monitoring logs.",
    );
    expect(section("How long it's kept")).toHaveTextContent(
      "OpenRouter doesn't store messages or replies unless the account opts in to logging, which is off by default. " +
        "It keeps request metadata, such as token counts and latency, " +
        "and may sample a few messages for anonymous categorization, not tied to the account.",
    );
  });

  it("says neither company trains on messages by default", () => {
    openDataPage();

    expect(section("Training")).toHaveTextContent(
      "OpenAI doesn't use API data for training by default. " +
        "OpenRouter uses messages and replies only if the account opts in, which is off by default.",
    );
  });

  it("says our server keeps nothing you type, and its logs hold only error names and counts", () => {
    openDataPage();

    expect(section("What our server keeps")).toHaveTextContent(
      "Nothing you type. Our server doesn't save messages, replies, swaps or glossary rows.",
    );
    expect(section("What our server keeps")).toHaveTextContent(
      "Its logs record only the error name and status code when the coach fails or times out, " +
        "and how many citations it removed from a reply because it couldn't verify them.",
    );
  });

  it("says swaps stay in this browser and are never sent", () => {
    openDataPage();

    expect(section("What stays in your browser")).toHaveTextContent(
      "Your swaps are saved in this browser and never sent. The browser replaces each word with its placeholder " +
        "before sending, and puts the real word back in the reply.",
    );
  });

  it("says kept glossary rows are saved here but sent, and the conversation isn't saved", () => {
    openDataPage();

    expect(section("What stays in your browser")).toHaveTextContent(
      "Glossary rows you keep are saved in this browser too, and sent with each message so the coach can use them. " +
        "The conversation itself isn't saved: reloading or closing the tab clears it.",
    );
  });

  it("links the OpenAI and OpenRouter policies it cites", () => {
    openDataPage();

    const hrefs = within(section("Policies"))
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"));
    expect(hrefs).toEqual([
      "https://developers.openai.com/api/docs/guides/your-data",
      "https://openai.com/policies/privacy-policy/",
      "https://openrouter.ai/docs/guides/privacy/data-collection",
      "https://openrouter.ai/docs/guides/privacy/provider-logging",
      "https://openrouter.ai/privacy",
    ]);
  });

  it("links back to the coach", () => {
    openDataPage();

    expect(screen.getByRole("link", { name: "Back to the coach" })).toHaveAttribute("href", "/");
  });

  it("is linked from the notice in a new tab, so an open conversation stays", async () => {
    await renderApp();

    const link = screen.getByRole("link", { name: "How your data is handled" });
    expect(link).toHaveAttribute("href", "/data");
    expect(link).toHaveAttribute("target", "_blank");
  });
});
