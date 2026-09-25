# Slice 3 eval, 2026-09-25: openai/gpt-5.6-terra, effort none, instructions v6

**Ships: no.** Hard checks 6/9, attribution 8/9.

| Fixture | Split (3/3) | Code line (3/3) | Question spans the thread (3/3) | Same meaning named (3/3) |
|---|---|---|---|---|
| booking-split | 3/3 | 3/3 | 3/3 | 0/3 |
| rebook-notes | 3/3 | 3/3 | 3/3 | 3/3 |
| carrier-status | 3/3 | 3/3 | 3/3 | 3/3 |

| Run | Hard failures | Soft misses | ms | Prompt tokens | Cached | Completion | finishReason | Cost $ |
|---|---|---|---|---|---|---|---|---|
| booking-split 1 | same meaning not split | under400Words, sameMeaningNamed | 7199 | 7559 | 0 | 547 | stop | 0.02546 |
| booking-split 2 | none | sameMeaningNamed | 5907 | 7559 | 7556 | 495 | stop | 0.00746 |
| booking-split 3 | same meaning not split | under400Words, sameMeaningNamed | 6839 | 7559 | 7556 | 603 | stop | 0.00875 |
| rebook-notes 1 | code guess | none | 5056 | 2549 | 1962 | 387 | stop | 0.00650 |
| rebook-notes 2 | none | none | 4544 | 2549 | 2546 | 412 | stop | 0.00546 |
| rebook-notes 3 | none | none | 4909 | 2549 | 2546 | 397 | stop | 0.00528 |
| carrier-status 1 | none | attribution | 4727 | 2546 | 1962 | 288 | stop | 0.00531 |
| carrier-status 2 | none | none | 3313 | 2546 | 2543 | 252 | stop | 0.00354 |
| carrier-status 3 | none | none | 3817 | 2546 | 2543 | 273 | stop | 0.00379 |
