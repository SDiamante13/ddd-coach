import type { Claim, ReplyBlock, WordRow } from "./replyBlocks.ts";

export type RfcQuestion = { roles: string; text: string; sources: string[] };
export type RfcDocument = { words: WordRow[]; questions: RfcQuestion[]; events: Claim[]; cut: boolean };

export function rfcDocument(blocks: ReplyBlock[]): RfcDocument {
  return {
    words: blocks.flatMap((block) => (block.kind === "words" ? block.rows : [])),
    questions: blocks.flatMap((block) => (block.kind === "question" ? [{ roles: block.roles, text: block.text, sources: block.sources }] : [])),
    events: blocks.flatMap((block) => (block.kind === "events" ? block.items : [])),
    cut: blocks.some((block) => block.kind === "cut"),
  };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const asOfLine = (asOf: Date): string => `As of ${asOf.getDate()} ${MONTHS[asOf.getMonth()]} ${asOf.getFullYear()}`;

export type TableRow = { term: string; team: string; meaning: string; source: string };

export function tableRows(words: WordRow[]): TableRow[] {
  return words.flatMap(({ word, meanings }) =>
    meanings.map(({ holder, meaning, source }, index) => ({
      term: index === 0 ? word : "",
      team: holder,
      meaning: source === "Guess" ? `Guess: ${meaning}` : meaning,
      source,
    })),
  );
}

export const guessRows = (document: RfcDocument): number => tableRows(document.words).filter((row) => row.source === "Guess").length;

export function copiedMessage(guesses: number): string {
  if (guesses === 0) return "Copied for your RFC.";
  return `Copied for your RFC. ${guesses === 1 ? "1 row is still a guess" : `${guesses} rows are still guesses`}.`;
}

export function toMarkdown(document: RfcDocument, asOf: Date): string {
  const sections = [markdownTable(document.words), markdownQuestions(document.questions), markdownEvents(document.events)];
  return [asOfLine(asOf), "", ...sections.flat(), ...(document.cut ? [CUT_LINE] : [])].join("\n");
}

export const CUT_LINE = "The coach's reply was cut short here; ask it to continue for the rest.";

export const claimLine = ({ source, text }: Claim): string => `${source}: ${text}`;

function markdownEvents(events: Claim[]): string[] {
  if (events.length === 0) return [];
  return ["## Events, in order", "", ...events.map((event, index) => `${index + 1}. ${markdownText(claimLine(event))}`), ""];
}

export const questionLine = ({ roles, text }: RfcQuestion): string => `Question for ${roles}: ${text}`;
export const sourceLine = (source: string): string => `From thread: "${source}"`;

function markdownQuestions(questions: RfcQuestion[]): string[] {
  if (questions.length === 0) return [];
  const items = questions.flatMap((question) => [
    `- ${markdownText(questionLine(question))}`,
    ...question.sources.map((source) => `  - ${markdownText(sourceLine(source))}`),
  ]);
  return ["## Open questions", "", ...items, ""];
}

const markdownText = (text: string): string => text.replace(/[\\`[\]<>]/g, (char) => `\\${char}`);

const markdownCell = (text: string): string => markdownText(text).replace(/\|/g, "\\|");

function markdownTable(words: WordRow[]): string[] {
  if (words.length === 0) return [];
  const row = (cells: string[]) => `| ${cells.map(markdownCell).join(" | ")} |`;
  return [
    "## Words that don't match",
    "",
    row(["Term", "Team", "Meaning", "Source"]),
    "|---|---|---|---|",
    ...tableRows(words).map(({ term, team, meaning, source }) => row([term, team, meaning, source])),
    "",
  ];
}

export function toHtml(document: RfcDocument, asOf: Date): string {
  const sections = [htmlTable(document.words), htmlQuestions(document.questions), htmlEvents(document.events)];
  return [tag("p", asOfLine(asOf)), ...sections, document.cut ? tag("p", CUT_LINE) : ""].join("");
}

const escapeHtml = (text: string): string =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const tag = (name: string, text: string): string => `<${name}>${escapeHtml(text)}</${name}>`;

function htmlTable(words: WordRow[]): string {
  if (words.length === 0) return "";
  const head = `<thead><tr>${["Term", "Team", "Meaning", "Source"].map((cell) => tag("th", cell)).join("")}</tr></thead>`;
  const rows = tableRows(words).map(({ term, team, meaning, source }) => `<tr>${[term, team, meaning, source].map((cell) => tag("td", cell)).join("")}</tr>`);
  return `${tag("h2", "Words that don't match")}<table>${head}<tbody>${rows.join("")}</tbody></table>`;
}

function htmlQuestions(questions: RfcQuestion[]): string {
  if (questions.length === 0) return "";
  const item = (question: RfcQuestion) => {
    const sources = question.sources.length === 0 ? "" : `<ul>${question.sources.map((source) => tag("li", sourceLine(source))).join("")}</ul>`;
    return `<li>${escapeHtml(questionLine(question))}${sources}</li>`;
  };
  return `${tag("h2", "Open questions")}<ul>${questions.map(item).join("")}</ul>`;
}

function htmlEvents(events: Claim[]): string {
  if (events.length === 0) return "";
  return `${tag("h2", "Events, in order")}<ol>${events.map((event) => tag("li", claimLine(event))).join("")}</ol>`;
}
