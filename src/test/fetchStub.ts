import { vi } from "vitest";

type PendingCall = {
  body: unknown;
  resolve: (response: Response) => void;
  reject: (reason: unknown) => void;
};

type StubOptions = { session?: number };

const SESSION_URL = "/api/session";
const NO_CONTENT = 204;

export function stubFetch({ session = NO_CONTENT }: StubOptions = {}) {
  const calls: PendingCall[] = [];
  const fetchMock = vi.fn(
    (_url: string, init?: RequestInit) =>
      new Promise<Response>((resolve, reject) => {
        calls.push({ body: jsonBodyOf(init), resolve, reject });
      }),
  );
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string, init?: RequestInit) =>
      url === SESSION_URL ? Promise.resolve(new Response(null, { status: session })) : fetchMock(url, init),
    ),
  );
  return {
    fetchMock,
    pendingCount: () => calls.length,
    bodyOf: (index: number) => callAt(calls, index).body,
    reply: (index: number, status: number, body: unknown) =>
      callAt(calls, index).resolve(jsonResponse(status, body)),
    replyText: (index: number, status: number, text: string) =>
      callAt(calls, index).resolve(new Response(text, { status })),
    replyNoContent: (index: number) => callAt(calls, index).resolve(new Response(null, { status: NO_CONTENT })),
    fail: (index: number) => callAt(calls, index).reject(new TypeError("Failed to fetch")),
  };
}

function jsonBodyOf(init?: RequestInit): unknown {
  return init?.body === undefined ? undefined : JSON.parse(String(init.body));
}

function callAt(calls: PendingCall[], index: number): PendingCall {
  const call = calls[index];
  if (!call) throw new Error(`No fetch call at index ${index}`);
  return call;
}

export function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
