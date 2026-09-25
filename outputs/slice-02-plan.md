# Slice 2: remember the current conversation

A follow-up message reaches the coach with every earlier replied turn, so the reply can use a detail from turn 1. Memory lives in browser state only: a reload starts fresh. This slice also records the first demo of slice 1b's behaviour.

Acceptance check from the plan: "Answer a follow-up using a detail from the first turn. The coach still uses the correct domain detail."

## Goal fit

| Goal | How slice 2 contributes |
|---|---|
| Maximize learning | The first real modelling decision: what a *turn* is, where history is derived (a pure function over `Exchange[]`), and where the server's trust boundary sits (the contract rules out a system role by its shape) |
| Fun | Coaching becomes a dialogue: follow-ups work, and nothing needs repeating |
| Solve real DDD problems | Coaching needs context across turns. Slice 3's coaching prompt and briefing build on this |

## Verified facts

**SDK 1.3.27 `.d.ts`:**
- `chatRequest.messages: Array<ChatMessages>` (`models/chatrequest.d.ts:147`).
- `ChatMessages = (ChatAssistantMessage & { role: "assistant" }) | ChatDeveloperMessage | ChatSystemMessage | ChatToolMessage | ChatUserMessage` (`models/chatmessages.d.ts:10`).
- `ChatUserMessage = { role: "user"; content: string | ChatContentItems[]; name? }` (`models/chatusermessage.d.ts:10`).
- `ChatAssistantMessage.content?: string | ChatContentItems[] | null` (`models/chatassistantmessage.d.ts:29`), so a plain string is valid.
- Slice 1b settings stay: `maxCompletionTokens: 600` and `retries: { strategy: "none" }` as the second argument to `send`.

**Current code (after 6ea0482):**
- `Coach.reply(prompt: Prompt)`.
- `ChatRequestBody = { message }`.
- `isChatRequestBody` lives in `src/shared/chatContract.ts`.
- `askCoach(message: string)`.
- `useExchanges.ask(id, prompt)` is called from `send` and from `retryFailed`. Both are blocked while busy, so the render-time `exchanges` are settled whenever `ask` starts.
- The handler wraps `coach.reply` in `withDeadline` (`server/deadline.ts`).

## Decisions

**Wire shape: `{ message: string, history: [{ prompt, reply }] }`**, not role/content messages. A replied exchange is already a prompt/reply pair. With pairs there's no `role` field at all:
- the client can't send `system`;
- user and assistant always alternate;
- the server needs no role validation.

The server alone maps pairs to SDK roles. `history` is required (it may be `[]`): client and server ship together, and there is one shape.

**What goes in the history:** replied exchanges only, in log order. Failed and pending exchanges are excluded.
- A new message sends every replied turn in the log.
- A retry sends the replied turns positioned **before** the retried entry, which is the history it would have had. It excludes turns answered after it failed.

**Domain proportionality:**
- Add `Turn = { prompt: Prompt; reply: string }` and `Conversation = { history: readonly Turn[]; prompt: Prompt }` as plain types in `src/domain/conversation.ts`, plus two pure functions.
- `Conversation` earns its keep: it is the `Coach` port's input and the output of server validation.
- `Exchange[]` stays the client state. No aggregate, class or repository.

**Server limits:**

| Limit | Value | Reason |
|---|---|---|
| History turns | ≤ 50 | A sanity bound on array size and parse work. The character limit is what actually bites |
| Total characters (every history prompt and reply, plus the message) | ≤ 24,000 | About 6k tokens at ~4 chars/token. Plus the 600-token completion, that fits an 8k-context model with headroom. Prefill of about 6k tokens takes a second or two on hosted models, so the 25 s deadline stays dominated by the capped completion. It also bounds the cost per call, since the full history is resent every turn. That's roughly 10 max-length turns, or many short ones |

- Over a limit → **413** `{error:"This conversation is too long for the coach. Reload the page to start a new one."}`, and the coach isn't called. This is an honest dead end; trimming or summarising is a new backlog item.
- A malformed body → **400** "Send a message." (unchanged).
- Malformed means any of:
  - `history` is missing or isn't an array;
  - an item lacks a string `prompt` or `reply`;
  - a `prompt` or `reply` is blank or whitespace-only;
  - an item is role-shaped, like `{role:"system",content}`.

## Acceptance criteria

