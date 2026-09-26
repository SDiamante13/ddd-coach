export type EntityKind = "event" | "term" | "meaning" | "question";
export type EntityId = string & { readonly __brand: "EntityId" };

export function entityId(kind: EntityKind, text: string): EntityId {
  return `${kind}:${normalised(text)}` as EntityId;
}

function normalised(text: string): string {
  return text
    .toLowerCase()
    .replace(/[“”„‟]/g, '"')
    .replace(/[‘’‚‛]/g, "'")
    .replace(/\s+/g, " ")
    .replace(/[\s.,;:!?…]+$/, "")
    .trim();
}
