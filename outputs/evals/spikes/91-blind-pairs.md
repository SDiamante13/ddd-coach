# #91 blind pairs: which question would you rather take to the domain expert?

Seven pairs of questions, each written by the same model (`openai/gpt-5.6-terra`, effort none) after reading the same thread. In each pair, one question comes from the live coaching prompt and one from a one-line prompt. X and Y were assigned at random. The key is in `91-blind-key.md`, so don't open it until you've picked.

Only the question is shown. The formatting and the coach's `From thread:` source lines were stripped, so what's left is the wording. Pick the question a tech lead wouldn't have thought of that the expert can still answer, and note whether it would settle the disagreement.

## Pair 1

Thread: F2, meeting notes: people without teams, a later correction replaces the rebook rule.

- **X:** For a carrier cancellation or drop, should the replacement be formally classified as REBOOKED or as a new booking, and should it retain a link to the original booking/reference for invoicing and dashboard counting?
- **Y:** For Load 48213, where the same-carrier date change was REBOOKED at night and the carrier charged TONU before hauling the new load, which booking and invoice count applies: the old row, the new row, or neither?

Your pick: 

## Pair 2

Thread: F1, the 20k-character Slack thread: ops split on rebooks, code agrees with finance, 27 Oct RFC review.

- **X:** For Customer B's second same-carrier date change on Wednesday night, when the truck was already rolling, which count includes the old REBOOKED row, the new row, or neither?
- **Y:** For the RFC, what is the authoritative business rule for a same-carrier, same-lane date or pickup-window change after carrier acceptance: should it remain one booking amended in place, with a carrier-sync notification, and under what exceptions—if any—must it instead become a cancel-and-new-tender rebook?

Your pick: 

## Pair 3

Thread: F1, the 20k-character Slack thread: ops split on rebooks, code agrees with finance, 27 Oct RFC review.

- **X:** Which booking count applies to load 48213 after its same-carrier date move: the original REBOOKED row, the new row, or neither?
- **Y:** For a same-carrier, same-lane date or pickup-window change after carrier acceptance, should the canonical business action be Amend (same booking and same tender), with carrier notification required—and are there any time/dispatch-stage exceptions where it must instead become a Rebook?

Your pick: 

## Pair 4

Thread: F3, the carrier-desk thread: what the portal's "Confirmed" means.

- **X:** Should “Confirmed” remain the customer-visible portal status for carrier tender acceptance, or should the portal distinguish it from a separate customer pickup-window confirmation status?
- **Y:** What does Confirmed mean for Customer D's load when Ops has told the customer the pickup window is agreed but the carrier has not yet returned the 990: carrier acceptance, customer window agreement, or neither?

Your pick: 

## Pair 5

Thread: the app's example thread: late loads, load 7731, service credits.

- **X:** For customer reporting and service credits, should the authoritative “late” status be actual delivery after the booked delivery appointment, while pickup lateness and predicted ETA risk remain separate operational metrics?
- **Y:** For Customer D load 7731, which count goes into the Q3 on-time % and service credit: the missed pickup window, the delivery appointment, or both?

Your pick: 

## Pair 6

Thread: ERPNext issue #34467, a real public thread: "Invoice on Account" vs "Advance Invoice", German and Indian tax practice.

- **X:** Should ERPNext model these as two separately named workflows—(1) a non-posting Advance Payment Request/Advance Invoice where tax is recognized on receipt, and (2) a posting On-Account/Milestone Sales Invoice where tax is recognized on invoice—or should one configurable Sales Invoice workflow cover both while preserving jurisdiction-specific tax timing and advance-tax reconciliation?
- **Y:** How must an advance on the Sales Order be represented when payment is received: as an Advance Invoice with no posting until Payment Entry, or as an Invoice on Account with tax and accounting at issue?

Your pick: 

## Pair 7

Thread: Odoo issue #93552, a real public thread: "Company" as a contact type vs the multi-company field; the maintainers deny any confusion.

- **X:** Which meaning does "Company" have for the new Contacts record shown in issue #93552: the contact type opposite "individual", the company_id multi-company value, or both?
- **Y:** What distinct business concepts should Odoo officially name and define for (a) the operating multi-company entity, (b) a partner’s person-vs-organization type, and (c) the commercial parent/grouping of contacts, so that labels and field names can be made consistently unambiguous?

Your pick: 
