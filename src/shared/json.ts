export async function readJson(message: Body): Promise<unknown> {
  try {
    return await message.json();
  } catch {
    return null;
  }
}

export function stringField(body: unknown, key: string): string | undefined {
  if (typeof body !== "object" || body === null) return undefined;
  const value: unknown = (body as Record<string, unknown>)[key];
  return typeof value === "string" ? value : undefined;
}
