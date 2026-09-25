export const DATA_FLOW_NOTICE =
  "Your messages are sent to OpenRouter, an AI model provider, to generate replies. " +
  "Nothing is stored on our server. Don't paste customer names, rates, lanes or contract terms. " +
  "Add swaps below to replace names before sending.";

export function DataFlowNotice() {
  return <p className="notice">{DATA_FLOW_NOTICE}</p>;
}
