import { MAX_CONVERSATION_CHARS } from "./chatRequest.ts";

const WORST_CASE_BYTES_PER_CHAR = 6;
const STRUCTURE_BYTES = 16 * 1024;

export const MAX_BODY_BYTES = WORST_CASE_BYTES_PER_CHAR * MAX_CONVERSATION_CHARS + STRUCTURE_BYTES;

export type BodyResult = { ok: true; body: unknown } | { ok: false };

export async function readJsonWithin(request: Request, maxBytes: number): Promise<BodyResult> {
  const bytes = await request.arrayBuffer();
  if (bytes.byteLength > maxBytes) return { ok: false };
  return { ok: true, body: parseJson(new TextDecoder().decode(bytes)) };
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
