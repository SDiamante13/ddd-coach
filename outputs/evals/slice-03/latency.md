# Slice 3 latency spike (the gate, decision 6)

The gate ran on 2026-09-25 from the dev machine against OpenRouter, with `npm run eval -- --latency`. The fixture is F1 (`server/eval/fixtures/booking-split.txt`, 20,000 characters once the trailing newline is trimmed, as the app trims it), sent as a first turn, with the 1,000-token cap.
- Each call: 3 one-token probes, 5 first turns, 2 streamed first turns, and 1 follow-up whose history is run 1.
- Every first turn starts with its own "(Pasted at …)" line, so the paste is never read from cache, just as it wouldn't be on a visitor's first turn. Only the shared system prompt can be cached.
- Output rate is completion ÷ (wall − the median probe).
- The recorded calls keep the replies but store only each prompt's length and sha256.

**Verdict for production, `openai/gpt-5.6-terra` at effort `none` with prompt v4: the 15 s rule doesn't fire.** The median first turn took 8.1 s and the slowest 8.8 s, against limits of 15 s (median) and 22 s (any run). Streaming (#8) stays behind #58. Steven chose terra for production because only terra meets the eval's ship bar (`summary.md`). `openai/gpt-6-luna` is the local dev model. It also passes the gate, with a median of 5.4 s.

## `openai/gpt-5.6-terra`, effort `none` (production; prompt v4)

Raw data: `latency-2026-09-25-openai-gpt-5-6-terra.json`.

| Call | Wall ms | First token ms | Prompt tokens | Cached | Completion | Reasoning | Output tok/s | finishReason | Cost $ |
|---|---|---|---|---|---|---|---|---|---|
| probe 1 (cap 1) | 2,044 | – | 7,051 | 1,434 | 16 | 0 | – | length | 0.01452 |
| probe 2 (cap 1) | 2,228 | – | 7,051 | 1,434 | 16 | 0 | – | length | 0.01452 |
| probe 3 (cap 1) | 1,303 | – | 7,051 | 1,434 | 16 | 0 | – | length | 0.01452 |
| run 1 | 7,930 | – | 7,051 | 1,434 | 460 | 0 | 78 | stop | 0.01985 |
| run 2 | 7,838 | – | 7,051 | 1,434 | 478 | 0 | 82 | stop | 0.02006 |
| run 3 | 8,168 | – | 7,051 | 1,434 | 514 | 0 | 84 | stop | 0.02050 |
| run 4 | 8,120 | – | 7,051 | 1,434 | 489 | 0 | 80 | stop | 0.02020 |
| run 5 | 8,829 | – | 7,051 | 1,434 | 529 | 0 | 78 | stop | 0.02068 |
| stream 1 | 8,747 | 1,180 | 7,051 | 1,434 | 511 | 0 | 76 | stop | 0.02046 |
| stream 2 | 8,149 | 1,654 | 7,051 | 1,434 | 481 | 0 | 79 | stop | 0.02010 |
| follow-up (history = run 1) | 3,412 | – | 7,524 | **7,048** | 116 | 0 | 85 | stop | 0.00399 |

- **First turn:** median 8,120 ms, max 8,829 ms. Replies ran 460–529 tokens and all ended `stop`.
- **Output rate:** 76–85 tok/s, above the 50 tok/s floor, so the 1,000 cap stands. A reply at the cap would take about 2.0 + 1,000 / 76 ≈ 15 s, under the 25 s deadline but close to the 15 s rule. Watch the hosted numbers.
- **Time to first token (streamed):** 1.2 s and 1.7 s.
- **Cache:** v4's system prompt (about 1,430 tokens) is cached across first turns. The follow-up read 7,048 of 7,524 prompt tokens from cache (94%).
- **Cost:** a 20k first turn costs about $0.020, and a cached follow-up about $0.004. The spike cost $0.19, most of it in the three uncached-paste probes.

## `openai/gpt-5.6-terra`, effort `low` (#73 trial; prompt v6)

Raw data: `latency-2026-09-25-openai-gpt-5-6-terra-effort-low.json`. Nonce'd 20k first turns, as above.

| Call | Wall ms | Completion | Reasoning | finishReason |
|---|---|---|---|---|
| run 1 | 17,987 | 925 | 461 | stop |
| run 2 | 21,186 | **1,000** | 681 | **length** |
| run 3 | 8,981 | 504 | 0 | stop |
| run 4 | 7,607 | 479 | 0 | stop |
| run 5 | 7,695 | 475 | 0 | stop |
| stream 1 | 8,231 | 491 | 0 | stop |
| stream 2 | 19,936 | **1,000** | 578 | **length** |
| follow-up | 3,649 | 115 | 0 | stop |

- **First turn:** median 8,981 ms, max 21,186 ms. The gate's verdict doesn't fire (15 s median, 22 s any run), but the max is 0.8 s under the run limit and 3.8 s under the 25 s deadline.
- **The cap:** reasoning tokens count toward the 1,000 cap. When terra reasons (3 of 7 full first turns), it spends 461–681 tokens thinking. 2 of 7 replies were cut at the cap (`length`), so a visitor would see a reply cut short.
- **Cost:** $0.208 for the spike.