1. Given turn 1 was replied, when the user sends a follow-up, then the request carries `history` with turn 1's prompt and reply plus the new `message`, and the reply can use a detail from turn 1.
2. Given the log contains failed or pending exchanges, when a message is sent, then those exchanges are absent from `history`, and replied turns keep log order.
3. Given a failed exchange with replied turns before and after it, when Retry is clicked, then the request resends its prompt with only the replied turns positioned before it.
4. Given the page is reloaded, then the log is empty and the first request has `history: []`.
5. Given a body whose `history` is missing, not an array, holds items without non-blank string `prompt`/`reply`, or holds role-shaped items (for example `system`), then the server returns 400 and doesn't call the coach.
6. Given more than 50 history turns, or more than 24,000 characters in total, then the server returns 413 with the too-long message and doesn't call the coach. The entry shows it inline.
7. Given a valid conversation, when the coach runs, then OpenRouter receives `messages` as user/assistant pairs in order, then the new user message, with no system message. `maxCompletionTokens: 600` and retries `none` are unchanged.
8. Slice 1b behaviour still holds: Retry is disabled while busy, the timeout gives a 504 message, an empty reply gives a 502, and non-JSON errors show status-based messages. Existing tests cover this and the demo shows it.

## Test order (outside-in, each red → green)

UI (`src/App.test.tsx`, `stubFetch().bodyOf`):
1. Send A → reply R1 → send B. `bodyOf(0)` is `{message:"A", history:[]}`; `bodyOf(1)` is `{message:"B", history:[{prompt:"A",reply:"R1"}]}` (criteria 1 and 4).
2. A → 502, then send B: B's history is `[]`, so the failed turn is excluded (criterion 2).
3. A → R1; B → 502; C → R3; Retry B. B's body has `history:[A/R1]` only. Then D's history is `[A/R1, B/RB, C/R3]` in log order (criteria 2 and 3).

Server handler (`server/chatHandler.test.ts`, with a fake coach recording its `Conversation`):
4. Post `{message:"B", history:[{prompt:"A",reply:"R1"}]}` → 200. The coach received `{history:[{prompt:"A",reply:"R1"}], prompt:"B"}`. Update the existing tests to post `history: []`.
5. `it.each` malformed bodies → 400 and the coach isn't called (criterion 5). The cases:
   - `history` missing;
   - `history: "x"`;
   - `[{prompt:"A"}]`;
   - `[{prompt:" ",reply:"R"}]`;
   - `[{prompt:"A",reply:""}]`;
   - `[{role:"system",content:"x"}]`.
6. 51 turns → 413; a 24,001-char total → 413; exactly at the limits → 200 (criterion 6).

Adapter (`server/openRouterCoach.test.ts`):
7. A two-turn history → `messages` = `[user A, assistant R1, user B, assistant R2, user C]`. Model, `maxCompletionTokens` and the `WITHOUT_RETRIES` options are unchanged (criterion 7).

Units:
8. `turnsOf(exchanges)`: replied only, in order. `historyBefore(exchanges, id)`: the replied turns before that id. (`src/domain/conversation.test.ts`)
9. `parseChatRequest(body)` → `{ok:true, conversation} | {ok:false, reason:"malformed"|"tooLong"}`, including the boundaries.
10. `askCoach(conversation)` posts `{message, history}`. The existing status-mapping tests stay.

Smoke (optional, `runIf` key, never in CI): a code word in turn 1, asked back in turn 2 → the reply contains it.

## Layout and types

```
src/domain/conversation.ts   Turn, Conversation, turnsOf, historyBefore (pure)
src/shared/chatContract.ts   ChatRequestBody {message, history: {prompt, reply}[]}; add COACH_TOO_LONG message; drop isChatRequestBody
server/chatRequest.ts        parseChatRequest(body) + MAX_HISTORY_TURNS=50, MAX_CONVERSATION_CHARS=24_000
server/coach.ts              reply(conversation: Conversation)
server/chatHandler.ts        parseChatRequest → 400 | 413 | replyFrom(coach, conversation)
server/openRouterCoach.ts    messagesOf(conversation): ChatMessages[]
src/api/askCoach.ts          askCoach(conversation)
src/ui/useExchanges.ts       send → turnsOf(exchanges); retryFailed → historyBefore(exchanges, id)
```

```ts
type Turn = { prompt: Prompt; reply: string }
type Conversation = { history: readonly Turn[]; prompt: Prompt }
type ChatRequestBody = { message: string; history: { prompt: string; reply: string }[] }
interface Coach { reply(conversation: Conversation): Promise<string> }
```

