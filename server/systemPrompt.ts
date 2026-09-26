import { coachInstructions } from "./coachInstructions.ts";
import { DDD_REFERENCE } from "./knowledge/dddReference.ts";

export const systemPrompt = (): string => coachInstructions(DDD_REFERENCE);
