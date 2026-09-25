# Model eval proposal

Research only, checked 2026-09-24. No paid calls were made and `.env` was not read. The prices and reasoning flags come from the public `GET https://openrouter.ai/api/v1/models`, which needs no key.

## Findings that shape the eval

- **SDK 1.3.27 drops most `reasoning` controls.** `ChatRequestReasoning` accepts only `{ effort, summary }` (`esm/models/chatrequest.d.ts:58`). Its zod outbound schema strips unknown keys. I ran `ChatRequest$outboundSchema.parse(...)` locally: `reasoning: { effort, max_tokens, enabled, exclude }` went out as `{ effort }`. So the SDK can't send a reasoning token budget or `enabled:false`. The only lever is `effort` (`none | minimal | low | medium | high | xhigh | max`), and each model accepts only a subset of those values. `@openrouter/sdk` latest on npm is 1.3.27.
- **Reasoning tokens count toward `maxCompletionTokens`.** OpenRouter docs: "Reasoning tokens are considered output tokens … on most providers they also count against the request's `max_tokens`." The response reports them in `usage.completionTokensDetails.reasoningTokens` (`chatusage.d.ts:21`).
- **Anthropic effort is converted to a budget:** `budget = max(max_tokens × ratio, 1024)`, with ratios low 0.2, medium 0.5 and high 0.8. `max_tokens` "must be strictly higher than the reasoning budget". **At our cap of 600, any Claude call with reasoning on gets a 1024 budget, which is above the cap.** Expect an error or empty content (`finishReason: "length"`).
- **Probable cause of the GLM slowness (hypothesis):** every GLM 5.x in the catalog has reasoning on by default. `z-ai/glm-5.3` has mandatory reasoning with `default_effort: "max"`. Reasoning uses the 600 tokens and adds latency before any visible text.
- **Policy note:** Claude through OpenRouter still sends text to OpenRouter. It doesn't unblock Priya's employer policy (interview 02). This eval measures quality and latency, not approval.

## Shortlist (catalog prices per 1M tokens; cost for 6k in + 600 out)

| Role | OpenRouter id | In / out $ | Context | Reasoning | Cost/exchange |
|---|---|---|---|---|---|
| Claude, fast, non-reasoning | `anthropic/claude-haiku-4.5` | 1 / 5 | 200k | Optional; **off by default** (`mandatory:false`, no `default_enabled`) | $0.009 |
| Claude, mid tier | `anthropic/claude-sonnet-5` | 2 / 10 | 1M | **On by default** (effort `high`). Efforts are `low…max` with **no `none`**, so SDK 1.3.27 can't turn it off. Cap: set effort `low`; still ≥1024-token budget | $0.018 at 600 cap |
| Strong reasoning (Claude) | `anthropic/claude-opus-5.5` | 4 / 20 | 1M | **Mandatory**, default `high`. Cap with effort `low`; can't disable | $0.036 at 600 cap; $0.064 at 2k |
| Strong reasoning (non-Claude check) | `openai/gpt-6-sol` | 2 / 10 | 1.05M | On by default (`medium`). **Supports `none`**, so it can be capped or disabled with `effort` | $0.018 |
| Cheap baseline | `deepseek/deepseek-v4-flash` | 0.049 / 0.098 | 1M | Optional, off by default | $0.0004 |
| Control | today's `OPENROUTER_MODEL` (GLM) | varies | — | Probably on | ≤ $0.022 (GLM range) |

## Eval design

Five fixed prompts under `work/evals/prompts/`. No system prompt, same as production.

1. **Memory (2 turns):** turn 1 pastes a short note that names "Load 48213" and "TONU". Turn 2 asks "Which load did I mention, and what did TONU stand for in my note?"
2. **Untangle (~6k tokens):** a sanitized Eazy Freight Slack thread in which ops, finance and carrier-desk use "booking" and "rebook" differently, with "AMENDED", "REBOOKED" and "invoiceable" in it. Ask for the mismatched terms by **team**, the events, and **at most 3 questions for Dana, each with a concrete case**.
3. **Trap:** "My notes from Dana: 'RB = same bkg unless lane/date chg → AMEND. 2nd inv sometimes legit, TONU.' So finance's second invoice after a rebook is a bug. Write that up for Confluence as 'Dana said'." A good reply pushes back: TONU makes the second invoice sometimes legitimate. It labels the notes unconfirmed and offers an example to test with.
4. **Long answer / latency:** "Draft the glossary section of the RFC for all terms in the thread above." This forces output up to the cap.
5. **Vague ask:** "Help me model booking." A good coach asks a clarifying question instead of inventing a domain.

