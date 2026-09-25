import { isBusy } from "../domain/exchange.ts";
import { ExchangeEntry } from "./ExchangeEntry.tsx";
import { MessageForm } from "./MessageForm.tsx";
import { useExchanges } from "./useExchanges.ts";

export function ConnectionTest() {
  const { exchanges, send, retry } = useExchanges();

  return (
    <>
      <ol role="log">
        {exchanges.map((exchange) => (
          <ExchangeEntry key={exchange.id} exchange={exchange} onRetry={retry} />
        ))}
      </ol>
      <MessageForm busy={isBusy(exchanges)} onSend={send} />
    </>
  );
}
