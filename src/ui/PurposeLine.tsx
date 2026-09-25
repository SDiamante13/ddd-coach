export const PURPOSE_LINE =
  "Paste a messy thread or meeting notes about your domain, line breaks and all, and talk it through with a DDD coach.";

export const PASTE_EXAMPLE =
  "e.g. Ops: a booking exists the moment the customer submits\n" +
  "Finance: not for us, it's a booking once it's invoiceable";

export function PurposeLine() {
  return <p className="purpose">{PURPOSE_LINE}</p>;
}
