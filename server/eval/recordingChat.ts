import type { ChatRequest, ChatResult, ChatStreamChunk, ChatUsage } from "@openrouter/sdk/models";
import type { EventStream } from "@openrouter/sdk/lib/event-streams";
import type { ChatClient } from "../openRouterCoach.ts";

export type CallRecord = {
  ms: number;
  firstTokenMs?: number;
  promptTokens: number;
  cachedTokens: number;
  completionTokens: number;
  reasoningTokens: number;
  cost: number | null;
  finishReason: string | null;
};

type Overrides = Partial<Pick<ChatRequest, "maxCompletionTokens" | "stream">>;

export function recordingChat(chat: ChatClient, overrides: Overrides = {}) {
  const records: CallRecord[] = [];
  const send: ChatClient["send"] = async (request, options) => {
    const chatRequest = { ...request.chatRequest, ...overrides };
    const startedAt = performance.now();
    const response = await chat.send({ ...request, chatRequest: streamable(chatRequest) }, options);
    const result = "choices" in response ? response : await collect(response, startedAt);
    records.push(recordOf(result, performance.now() - startedAt));
    return result;
  };
  return { chat: { send }, records };
}

function streamable(request: ChatRequest): ChatRequest {
  return request.stream ? { ...request, streamOptions: { includeUsage: true } } : request;
}

type Collected = ChatResult & { firstTokenMs?: number };

async function collect(stream: EventStream<ChatStreamChunk>, startedAt: number): Promise<Collected> {
  let text = "";
  let firstTokenMs: number | undefined;
  let finishReason: ChatResult["choices"][number]["finishReason"] = null;
  let usage: ChatUsage | undefined;
  for await (const chunk of stream) {
    const choice = chunk.choices[0];
    if (choice?.delta.content && firstTokenMs === undefined) firstTokenMs = performance.now() - startedAt;
    text += choice?.delta.content ?? "";
    finishReason = choice?.finishReason ?? finishReason;
    usage = chunk.usage ?? usage;
  }
  return { ...emptyResult(text, finishReason), usage, firstTokenMs };
}

function emptyResult(content: string, finishReason: ChatResult["choices"][number]["finishReason"]): ChatResult {
  const message = { role: "assistant" as const, content };
  return { id: "", created: 0, model: "", object: "chat.completion", systemFingerprint: null, choices: [{ index: 0, finishReason, message }] };
}

function recordOf(result: Collected, ms: number): CallRecord {
  const usage = result.usage;
  return {
    ms: Math.round(ms),
    ...(result.firstTokenMs !== undefined && { firstTokenMs: Math.round(result.firstTokenMs) }),
    promptTokens: usage?.promptTokens ?? 0,
    cachedTokens: usage?.promptTokensDetails?.cachedTokens ?? 0,
    completionTokens: usage?.completionTokens ?? 0,
    reasoningTokens: usage?.completionTokensDetails?.reasoningTokens ?? 0,
    cost: usage?.cost ?? null,
    finishReason: result.choices[0]?.finishReason ?? null,
  };
}
