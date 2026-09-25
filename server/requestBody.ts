export const MAX_BODY_BYTES = 128 * 1024;

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
