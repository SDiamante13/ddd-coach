export const DATA_FLOW_NOTICE =
  "Your messages are sent to OpenRouter, an AI model provider, to generate replies. Nothing is stored on our server.";

export function DataFlowNotice() {
  return <p>{DATA_FLOW_NOTICE}</p>;
}
