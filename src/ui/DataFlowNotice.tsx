import { DATA_PAGE_PATH } from "./DataPage.tsx";
import { coachProvider } from "../shared/coachProvider.ts";

export const DATA_FLOW_NOTICE =
  `Your messages go to OpenRouter, which routes them to ${coachProvider.name} to write replies. ` +
  `${coachProvider.name} doesn't train on them but may keep them for up to 30 days for abuse monitoring. ` +
  "Nothing is stored on our server. Don't paste customer names, rates, lanes or contract terms. " +
  "Add swaps below to replace names before sending.";

export function DataFlowNotice() {
  return (
    <aside className="notice" aria-label="Where your text goes">
      <p>{DATA_FLOW_NOTICE}</p>
      <p className="notice-links">
        <a href={coachProvider.dataPolicyUrl} rel="noreferrer" target="_blank">
          {coachProvider.name}'s data policy
        </a>
        {" · "}
        <a href={DATA_PAGE_PATH} target="_blank">
          How your data is handled
        </a>
      </p>
    </aside>
  );
}
