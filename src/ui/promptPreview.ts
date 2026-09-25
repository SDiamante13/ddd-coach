export type Preview = { preview: string; hidden: number };

export const PREVIEW_LINES = 4;
export const PREVIEW_CHARS = 320;

export function previewOf(text: string): Preview {
  const preview = text.split("\n").slice(0, PREVIEW_LINES).join("\n").slice(0, PREVIEW_CHARS);
  return { preview, hidden: text.length - preview.length };
}
