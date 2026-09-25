# Slice 1 — connection test

One text input → one real AI reply in a log. Pending state, inline failure, retry without duplicating the user's message. Connection test, not the product layout.

## Stack decision

- **Vite + React + TypeScript (strict, `noUncheckedIndexedAccess`)**. React chosen now so React Three Fiber and GSAP (`@gsap/react`) are additive later, not a rewrite. No 3D/animation libs until a slice needs them.
- Domain logic is framework-free pure TS in `src/domain/`; React only renders it.
- Server: Netlify Function v2 (`@netlify/functions`), `@openrouter/sdk@1.3.27` behind a `Coach` port.
- Tests: Vitest + React Testing Library + user-event (jsdom).
- `OPENROUTER_API_KEY` / `OPENROUTER_MODEL` server-side only; blank counts as missing.

## Goal fit

| Goal | How slice 1 contributes |
|---|---|
| Maximize learning | Proves the AI loop end to end; the retry/turn model is the seed for multi-turn coaching |
| Fun | Minimal — a responsive, never-stuck conversation is table stakes for fun later |
| Solve real DDD problems | None directly; unblocks slice 3 coaching behavior |

## SDK facts (verified against 1.3.27 `.d.ts`, README is stale)

```ts
new OpenRouter({ apiKey }).chat.send({
  chatRequest: { model, messages: [{ role: "user", content }], stream: false },
})
```

- `choices[0].message.content` is `string | ChatContentItems[] | null | undefined` → extract text defensively.
- Errors: `OpenRouterError` + `UnauthorizedResponseError`, `TooManyRequestsResponseError`, `PaymentRequiredResponseError`, … Never forward raw messages.
- Netlify v2: `export default async (req: Request) => Response`, `export const config: Config = { path: "/api/chat" }`. `netlify dev` serves :8888, proxies Vite :5173, injects `.env`.

## Acceptance criteria

1. Given the page loads, then the input is focused and the log is empty.
2. Given text, when Enter or Send, then the message appears once with "Coach is thinking…", input clears, Send disabled.
3. Given blank/whitespace, when submitted, then no request and no log entry.
4. Given pending, when Enter/Send again, then nothing added and fetch called once.
5. Given the server replies, then exactly one reply appears under that message and pending clears.
6. Given non-2xx or network failure, then inline error + Retry beside that message.
7. Given failed, when Retry, then the same entry goes pending and the same text is resent; on success the log shows the message once and the reply once.
8. Given reply contains `<b>x</b>`, then it renders as literal text.
9. Given key or model missing/blank, then server returns 500 naming the variable and makes no provider call. Key never appears in responses, logs, or `dist/`.

## Test order (outside-in, each red → green)

UI (RTL + user-event, `fetch` stubbed via `vi.stubGlobal` with deferred promises):
1. Enter → message + pending → resolve → one reply
2. Send button path
3. Blank rejected
4. Double submit while pending → 1 fetch call
5. 502 → inline error + Retry, message count 1
6. Retry → same body resent → success, 1 message + 1 reply
7. fetch rejects → inline error
8. HTML shown as text

Server handler (real `Request`/`Response`, fake `Coach`, config injected):
9. POST `{message}` → 200 `{reply}`
10. Missing/blank key or model → 500 naming var; coach not called
11. Coach throws error containing key → 502 generic body, no key
12. Invalid JSON / blank message → 400; GET → 405

Units:
13. Exchange transitions: submit, reply, fail, retry keeps id + prompt, retry on non-failed is a no-op, `isBusy`
14. `parsePrompt`
15. `readConfig(env)`
16. `askCoach` client adapter: 200, non-2xx `{error}`, malformed body, throw
17. OpenRouter adapter vs fake `chat.send`: asserts `{chatRequest:{model, messages, stream:false}}`; `extractText` handles string, array, null
18. Real smoke: `describe.runIf(process.env.OPENROUTER_API_KEY)`, never in CI

## Layout and types

```
src/domain/exchange.ts     pure: Prompt (branded), Exchange union, transitions
src/api/askCoach.ts        fetch("/api/chat") → AskResult
src/shared/chatContract.ts ChatRequestBody {message}; ChatResponseBody {reply}|{error}
src/App.tsx                ConnectionTest (input, log, retry)
server/config.ts           readConfig(env) → {ok,config}|{ok:false,error}
server/chatHandler.ts      createChatHandler({config, coach}) → (Request)=>Promise<Response>
server/openRouterCoach.ts  Coach adapter over the SDK
netlify/functions/chat.mts wiring only + config.path
```

```ts
type Prompt = string & { readonly __brand: "Prompt" }
type Exchange =
  | { id: ExchangeId; prompt: Prompt; status: "pending" }
  | { id: ExchangeId; prompt: Prompt; status: "replied"; reply: string }
  | { id: ExchangeId; prompt: Prompt; status: "failed"; error: string }
type AskResult = { ok: true; reply: string } | { ok: false; error: string }
interface Coach { reply(prompt: Prompt): Promise<string> }
```

Slice 2 seam: `Coach.reply` and request body become ordered turns derived from replied `Exchange[]`. Not built now.

## Scaffold

Do **not** run `npm create vite .` (non-empty repo; may offer to delete `outputs/`).

**Commit A — structural, no behavior**
- `npm init -y`; `npm i react react-dom`; `npm i -D vite @vitejs/plugin-react typescript @types/react @types/react-dom vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom @netlify/functions netlify-cli`
- Hand-write tsconfig, vite.config.ts (jsdom + setup), index.html, src/main.tsx, App with empty heading, one smoke test.
- `netlify.toml`: `[build] command="npm run build" publish="dist"`; `[dev] framework="#custom" command="npm run dev:vite" targetPort=5173 port=8888`. `[dev].command` must not call `npm run dev` (recursion).
- Scripts: `dev`=`netlify dev`, `dev:vite`=`vite`, `test`, `typecheck`=`tsc --noEmit`, `build`.

**Commit B — feat**: `npm i @openrouter/sdk`, TDD the list above.

## Out of scope

Multi-turn context, streaming, coaching prompt / Eazy Freight briefing (slice 3), persistence, deployment, model picker, cancel/abort, markdown rendering, styling beyond basic, auth/rate limits, R3F/GSAP, the board.

## Demo script (verifier)

`agent-browser record start outputs/demos/slice-01.webm`, caption banner per step.

Part A — key blank, `npm run dev`:
1. Open http://localhost:8888 — "Slice 1: connection test. Input is ready."
2. Type "Hello coach", Enter — "Pending state beside the message."
3. — "Missing key → server error inline, with Retry. Nothing reaches the provider."

Part B — user sets key + model in `.env`, restart dev:
4. Send Eazy Freight test message — "Real AI reply, exactly one."
5. `network route "**/api/chat" --abort`, send "Second message" — "Network failure shown inline."
6. `network unroute`, click Retry — "Retry resends the same message. No duplicate in the log."
7. Enter twice fast — "Double submit ignored while pending." (confirm 1 request via `network requests`)
8. Submit spaces — "Blank input rejected."
9. Off-video: `npm run build && grep -rl "sk-or" dist` finds nothing.

## Risks

- `.env` key and model empty → blocks demo Part B and smoke test only. User sets locally; pick a fast model (sync function timeout).
- Pin `netlify-cli` as devDep (local global 23.9.1 vs latest 27.9.0).
- Follow SDK types, not README.
