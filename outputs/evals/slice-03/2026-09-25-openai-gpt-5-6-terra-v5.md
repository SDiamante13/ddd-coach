# Slice 3 eval, 2026-09-25: openai/gpt-5.6-terra, effort none, instructions v5

**Ships: no.** Hard checks 4/9, attribution 8/9.

| Fixture | Split (3/3) | Code line (3/3) | Question spans the thread (3/3) | Same meaning named (3/3) |
|---|---|---|---|---|
| booking-split | 3/3 | 3/3 | 3/3 | 0/3 |
| rebook-notes | 3/3 | 3/3 | 3/3 | 3/3 |
| carrier-status | 3/3 | 3/3 | 3/3 | 3/3 |

| Run | Hard failures | Soft misses | ms | Prompt tokens | Cached | Completion | finishReason | Cost $ |
|---|---|---|---|---|---|---|---|---|
| booking-split 1 | same meaning not split | sameMeaningNamed | 7121 | 7470 | 0 | 497 | stop | 0.02464 |
| booking-split 2 | same meaning not split | under400Words, sameMeaningNamed | 8329 | 7470 | 7467 | 537 | stop | 0.00794 |
| booking-split 3 | same meaning not split | sameMeaningNamed | 8341 | 7470 | 7467 | 503 | stop | 0.00754 |
| rebook-notes 1 | none | quotedWordsInThread | 8028 | 2460 | 1873 | 463 | stop | 0.00740 |
| rebook-notes 2 | none | none | 7231 | 2460 | 2457 | 431 | stop | 0.00567 |
| rebook-notes 3 | none | none | 7518 | 2460 | 2457 | 435 | stop | 0.00572 |
| carrier-status 1 | none | none | 5845 | 2457 | 1873 | 269 | stop | 0.00506 |
| carrier-status 2 | holders | none | 5341 | 2457 | 2454 | 275 | stop | 0.00380 |
| carrier-status 3 | holders | attribution | 4641 | 2457 | 2454 | 268 | stop | 0.00371 |
