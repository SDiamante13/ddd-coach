# Slice 3 eval, 2026-09-25: openai/gpt-5.6-terra, effort low, instructions v6

**Ships: no.** Hard checks 3/9, attribution 9/9.

| Fixture | Split (3/3) | Code line (3/3) | Question spans the thread (3/3) | Same meaning named (3/3) |
|---|---|---|---|---|
| booking-split | 3/3 | 3/3 | 3/3 | 1/3 |
| rebook-notes | 3/3 | 3/3 | 3/3 | 3/3 |
| carrier-status | 3/3 | 3/3 | 3/3 | 3/3 |

| Run | Hard failures | Soft misses | ms | Prompt tokens | Cached | Completion | finishReason | Cost $ |
|---|---|---|---|---|---|---|---|---|
| booking-split 1 | same meaning not split | none | 8365 | 7559 | 0 | 500 | stop | 0.02490 |
| booking-split 2 | same meaning not split | sameMeaningNamed | 11257 | 7559 | 7556 | 628 | stop | 0.00905 |
| booking-split 3 | same meaning not split | under400Words, sameMeaningNamed | 9556 | 7559 | 7556 | 551 | stop | 0.00813 |
| rebook-notes 1 | none | none | 18574 | 2549 | 1962 | 876 | stop | 0.01237 |
| rebook-notes 2 | code guess | none | 17691 | 2549 | 2546 | 878 | stop | 0.01105 |
| rebook-notes 3 | none | none | 17591 | 2549 | 2546 | 936 | stop | 0.01175 |
| carrier-status 1 | none | none | 5496 | 2546 | 1962 | 295 | stop | 0.00539 |
| carrier-status 2 | holders | none | 5319 | 2546 | 2543 | 277 | stop | 0.00384 |
| carrier-status 3 | holders | none | 4680 | 2546 | 2543 | 277 | stop | 0.00384 |
