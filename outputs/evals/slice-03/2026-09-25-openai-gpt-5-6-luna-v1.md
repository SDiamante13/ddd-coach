# Slice 3 eval, 2026-09-25: openai/gpt-5.6-luna, effort none, instructions v1

**Ships: no.** Hard checks 6/9, attribution 3/9.

| Fixture | Split (≥ 2/3) | Code line (≥ 2/3) |
|---|---|---|
| booking-split | 0/3 | 3/3 |
| rebook-notes | 3/3 | 3/3 |
| carrier-status | 3/3 | 3/3 |

| Run | Hard failures | Soft misses | ms | Prompt tokens | Cached | Completion | finishReason | Cost $ |
|---|---|---|---|---|---|---|---|---|
| booking-split 1 | none | split | 6424 | 6556 | 0 | 446 | stop | 0.00217 |
| booking-split 2 | none | split | 6623 | 6556 | 6553 | 474 | stop | 0.00070 |
| booking-split 3 | none | split | 7133 | 6556 | 6553 | 473 | stop | 0.00070 |
| rebook-notes 1 | no names | attribution | 6443 | 1592 | 0 | 475 | stop | 0.00097 |
| rebook-notes 2 | no names | attribution, under400Words | 7133 | 1592 | 1589 | 540 | stop | 0.00068 |
| rebook-notes 3 | no names | attribution | 7149 | 1592 | 1589 | 508 | stop | 0.00064 |
| carrier-status 1 | none | attribution | 4627 | 1544 | 0 | 328 | stop | 0.00078 |
| carrier-status 2 | none | attribution | 6091 | 1544 | 1541 | 366 | stop | 0.00047 |
| carrier-status 3 | none | attribution | 5314 | 1544 | 1541 | 344 | stop | 0.00044 |
