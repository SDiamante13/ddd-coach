export async function readJson(message: Body): Promise<unknown> {
  try {
    return await message.json();
  } catch {
    return null;
  }
}
