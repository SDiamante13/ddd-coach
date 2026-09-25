import type { Conversation, Turn } from "../domain/conversation.ts";
import type { Prompt } from "../domain/exchange.ts";

type PlainTurn = { prompt: string; reply: string };

export function conversationOf(prompt: string, history: readonly PlainTurn[] = []): Conversation {
  return { history: history.map(turnOf), prompt: asPrompt(prompt) };
}

function turnOf({ prompt, reply }: PlainTurn): Turn {
  return { prompt: asPrompt(prompt), reply };
}

function asPrompt(text: string): Prompt {
  return text as Prompt;
}
