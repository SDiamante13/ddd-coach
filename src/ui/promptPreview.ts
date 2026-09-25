export type Preview = { preview: string; hidden: number };

export const PREVIEW_LINES = 4;
export const PREVIEW_CHARS = 320;

export function previewOf(text: string): Preview {
  const lines = text.split("\n").slice(0, PREVIEW_LINES).join("\n");
  const preview = withoutSplitCharacter(lines.slice(0, PREVIEW_CHARS));
  return { preview, hidden: text.length - preview.length };
}

function withoutSplitCharacter(cut: string): string {
  return /[\uD800-\uDBFF]$/.test(cut) ? cut.slice(0, -1) : cut;
}