## `openai/gpt-6-luna`, effort `none` (local dev model; prompt v3)

Raw data: `latency-2026-09-25-openai-gpt-6-luna.json`.

| Call | Wall ms | First token ms | Prompt tokens | Cached | Completion | Reasoning | Output tok/s | finishReason | Cost $ |
|---|---|---|---|---|---|---|---|---|---|
| probe 1 (cap 1) | 2,045 | – | 6,781 | 0 | 16 | 0 | – | length | 0.00086 |
| probe 2 (cap 1) | 1,683 | – | 6,781 | 1,164 | 16 | 0 | – | length | 0.00072 |
| probe 3 (cap 1) | 1,612 | – | 6,781 | 1,164 | 16 | 0 | – | length | 0.00072 |
| run 1 | 5,407 | – | 6,781 | 1,164 | 473 | 0 | 127 | stop | 0.00095 |
| run 2 | 6,574 | – | 6,781 | 1,164 | 538 | 0 | 110 | stop | 0.00098 |
| run 3 | 5,352 | – | 6,781 | 1,164 | 513 | 0 | 140 | stop | 0.00097 |
| run 4 | 6,159 | – | 6,781 | 1,164 | 505 | 0 | 113 | stop | 0.00097 |
| run 5 | 4,970 | – | 6,781 | 1,164 | 530 | 0 | 161 | stop | 0.00098 |
| stream 1 | 5,021 | 1,117 | 6,781 | 1,164 | 520 | 0 | 156 | stop | 0.00097 |
| stream 2 | 4,571 | 1,013 | 6,781 | 1,164 | 476 | 0 | 165 | stop | 0.00095 |
| follow-up (history = run 1) | 3,238 | – | 7,267 | **6,778** | 172 | 0 | 111 | stop | 0.00021 |

- **First turn:** median 5,407 ms, max 6,574 ms. Replies ran 473–538 tokens and all ended `stop`, so none hit the cap.
- **Output rate:** 110–165 tok/s, well above the plan's 50 tok/s floor, so the 1,000 cap stands. A reply at the cap would take about 1.7 + 1,000 / 110 ≈ 11 s.
- **Time to first token (streamed):** 1.0 s and 1.1 s.
- **Cache:** v3's system prompt (about 1,160 tokens) is over OpenAI's 1,024-token minimum, so every first turn after the first read it from cache, including for other visitors. The follow-up read 6,778 of 7,267 prompt tokens from cache (93%) with no `sessionId`, which confirms decision 1.
- **Cost:** a 20k first turn costs about $0.0010, and a cached follow-up about $0.0002. The spike cost $0.009.

## `openai/gpt-5.6-luna`, effort `none` (for comparison; prompt v1)

This was the plan's model when the gate first ran. Raw data: `latency-2026-09-25-openai-gpt-5-6-luna.json`.

| Call | Wall ms | First token ms | Prompt tokens | Cached | Completion | Output tok/s | finishReason | Cost $ |
|---|---|---|---|---|---|---|---|---|
| probes (3, cap 1) | 1,265 / 1,805 / 1,274 | – | 6,576 | 0 | 16 | – | length | 0.00166 each |
| run 1 | 5,764 | – | 6,576 | 0 | 454 | 101 | stop | 0.00219 |
| run 2 | 6,367 | – | 6,576 | 0 | 489 | 96 | stop | 0.00223 |
| run 3 | 7,528 | – | 6,576 | 0 | 521 | 83 | stop | 0.00227 |
| run 4 | 8,305 | – | 6,576 | 0 | 528 | 75 | stop | 0.00228 |
| run 5 | 8,058 | – | 6,576 | 0 | 461 | 68 | stop | 0.00220 |
| stream 1 | 8,454 | 2,564 | 6,576 | 0 | 485 | 68 | stop | 0.00223 |
| stream 2 | 6,387 | 776 | 6,576 | 0 | 464 | 91 | stop | 0.00220 |
| follow-up | 2,949 | – | 7,043 | 6,573 | 108 | 64 | stop | 0.00038 |

Median 7,528 ms, max 8,305 ms, first token 0.8–2.6 s, 68–101 tok/s. The rule doesn't fire here either. gpt-6-luna is about 2 s faster per first turn and costs less than half as much.

## An invalid first attempt: `openai/gpt-6-luna`, effort unset

The first run used the local `.env` as it stood then: `OPENROUTER_MODEL=openai/gpt-6-luna` with no `OPENROUTER_REASONING_EFFORT`.
- The model's default reasoning effort (`medium`) spent 974–1,000 reasoning tokens per turn.
- So 7 of 7 full turns ended `length`, and 6 of 7 replies came back empty (the handler would answer 502 "empty reply").

Team-lead has since added `OPENROUTER_REASONING_EFFORT=none` to `.env` and set it in production. **Without it, a 20k paste gets an empty reply.** Raw data: `latency-2026-09-25-gpt-6-luna-effort-unset.json` ($0.012).
