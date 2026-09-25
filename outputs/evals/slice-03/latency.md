# Slice 3 latency spike (the gate, decision 6)

Run 2026-09-25 from the dev machine against OpenRouter with `npm run eval -- --latency`. The fixture is F1 (`server/eval/fixtures/booking-split.txt`, 20,000 characters) as a first turn. The prompt is `COACH_INSTRUCTIONS_VERSION = 1`, and the cap is 1,000 tokens. Each first turn starts with a unique "(Pasted at …)" line, so no run reads the paste from cache, just as a visitor's first turn wouldn't. Raw data: `latency-2026-09-25.json`.

**Verdict: the 15 s rule doesn't fire.** The median first turn took 7.5 s and the slowest 8.3 s, against limits of 15 s (median) and 22 s (any run). Streaming (#8) stays where it is in the backlog.

## Model: `openai/gpt-5.6-luna`, effort `none`

| Call | Wall ms | First token ms | Prompt tokens | Cached | Completion | Reasoning | Output tok/s | finishReason | Cost $ |
|---|---|---|---|---|---|---|---|---|---|
| probe 1 (cap 1) | 1,265 | – | 6,576 | 0 | 16 | 0 | – | length | 0.00166 |
| probe 2 (cap 1) | 1,805 | – | 6,576 | 0 | 16 | 0 | – | length | 0.00166 |
| probe 3 (cap 1) | 1,274 | – | 6,576 | 0 | 16 | 0 | – | length | 0.00166 |
| run 1 | 5,764 | – | 6,576 | 0 | 454 | 0 | 101 | stop | 0.00219 |
| run 2 | 6,367 | – | 6,576 | 0 | 489 | 0 | 96 | stop | 0.00223 |
| run 3 | 7,528 | – | 6,576 | 0 | 521 | 0 | 83 | stop | 0.00227 |
| run 4 | 8,305 | – | 6,576 | 0 | 528 | 0 | 75 | stop | 0.00228 |
| run 5 | 8,058 | – | 6,576 | 0 | 461 | 0 | 68 | stop | 0.00220 |
| stream 1 | 8,454 | 2,564 | 6,576 | 0 | 485 | 0 | 68 | stop | 0.00223 |
| stream 2 | 6,387 | 776 | 6,576 | 0 | 464 | 0 | 91 | stop | 0.00220 |
| follow-up (history = run 1) | 2,949 | – | 7,043 | **6,573** | 108 | 0 | 64 | stop | 0.00038 |

- **First turn:** median 7,528 ms, max 8,305 ms. Replies ran 454–528 tokens, so the prompt, not the cap, set the length. None hit the 1,000 cap.
- **Output rate:** 68–101 tok/s, taken as completion ÷ (wall − the 1,274 ms median probe). That's above the plan's 50 tok/s floor, so the 1,000 cap stands. At the slowest rate, a reply at the cap would take about 1.3 + 1,000 / 68 ≈ 16 s, still under the 25 s deadline.
- **Time to first token (streamed):** 0.8 s and 2.6 s. That's the number #8 would show a visitor.
- **Cache:** the follow-up read 6,573 of 7,043 prompt tokens from cache (93%) with no `sessionId`, so decision 1's "no `sessionId` / `promptCacheKey`" stands. The follow-up cost $0.0004, against $0.0022 for a first turn.
- **Cost:** $0.021 for this run (11 calls). A 20k first turn costs about $0.0022.

## An invalid first attempt: `openai/gpt-6-luna`, effort unset

The first run used the local `.env` as it stands: `OPENROUTER_MODEL=openai/gpt-6-luna` with no `OPENROUTER_REASONING_EFFORT`. That isn't the approved config. It falls back to the model's default reasoning effort (`medium`), so reasoning tokens ate the whole cap: 7 of 7 full turns ended `length` with 974–1,000 reasoning tokens, and 6 of 7 replies came back empty (the handler would answer 502 "empty reply"). The run above set `OPENROUTER_MODEL=openai/gpt-5.6-luna OPENROUTER_REASONING_EFFORT=none` in the shell, which takes precedence over `--env-file`. `.env` was neither read nor changed. Raw data: `latency-2026-09-25-gpt-6-luna-effort-unset.json` ($0.012).

**Action for whoever owns `.env` and the production env:** set `OPENROUTER_REASONING_EFFORT=none`, whichever luna id is chosen. Without it, a 20k paste gets an empty reply.
