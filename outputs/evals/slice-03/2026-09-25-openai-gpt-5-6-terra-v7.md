# Slice 3 eval, 2026-09-25: openai/gpt-5.6-terra, effort none, instructions v7

**Ships: no.** Hard checks 4/9, attribution 6/9.

| Fixture | Split (3/3) | Code line (3/3) | Question spans the thread (3/3) | Same meaning named (3/3) |
|---|---|---|---|---|
| booking-split | 3/3 | 3/3 | 3/3 | 0/3 |
| rebook-notes | 2/3 | 3/3 | 3/3 | 3/3 |
| carrier-status | 3/3 | 3/3 | 3/3 | 3/3 |

| Run | Hard failures | Soft misses | ms | Prompt tokens | Cached | Completion | finishReason | Cost $ |
|---|---|---|---|---|---|---|---|---|
| booking-split 1 | same meaning not split | attribution, sameMeaningNamed | 6211 | 7610 | 0 | 514 | stop | 0.02519 |
| booking-split 2 | same meaning not split | sameMeaningNamed | 6207 | 7610 | 7607 | 505 | stop | 0.00759 |
| booking-split 3 | same meaning not split | sameMeaningNamed | 5962 | 7610 | 7607 | 473 | stop | 0.00720 |
| rebook-notes 1 | code guess | none | 6945 | 2600 | 2013 | 413 | stop | 0.00682 |
| rebook-notes 2 | none | none | 4956 | 2600 | 2597 | 381 | stop | 0.00510 |
| rebook-notes 3 | split labels | split | 5004 | 2600 | 2597 | 387 | stop | 0.00517 |
| carrier-status 1 | none | attribution | 3778 | 2597 | 2013 | 284 | stop | 0.00527 |
| carrier-status 2 | none | none | 3282 | 2597 | 2594 | 279 | stop | 0.00387 |
| carrier-status 3 | none | attribution | 4405 | 2597 | 2594 | 313 | stop | 0.00428 |
