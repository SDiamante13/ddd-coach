<!-- Exported by DDD Coach, "Copy for your repo" (#113). Example built from explore-08b's data; every row comes from the kept glossary, nothing is added. -->
# Glossary

As of 14 Oct 2026. Exported from DDD Coach; the source of truth is RFC "Booking split", section 4 (Confluence). Change it there, then export again.

**For coding agents:** use these words exactly as defined here. Where a term has more than one meaning, the meaning depends on the context named in its row; don't merge them into one. Terms marked **Unsettled** have no agreed meaning yet: don't pick one, and don't name new code after either side. Don't introduce a domain term that isn't in this file; ask instead.

## booking

Two meanings by context. Split since 22 Sep 2026 · seen in 3 threads.

| Context | Meaning | Source | Status |
|---|---|---|---|
| Finance | Exists once it's invoiceable | Slack #booking-split, 22 Sep 2026 | Settled 29 Sep 2026 |
| Ops (day desk) | Exists when the customer submits | Slack #booking-split, 22 Sep 2026 | Settled 29 Sep 2026 |

## rebook

Three meanings by context. Split since 1 Oct 2026 · seen in 4 threads.

| Context | Meaning | Source | Status |
|---|---|---|---|
| Ops (night shift) | Same booking, marked REBOOKED, for a date or carrier change. Lane changes: **Unsettled**, see Q1 | Maya, §4 comment, 8 Oct 2026 · Slack #night-shift, 14 Oct 2026 | Open, asked the desk owner 14 Oct 2026 |
| Ops (day desk) | A same-carrier date change is AMENDED; a lane change is a new booking | Dana's sheet, confirmed 29 Sep 2026 | Settled 29 Sep 2026 |
| Code | `Booking#rebook!` sets the old row to REBOOKED and inserts a new row pointing back | `app/models/booking.rb`, read 1 Oct 2026 | Settled 1 Oct 2026 |

## tender

One meaning recorded; the night shift's use is not yet known.

| Context | Meaning | Source | Status |
|---|---|---|---|
| Carrier desk | The EDI 204 sent to the carrier | §4, typed 2 Oct 2026 | **Unsettled**, open until the RFC review, Tue 27 Oct 2026 |

## Open questions

1. **rebook, lane change, night shift.** "rebooked 48877 onto the Laredo lane, same ref" (Slack #night-shift, 14 Oct 2026) goes beyond "for a date or carrier change" (Maya, 8 Oct 2026). Asked the desk owner 14 Oct 2026.
2. **tender.** Is a tender the EDI 204 only, or also a phone call? For the carrier desk lead, at the RFC review, Tue 27 Oct 2026.
