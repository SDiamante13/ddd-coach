const OPEN_WORD = /\b(what|which|who|whose|whom|where|how|whether)\b/i;

const PROPOSAL =
  /\b(shouldn['’]t|isn['’]t it|wouldn['’]t it|doesn['’]t it|why not|recommend|suggest|propose|instead of|better to|best to|the right (choice|call|answer))\b/i;

const RULING = /(?:^|[,:;]\s*)should\b/i;

export function asksOpenly(question: string): boolean {
  return !PROPOSAL.test(question) && !RULING.test(question) && isOpen(question);
}

function isOpen(question: string): boolean {
  const lastClause = question.split(",").at(-1) ?? "";
  return OPEN_WORD.test(question) || lastClause.includes(" or ");
}
