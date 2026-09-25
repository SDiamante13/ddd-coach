export async function readJson(message: Body): Promise<unknown> {
  try {
    return await message.json();
  } catch {
    return null;
  }
}

export function field(body: unknown, key: string): unknown {
  if (typeof body !== "object" || body === null) return undefined;
  return (body as Record<string, unknown>)[key];
}

export function stringField(body: unknown, key: string): string | undefined {
  const value = field(body, key);
  return typeof value === "string" ? value : undefined;
}
