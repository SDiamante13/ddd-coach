import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Exchange, FailedExchange, Prompt } from "../domain/exchange.ts";
import { stubFetch } from "../test/fetchStub.ts";
import { useExchanges } from "./useExchanges.ts";

afterEach(() => vi.unstubAllGlobals());

function firstFailed(exchanges: readonly Exchange[]): FailedExchange {
  const failed = exchanges.find((exchange) => exchange.status === "failed");
  if (!failed) throw new Error("No failed exchange");
  return failed;
}

describe("useExchanges", () => {
  it("starts no request when retrying while another exchange is pending", async () => {
    const server = stubFetch();
    const { result } = renderHook(() => useExchanges());
    act(() => result.current.send("First message" as Prompt));
    await act(async () => server.fail(0));
    act(() => result.current.send("Second message" as Prompt));

    act(() => result.current.retry(firstFailed(result.current.exchanges)));

    expect(server.fetchMock).toHaveBeenCalledTimes(2);
  });

  it("starts no second request while a message is still pending, even if the button were pressed (#38)", () => {
    const server = stubFetch();
    const { result } = renderHook(() => useExchanges());
    act(() => result.current.send("First message" as Prompt));

    act(() => result.current.send("Second message" as Prompt));

    expect(server.fetchMock).toHaveBeenCalledTimes(1);
    expect(result.current.exchanges).toHaveLength(1);
  });
});
