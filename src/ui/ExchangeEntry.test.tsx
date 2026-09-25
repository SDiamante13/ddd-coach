import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fail, reply, submit, type Exchange, type ExchangeId, type Prompt } from "../domain/exchange.ts";
import { ExchangeEntry } from "./ExchangeEntry.tsx";

const pending = submit("1" as ExchangeId, "What is an aggregate?" as Prompt);

describe("ExchangeEntry", () => {
  it.each<Exchange>([
    pending,
    reply(pending, "A consistency boundary."),
    fail(pending, { error: "The coach is unavailable.", retryable: true }),
  ])("exposes the $status exchange status on its log item", (exchange) => {
    render(
      <ol>
        <ExchangeEntry exchange={exchange} busy={false} onRetry={() => {}} />
      </ol>,
    );

    expect(screen.getByRole("listitem")).toHaveAttribute("data-status", exchange.status);
  });
});
