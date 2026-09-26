import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fail, reply, submit, type Exchange, type ExchangeId, type Prompt } from "../domain/exchange.ts";
import { ExchangeEntry } from "./ExchangeEntry.tsx";

const pending = submit("1" as ExchangeId, "What is an aggregate?" as Prompt);

describe("ExchangeEntry", () => {
  it.each<Exchange>([
    pending,
    reply(pending, "A consistency boundary.", "sig-1"),
    fail(pending, { error: "The coach is unavailable.", remedy: "retry" }),
  ])("exposes the $status exchange status on its log item", (exchange) => {
    render(
      <ol>
        <ExchangeEntry exchange={exchange}>
          <p>outcome</p>
        </ExchangeEntry>
      </ol>,
    );

    expect(screen.getByRole("listitem")).toHaveAttribute("data-status", exchange.status);
  });

  it("marks a refused exchange, which Retry can't help, apart from a failed one", () => {
    const refused = fail(pending, { error: "That message couldn't be checked.", remedy: "copy" });
    render(
      <ol>
        <ExchangeEntry exchange={refused}>
          <p>outcome</p>
        </ExchangeEntry>
      </ol>,
    );

    expect(screen.getByRole("listitem")).toHaveAttribute("data-status", "refused");
  });
});
