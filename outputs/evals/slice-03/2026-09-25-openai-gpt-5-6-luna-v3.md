# Slice 3 eval, 2026-09-25: openai/gpt-5.6-luna, effort none, instructions v3

**Ships: no.** Hard checks 6/9, attribution 8/9.

| Fixture | Split (≥ 2/3) | Code line (≥ 2/3) |
|---|---|---|
| booking-split | 3/3 | 3/3 |
| rebook-notes | 3/3 | 3/3 |
| carrier-status | 3/3 | 3/3 |

| Run | Hard failures | Soft misses | ms | Prompt tokens | Cached | Completion | finishReason | Cost $ |
|---|---|---|---|---|---|---|---|---|
| booking-split 1 | none | attribution | 7423 | 6760 | 0 | 483 | stop | 0.00227 |
| booking-split 2 | none | none | 7590 | 6760 | 6757 | 485 | stop | 0.00072 |
| booking-split 3 | none | none | 6371 | 6760 | 6757 | 503 | stop | 0.00074 |
| rebook-notes 1 | no names | none | 7256 | 1796 | 1164 | 510 | stop | 0.00079 |
| rebook-notes 2 | no names | none | 6504 | 1796 | 1793 | 480 | stop | 0.00061 |
| rebook-notes 3 | no names | none | 6653 | 1796 | 1793 | 519 | stop | 0.00066 |
| carrier-status 1 | none | none | 4677 | 1748 | 1164 | 302 | stop | 0.00053 |
| carrier-status 2 | none | none | 4735 | 1748 | 1745 | 301 | stop | 0.00040 |
| carrier-status 3 | none | none | 5737 | 1748 | 1745 | 326 | stop | 0.00043 |
