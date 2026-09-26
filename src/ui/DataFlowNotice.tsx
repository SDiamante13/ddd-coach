import { DATA_PAGE_PATH } from "./DataPage.tsx";

export const DATA_FLOW_NOTICE =
  "Your messages go to OpenRouter, which routes them to OpenAI to write replies. " +
  "OpenAI doesn't train on them but may keep them for up to 30 days for abuse monitoring. " +
  "Nothing is stored on our server. Don't paste customer names, rates, lanes or contract terms. " +
  "Add swaps below to replace names before sending.";

export function DataFlowNotice() {
  return (
    <aside className="notice" aria-label="Where your text goes">
      <p>{DATA_FLOW_NOTICE}</p>
      <p className="notice-links">
        <a href="https://developers.openai.com/api/docs/guides/your-data" rel="noreferrer" target="_blank">
          OpenAI's data policy
        </a>
        {" · "}
        <a href={DATA_PAGE_PATH} target="_blank">
          How your data is handled
        </a>
      </p>
    </aside>
  );
}
