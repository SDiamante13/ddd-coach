# Slice 3 eval, 2026-09-25: openai/gpt-5.6-terra, effort none, instructions v3

**Ships: yes.** Hard checks 9/9, attribution 9/9.

| Fixture | Split (≥ 2/3) | Code line (≥ 2/3) |
|---|---|---|
| booking-split | 3/3 | 3/3 |
| rebook-notes | 3/3 | 3/3 |
| carrier-status | 3/3 | 3/3 |

| Run | Hard failures | Soft misses | ms | Prompt tokens | Cached | Completion | finishReason | Cost $ |
|---|---|---|---|---|---|---|---|---|
| booking-split 1 | none | none | 7291 | 6760 | 0 | 470 | stop | 0.02254 |
| booking-split 2 | none | none | 6099 | 6760 | 6757 | 442 | stop | 0.00666 |
| booking-split 3 | none | none | 6392 | 6760 | 6757 | 455 | stop | 0.00682 |
| rebook-notes 1 | none | none | 5940 | 1796 | 1164 | 395 | stop | 0.00655 |
| rebook-notes 2 | none | none | 5885 | 1796 | 1793 | 382 | stop | 0.00495 |
| rebook-notes 3 | none | none | 6109 | 1796 | 1793 | 379 | stop | 0.00491 |
| carrier-status 1 | none | none | 4537 | 1748 | 1164 | 241 | stop | 0.00458 |
| carrier-status 2 | none | none | 3874 | 1748 | 1745 | 211 | stop | 0.00289 |
| carrier-status 3 | none | none | 3719 | 1748 | 1745 | 224 | stop | 0.00304 |
