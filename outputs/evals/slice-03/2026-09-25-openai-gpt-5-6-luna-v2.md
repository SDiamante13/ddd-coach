# Slice 3 eval, 2026-09-25: openai/gpt-5.6-luna, effort none, instructions v2

**Ships: no.** Hard checks 5/9, attribution 6/9.

| Fixture | Split (≥ 2/3) | Code line (≥ 2/3) |
|---|---|---|
| booking-split | 0/3 | 3/3 |
| rebook-notes | 3/3 | 3/3 |
| carrier-status | 3/3 | 3/3 |

| Run | Hard failures | Soft misses | ms | Prompt tokens | Cached | Completion | finishReason | Cost $ |
|---|---|---|---|---|---|---|---|---|
| booking-split 1 | none | split | 6156 | 6622 | 0 | 438 | stop | 0.00218 |
| booking-split 2 | none | split | 7126 | 6622 | 6619 | 449 | stop | 0.00067 |
| booking-split 3 | none | split | 5721 | 6622 | 6619 | 474 | stop | 0.00070 |
| rebook-notes 1 | no names | attribution | 5867 | 1658 | 1026 | 513 | stop | 0.00079 |
| rebook-notes 2 | no names | noStaleMeaning | 6491 | 1658 | 1655 | 507 | stop | 0.00064 |
| rebook-notes 3 | no names | attribution | 6310 | 1658 | 1655 | 512 | stop | 0.00065 |
| carrier-status 1 | none | none | 4728 | 1610 | 1026 | 315 | stop | 0.00054 |
| carrier-status 2 | no names | attribution | 5279 | 1610 | 1607 | 384 | stop | 0.00049 |
| carrier-status 3 | none | none | 4264 | 1610 | 1607 | 365 | stop | 0.00047 |
