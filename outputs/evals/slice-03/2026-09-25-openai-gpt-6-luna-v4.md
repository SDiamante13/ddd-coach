# Slice 3 eval, 2026-09-25: openai/gpt-6-luna, effort none, instructions v4

**Ships: no.** Hard checks 7/9, attribution 7/9.

| Fixture | Split (≥ 2/3) | Code line (≥ 2/3) | Question spans the thread (≥ 2/3) |
|---|---|---|---|
| booking-split | 1/3 | 3/3 | 2/3 |
| rebook-notes | 3/3 | 3/3 | 3/3 |
| carrier-status | 3/3 | 3/3 | 3/3 |

| Run | Hard failures | Soft misses | ms | Prompt tokens | Cached | Completion | finishReason | Cost $ |
|---|---|---|---|---|---|---|---|---|
| booking-split 1 | none | attribution | 4627 | 7031 | 0 | 522 | stop | 0.00114 |
| booking-split 2 | none | split, under400Words, questionSpansThread | 5165 | 7031 | 7028 | 570 | stop | 0.00036 |
| booking-split 3 | none | split, under400Words | 4958 | 7031 | 7028 | 552 | stop | 0.00035 |
| rebook-notes 1 | no names | none | 3962 | 2021 | 1434 | 463 | stop | 0.00032 |
| rebook-notes 2 | no names | attribution | 4308 | 2021 | 2018 | 399 | stop | 0.00022 |
| rebook-notes 3 | none | none | 3850 | 2021 | 2018 | 442 | stop | 0.00024 |
| carrier-status 1 | none | none | 2796 | 2018 | 1434 | 211 | stop | 0.00019 |
| carrier-status 2 | none | none | 2713 | 2018 | 2015 | 205 | stop | 0.00012 |
| carrier-status 3 | none | none | 3162 | 2018 | 2015 | 246 | stop | 0.00014 |
