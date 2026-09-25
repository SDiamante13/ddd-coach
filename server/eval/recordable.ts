import { createHash } from "node:crypto";

export function recordable<T extends { prompt: string }>({ prompt, ...call }: T) {
  return { ...call, promptChars: prompt.length, promptSha256: createHash("sha256").update(prompt).digest("hex") };
}