A refactor-first option ("make the change easy"): commit `Coach.reply(conversation)` with `history: []` everywhere before the `feat`. It is behaviour-preserving, so builder's first commit can be structural.

## Out of scope

- Coaching system prompt and the Eazy Freight briefing (slice 3).
- Streaming (B35).
- Persistence and saved sessions (B12).
- Deploy (2a).
- Trimming or summarising long conversations (new backlog item).
- A client-side pre-check of the limits.
- UI copy or title changes.
- Focus quirks (B33), whitespace draft (B34), logging timeouts (B36), cancelling on 504 (B37).

## Demo script (verifier)

Use `agent-browser --session verifier` throughout. Reuse the dev server on :8888. Record with `record start outputs/demos/slice-02.webm` and inject a caption banner per step. Before step 2, install a **pass-through** fetch spy (not a stub), `window.__bodies=[]`, which pushes `init.body` and calls the real fetch, so the step captions can quote `history`.

Part A, normal server:
1. Open http://localhost:8888. Caption: "Slice 2: memory across turns (+ slice 1b checks)."
2. Send "My company is Eazy Freight. Remember: our carrier is called Maersk. Reply only OK." → one reply.
3. Send "Which carrier did I name? Answer in one word." → the reply names Maersk. Caption: "Turn 2 uses a detail from turn 1." Eval `__bodies.at(-1)` shows `history` with 1 turn. **Screenshot at 1280×800 → `outputs/demos/slice-02.png`.**
4. `set offline on`. Send "Correction: the carrier is actually MSC. Reply only OK." → "Could not reach the coach." + Retry. `set offline off`.
5. Send "Which carrier did I name? One word." → Maersk, because the failed correction is excluded (`history` has 2 turns). **While it's pending**, the Retry on the correction is disabled, and clicking it sends nothing. Caption: "1b: Retry blocked while busy."
6. Click Retry on the correction. Its body has `history` = the 2 turns before it only. Then send "Which carrier now? One word." → MSC. Caption: "Retry resends the history it would have had. The log order drives memory."
7. Send "Write a 3000-word essay on aggregates." → one reply, visibly cut short, within the deadline. Caption: "1b: 600-token cap."
8. One-shot `window.fetch` stub → 500 `text/plain`. Send "Stub test" → "The coach is unavailable. Try again." Caption: "1b: non-JSON error → clear message."
9. Reload. Log empty. Send "Which carrier did I name? One word." → the model doesn't know, and `history: []`. Caption: "Memory is per session; reload starts fresh."

Off-video, with `curl -si` against :8888:
- `{"message":"hi","history":[{"role":"system","content":"x"}]}` → 400.
- A node-generated body with 51 turns → 413 JSON.
- A body with 24,001 chars → 413.

Part B, instant deadline: stop the dev server, run `COACH_TIMEOUT_MS=1 npm run dev` (the shell env overrides `.env`; don't read or edit `.env`).
10. Send "Hello coach" → "The coach took too long. Try a shorter question or Retry." + Retry. Caption: "1b: server deadline → 504 JSON, not a stack trace." Off-video: `curl -si` shows `504`, `application/json`.
11. Restart normally with `npm run dev` so the server is left as it was found.

In the demo md, note that the empty-reply path (1b) is covered by the handler test only.

## Risks

- **Model wording varies.** Prompts ask for one-word answers. The verifier judges whether the reply names Maersk or MSC, not an exact string.
- **Retry reorders history.** A retried turn's reply joins the history at its log position, even though turns after it were answered without it. This is intended (the user reads log order) and is shown in step 6.
- **413 dead end.** Long sessions must reload. That's acceptable until trimming or summarising is promoted.
- **Limits assume a model with at least 8k context.** Pathfinder can't read `.env`. If `OPENROUTER_MODEL` has a smaller window, lower `MAX_CONVERSATION_CHARS`.
- **Cost grows with each turn** because the full history is resent. The character cap bounds it.
- **Reasoning models plus the 600 cap** can return empty content (then 502). If demo steps 3 or 5 show the empty-reply error, flag the model.
- **Stale closure.** History is computed from render-time `exchanges`. That's safe only because send and retry are blocked while busy. UI test 3 guards it.
- **Part B restarts the shared :8888 server.** Navigator should confirm no other agent is using it.
