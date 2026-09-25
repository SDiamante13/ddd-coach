# #91 blind key (open after picking in `91-blind-pairs.md`)

Selection, pairs 1–5: one pair per fixture plus a second F1 pair. The run number, the X/Y side and the pair order all come from a seeded LCG (seed 9191). Pairs 6–7: one per real #92 thread, with the run number and X/Y side from seed 9292 (n=2 per arm there), so the selection can be reproduced. Data: `91-prompt-vs-naive.json`.

| Pair | Fixture | Run | X | Y | Judge "not thought of" | Judge "settles" |
|---|---|---|---|---|---|---|
| 1 | rebook-notes | 2 | naive | coach v11 | naive | coach |
| 2 | booking-split | 5 | coach v11 | naive | coach | naive |
| 3 | booking-split | 6 | coach v11 | naive | coach | naive |
| 4 | carrier-status | 1 | naive | coach v11 | coach | naive |
| 5 | example-thread | 4 | naive | coach v11 | naive | naive |
| 6 | erpnext-34467 (real) | 2 | naive | coach v11 | naive | naive |
| 7 | odoo-93552 (real) | 2 | coach v11 | naive | naive | naive |