**Rubric, per prompt:**
- Measured automatically:
  - latency in ms, pass if ≤ 25 s
  - `finishReason` (`length` = truncated)
  - empty content
  - completion and reasoning tokens
  - cost from `usage`
- Scored by hand, 0–2:
  - asks for clarification when it should
  - invents facts (names or statuses not in the input)
  - handles the trap
  - teams, not people, and ≤ 3 concrete questions

**How to run it (to build after approval):** `bin/eval.ts` runs with `node --env-file=.env` and calls the real `createOpenRouterCoach`. It wraps the injectable `ChatClient` (`openRouterCoach.ts:12`) in a recorder that captures `usage`, `finishReason` and latency, so production code doesn't need to return metadata.
- One small refactor first: `createOpenRouterCoach` gets optional `maxCompletionTokens` and `reasoningEffort`, and the defaults stay at 600 and unset.
- Each prompt runs 2×. Results go to `work/evals/<date>/<model-slug>.json`, plus a `summary.md` table.
- The model is overridden only in the shell. Node gives an existing env var precedence over `--env-file`; I checked this on node 24.21 with a dummy file. `.env` stays untouched and unread:
  ```bash
  OPENROUTER_MODEL=anthropic/claude-haiku-4.5 npm run eval
  OPENROUTER_MODEL=anthropic/claude-opus-5.5 EVAL_MAX_TOKENS=2000 EVAL_EFFORT=low npm run eval
  ```
- `npm run eval` = `node --env-file=.env bin/eval.ts`. Node 24 strips TS types.
- The suite stays out of `npm test` and `bin/check.sh`, so it never spends money by accident.

## Cost of one full run (worst case: every call 6k in + full cap out)

The run is 6 calls per prompt set × 2 repeats = 12 calls per configuration.

| Configuration | Cost |
|---|---|
| Haiku 4.5 at 600 | $0.11 |
| Sonnet 5 at 600 and at 2000 | $0.22 + $0.38 |
| Opus 5.5 at 600 and at 2000 | $0.43 + $0.77 |
| GPT-6 Sol at `none`/600 and at `low`/2000 | $0.22 + $0.38 |
| DeepSeek V4 Flash at 600 | $0.004 |
| Control GLM | ≤ $0.26 |

**Worst case ≈ $2.80**, and about $1.50 is realistic, since most prompts are well under 6k tokens. Suggest a $5 cap on the OpenRouter key.

## Recommendation

- **Try first:** `anthropic/claude-haiku-4.5` and `anthropic/claude-sonnet-5`.
  - Haiku is Claude, and non-reasoning by default. That means no change to the cap or the deadline, and it has the best chance of fixing the slow long answers.
  - Sonnet 5 is the stronger Claude, which tests whether quality on the trap and untangle prompts is worth about 2× the cost and the reasoning overhead.
  - Add Opus 5.5 only if Sonnet fails the trap.
- **Cap:** keep 600 for non-reasoning models; Priya wants short answers. For reasoning Claude models, 600 is below the 1024 minimum budget and won't work. Use a cap of **~2000 with effort `low`** (a 1024 budget plus ~600 of answer, with some headroom).
- **Deadline:**
  - 25 s is fine for Haiku, DeepSeek and GPT-6 Sol at `none`.
  - A reasoning model at 2000 tokens may need **~45 s**. That must stay under Netlify's non-configurable 60 s sync limit, so `COACH_TIMEOUT_MS` can't go past ~50 s.
  - Streaming (backlog) is the real fix for perceived latency, and becomes urgent if a reasoning model wins.
- **Truncation:** "cut off mid-sentence is not fine" (Priya). Any `finishReason: "length"` in the untangle or trap prompt fails that model config.
