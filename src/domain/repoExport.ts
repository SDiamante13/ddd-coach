import { shortDate } from "./dates.ts";
import { markdownTable, markdownText } from "./markdown.ts";
import { isOpen, type RepoGlossary, type RepoTerm, type RowStatus } from "./repoGlossary.ts";
import { asOfLine, questionLine, type RfcQuestion, sourceLine } from "./rfcExport.ts";

const GLOSSARY_LABEL = "<!-- GLOSSARY.md: save this part as GLOSSARY.md at the root of your repo. -->";
const SECTION_LABEL = "<!-- CLAUDE.md or AGENTS.md: paste this section in. It points at GLOSSARY.md, so there is one copy to keep current. -->";

export const repoMarkdown = (glossary: RepoGlossary, asOf: Date): string =>
  [GLOSSARY_LABEL, glossaryMarkdown(glossary, asOf), SECTION_LABEL, claudeSection(glossary, asOf)].join("\n");

export function repoCopiedMessage(unsettled: number): string {
  const copied = "Copied for your repo: GLOSSARY.md, then a section for CLAUDE.md.";
  if (unsettled === 0) return copied;
  return `${copied} ${unsettled === 1 ? "1 term is" : `${unsettled} terms are`} still unsettled.`;
}

const AGENT_RULES = [
  "**For coding agents:** use these words exactly as defined here.",
  "A term's meaning depends on the context named in its row; don't merge meanings across contexts.",
  "Build what's settled.",
  "Rows marked **Unsettled** have no agreed meaning yet: don't pick one, and don't name code, columns or statuses after either reading.",
  "Leave a `TODO(glossary): <term>` at that one point and keep building the rest of the task.",
  "Don't introduce a domain term that isn't in this file; ask instead.",
].join(" ");

export function glossaryMarkdown(glossary: RepoGlossary, asOf: Date): string {
  const header = `${asOfLine(asOf)}. Exported from DDD Coach, ${glossary.origin}. When a question below is settled, change its rows here, or export again.`;
  return ["# Glossary", "", header, "", AGENT_RULES, "", ...glossary.terms.flatMap(termSection), ...openQuestions(glossary.questions)].join("\n");
}

function termSection({ word, avoid, rows }: RepoTerm): string[] {
  const cells = rows.map(({ context, meaning, source, status }) => [context, source === "Guess" ? `Guess: ${meaning}` : meaning, source, statusCell(status)]);
  return [
    `## ${markdownText(word)}`,
    "",
    meaningCount(rows.length),
    "",
    ...avoidLine(word, avoid),
    ...markdownTable(["Context", "Meaning", "Source", "Status"], cells),
    "",
  ];
}

function avoidLine(word: string, avoid: string[]): string[] {
  if (avoid.length === 0) return [];
  const them = avoid.length === 1 ? "it" : "them";
  return [`Don't use: ${avoid.map(codeSpan).join(", ")}. The thread uses ${them} for the same meaning; write ${codeSpan(word)} instead.`, ""];
}

const meaningCount = (count: number): string => (count === 1 ? "One meaning recorded." : `${count} meanings by context.`);

function statusCell(status: RowStatus): string {
  if (status.kind === "guess") return "**Unsettled**, a guess";
  if (status.kind === "unsettled") return `**Unsettled**, see Q${status.question}`;
  return "Settled";
}

function openQuestions(questions: RfcQuestion[]): string[] {
  if (questions.length === 0) return [];
  const items = questions.flatMap((question, index) => [
    `${index + 1}. ${markdownText(questionLine(question))}`,
    ...question.sources.map((source) => `   - ${markdownText(sourceLine(source))}`),
  ]);
  return ["## Open questions", "", ...items, ""];
}

const TODO_RULE =
  "Don't name new code, columns or statuses after either reading. Leave a `TODO(glossary): <term>` at that one point, keep building the rest of the task, and say what you left open.";

const NOTHING_UNSETTLED =
  "- **Unsettled:** nothing in this export. If the task needs a meaning that isn't here, leave a `TODO(glossary): <term>` at that one point and ask.";

export function claudeSection(glossary: RepoGlossary, asOf: Date): string {
  return [
    `## Domain language (from GLOSSARY.md, as of ${shortDate(asOf)})`,
    "",
    `- Use the terms in \`GLOSSARY.md\` exactly as defined. A term's meaning depends on the context in its row (${contextsOf(glossary).join(", ")}). Never merge meanings across contexts.`,
    "- Build what's settled: a settled row is safe to build on and to name code after, in its own context.",
    unsettledBullet(glossary.terms.flatMap(unsettledPoint)),
    ...avoidBullet(glossary.terms.flatMap(avoidPoints)),
    "- Don't introduce a new domain term. If you need a word that isn't in `GLOSSARY.md`, ask first.",
    "",
  ].join("\n");
}

const contextsOf = ({ terms }: RepoGlossary): string[] => [...new Set(terms.flatMap(({ rows }) => rows.map(({ context }) => markdownText(context))))];

const unsettledBullet = (points: string[]): string =>
  points.length === 0 ? NOTHING_UNSETTLED : `- **Unsettled, don't pick a side:** ${points.join("; ")}. ${TODO_RULE}`;

const avoidPoints = ({ word, avoid }: RepoTerm): string[] => avoid.map((other) => `${codeSpan(other)} (write ${codeSpan(word)})`);

const avoidBullet = (points: string[]): string[] =>
  points.length === 0 ? [] : [`- **Don't use:** ${points.join(", ")}. The thread uses these for the same meaning as a term in \`GLOSSARY.md\`.`];

function unsettledPoint({ word, rows }: RepoTerm): string[] {
  const open = rows.filter(isOpen);
  if (open.length === 0) return [];
  return [`${codeSpan(word)} for ${open.map(({ context, status }) => `${markdownText(context)} (${openReason(status)})`).join(", ")}`];
}

const openReason = (status: RowStatus): string => (status.kind === "unsettled" ? `Q${status.question}` : "a guess");

const codeSpan = (text: string): string => (text.includes("`") ? markdownText(text) : `\`${text}\``);
