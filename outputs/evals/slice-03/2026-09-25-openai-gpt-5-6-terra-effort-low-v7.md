# Slice 3 eval, 2026-09-25: openai/gpt-5.6-terra, effort low, instructions v7

**Ships: no.** Hard checks 6/9, attribution 9/9.

| Fixture | Split (3/3) | Code line (3/3) | Question spans the thread (3/3) | Same meaning named (3/3) |
|---|---|---|---|---|
| booking-split | 0/3 | 2/3 | 0/3 | 3/3 |
| rebook-notes | 3/3 | 3/3 | 3/3 | 3/3 |
| carrier-status | 3/3 | 3/3 | 3/3 | 3/3 |

| Run | Hard failures | Soft misses | ms | Prompt tokens | Cached | Completion | finishReason | Cost $ |
|---|---|---|---|---|---|---|---|---|
| booking-split 1 | parses, one question, complete ending, question asks | split, questionSpansThread, jointRoles, forum | 20206 | 7610 | 0 | 1000 | length | 0.03102 |
| booking-split 2 | parses, one question, complete ending, question asks | split, questionSpansThread, jointRoles, forum | 21595 | 7610 | 7607 | 1000 | length | 0.01353 |
| booking-split 3 | parses, one question, complete ending, question asks | split, codeLine, questionSpansThread, jointRoles, forum | 20700 | 7610 | 7607 | 1000 | length | 0.01353 |
| rebook-notes 1 | none | none | 18461 | 2600 | 2013 | 917 | stop | 0.01287 |
| rebook-notes 2 | none | none | 19224 | 2600 | 2597 | 870 | stop | 0.01097 |
| rebook-notes 3 | none | none | 17604 | 2600 | 2597 | 893 | stop | 0.01124 |
| carrier-status 1 | none | none | 4718 | 2597 | 2013 | 247 | stop | 0.00483 |
| carrier-status 2 | none | none | 5623 | 2597 | 2594 | 288 | stop | 0.00398 |
| carrier-status 3 | none | none | 4377 | 2597 | 2594 | 263 | stop | 0.00368 |
