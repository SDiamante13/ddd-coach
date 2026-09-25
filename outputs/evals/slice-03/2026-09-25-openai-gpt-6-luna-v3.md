# Slice 3 eval, 2026-09-25: openai/gpt-6-luna, effort none, instructions v3

**Ships: no.** Hard checks 5/9, attribution 7/9.

| Fixture | Split (≥ 2/3) | Code line (≥ 2/3) | Question spans the thread (≥ 2/3) |
|---|---|---|---|
| booking-split | 1/3 | 3/3 | 3/3 |
| rebook-notes | 3/3 | 3/3 | 3/3 |
| carrier-status | 3/3 | 3/3 | 3/3 |

| Run | Hard failures | Soft misses | ms | Prompt tokens | Cached | Completion | finishReason | Cost $ |
|---|---|---|---|---|---|---|---|---|
| booking-split 1 | none | split, jointRoles, forum | 5031 | 6761 | 1164 | 523 | stop | 0.00097 |
| booking-split 2 | none | split, jointRoles, forum | 4968 | 6761 | 6758 | 506 | stop | 0.00032 |
| booking-split 3 | none | attribution, jointRoles, forum | 5129 | 6761 | 6758 | 519 | stop | 0.00033 |
| rebook-notes 1 | no names, code guess | jointRoles, forum | 4734 | 1751 | 1164 | 448 | stop | 0.00031 |
| rebook-notes 2 | no names | jointRoles, forum | 4512 | 1751 | 1748 | 388 | stop | 0.00021 |
| rebook-notes 3 | no names | jointRoles, forum | 5039 | 1751 | 1748 | 479 | stop | 0.00026 |
| carrier-status 1 | one question | attribution, jointRoles | 5727 | 1748 | 1164 | 515 | stop | 0.00034 |
| carrier-status 2 | none | jointRoles | 3759 | 1748 | 1745 | 250 | stop | 0.00014 |
| carrier-status 3 | none | jointRoles | 7082 | 1748 | 1745 | 268 | stop | 0.00015 |
