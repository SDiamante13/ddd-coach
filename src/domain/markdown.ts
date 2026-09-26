export const markdownText = (text: string): string => text.replace(/[\\`[\]<>]/g, (char) => `\\${char}`);

export const codeSpan = (text: string): string => (text.includes("`") ? markdownText(text) : `\`${text}\``);

const markdownCell = (text: string): string => markdownText(text).replace(/\|/g, "\\|");

const markdownRow = (cells: readonly string[]): string => `| ${cells.map(markdownCell).join(" | ")} |`;

export const markdownTable = (head: readonly string[], rows: readonly (readonly string[])[]): string[] => [
  markdownRow(head),
  `|${head.map(() => "---").join("|")}|`,
  ...rows.map(markdownRow),
];
