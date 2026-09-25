# Slice 3 eval, 2026-09-25: openai/gpt-5.6-terra, effort none, instructions v4

**Ships: yes.** Hard checks 9/9, attribution 9/9.

| Fixture | Split (≥ 2/3) | Code line (≥ 2/3) | Question spans the thread (≥ 2/3) |
|---|---|---|---|
| booking-split | 3/3 | 3/3 | 3/3 |
| rebook-notes | 3/3 | 3/3 | 3/3 |
| carrier-status | 3/3 | 3/3 | 3/3 |

| Run | Hard failures | Soft misses | ms | Prompt tokens | Cached | Completion | finishReason | Cost $ |
|---|---|---|---|---|---|---|---|---|
| booking-split 1 | none | none | 8690 | 7031 | 0 | 458 | stop | 0.02307 |
| booking-split 2 | none | none | 8177 | 7031 | 7028 | 458 | stop | 0.00691 |
| booking-split 3 | none | none | 8627 | 7031 | 7028 | 464 | stop | 0.00698 |
| rebook-notes 1 | none | none | 6588 | 2021 | 1434 | 375 | stop | 0.00625 |
| rebook-notes 2 | none | none | 5792 | 2021 | 2018 | 339 | stop | 0.00448 |
| rebook-notes 3 | none | none | 6851 | 2021 | 2018 | 344 | stop | 0.00454 |
| carrier-status 1 | none | none | 4523 | 2018 | 1434 | 215 | stop | 0.00433 |
| carrier-status 2 | none | none | 4394 | 2018 | 2015 | 219 | stop | 0.00304 |
| carrier-status 3 | none | none | 4253 | 2018 | 2015 | 220 | stop | 0.00305 |
