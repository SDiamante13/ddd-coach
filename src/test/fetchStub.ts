import { vi } from "vitest";

type PendingCall = {
  body: unknown;
  resolve: (response: Response) => void;
  reject: (reason: unknown) => void;
};

export function stubFetch() {
  const calls: PendingCall[] = [];
  const fetchMock = vi.fn(
    (_url: string, init?: RequestInit) =>
      new Promise<Response>((resolve, reject) => {
        calls.push({ body: JSON.parse(String(init?.body)), resolve, reject });
      }),
  );
  vi.stubGlobal("fetch", fetchMock);
  return {
    fetchMock,
    bodyOf: (index: number) => callAt(calls, index).body,
    reply: (index: number, status: number, body: unknown) =>
      callAt(calls, index).resolve(jsonResponse(status, body)),
    fail: (index: number) => callAt(calls, index).reject(new TypeError("Failed to fetch")),
  };
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
