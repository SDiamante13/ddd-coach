# Spike #92: the coach on real public threads

**Run:** 2026-09-25. Prompt v11 (the `coach-instructions.v11.txt` snapshot via `instructionsOf`) on `openai/gpt-5.6-terra` at effort `none`, set by a shell env override and checked in the script before any call. n=2, no nonce, 12 calls, **$0.0852** in total against a $0.20 cap. The script and thread texts stay in the session scratchpad; no thread text is committed.

**Caveat:** these are open-source product debates, not ops against finance at one company, so the spike tests detection only.

## Checks without an answer key

- **Applied (hard):** parses, events, labels, no names (the thread's logins plus names in the text), one question, complete ending, at most 4 quoted words, no markdown, no offers, no jargon, question asks, question names a case, question sources, at most 600 words.
- **Applied (soft):** quoted words in the thread, under 400 words.
- **Not applicable (they need a key):**
  - hard: holders, split labels, stable views, no merged split, same meaning not split, code guess;
  - soft: attribution, split, code line, question spans the thread, joint roles, forum, same meaning named.

## Results

| Thread | Chars | Real split found | Invented conflict | Question useful | Hard fails (key-free) | ms (r1/r2) | $ |
|---|---|---|---|---|---|---|---|
| [ERPNext #34467](https://github.com/frappe/erpnext/issues/34467) "Invoice on Account" | 11,070 | 2/2: request with tax at payment (DE) vs tax invoice with tax due at once (IN) | minor: r2 splits "Sales Invoice" into current vs proposed | 2/2 (r1 strong) | names a case ×2 | 4,761 / 4,679 | 0.0185 |
| [Odoo #93552](https://github.com/odoo/odoo/issues/93552) "Company" | 4,283 | 2/2: contact type vs `company_id` vs commercial partner | yes: "Organization" proposals and r2's "change" split as meanings | 0/2 (r2 answerable from the code; r1 muddled) | no markdown ×2, names a case, sources | 4,679 / 4,166 | 0.0133 |
| [Odoo #78825](https://github.com/odoo/odoo/issues/78825) "Delivery Address" (near-miss) | 3,165 | 2/2: contract address vs partner address vs fiscal-position input | mild: a settled thread shown as open | 2/2 | names a case ×2 | 3,620 / 3,731 | 0.0117 |
| [Odoo #21897](https://github.com/odoo/odoo/issues/21897) "Income" (swap-in) | 2,958 | 2/2: P/L income vs code's gross profit + other income; ruling Income → Revenue | no | 2/2, but half-answered by the ruling | none | 3,778 / 4,200 | 0.0126 |
| [Mastodon #13268](https://github.com/mastodon/mastodon/issues/13268) "Favourite" | 9,657 | 2/2: read-later bookmark vs like that notifies | mild: "like = what big platforms say" as a meaning | 1/2 (r2 asks a pull request, not people) | none | 4,206 / 4,305 | 0.0164 |
| [OpenMRS Talk 1781](https://talk.openmrs.org/t/fhir-encounter-visit-observation-resources/1781) "Encounter vs Visit" (paraphrase) | 2,567 | 2/2: OpenMRS visit vs encounter vs nested FHIR encounter | no | 2/2, but it echoes the thread's own open question | names a case ×2 | 4,775 / 4,593 | 0.0128 |

Median latency 4,256 ms, max 4,775 ms. Every run ended with `stop`, used 334–483 completion tokens and stayed under 400 words.

## Verdict

**Decision rule met.** Of the 5 threads in the market-research list, 3 got a useful question in both runs: ERPNext, Delivery Address and OpenMRS. With the swap-in, it's 4 of 6. Detection generalises: the coach found the real term split in 12 of 12 runs.

## Failure patterns (candidates for prompt issues)

1. **Proposals split as meanings:** a suggested rename or an attitude gets written as someone's meaning (Company, Favourite). This is the main invented-conflict pattern.
2. **"Team unclear" when the thread names the holder:** ERPNext's two sides are jurisdictions (Germany, India). Both runs file them as "Team unclear" and put the country inside the meaning.
3. **Settled threads treated as open:** Delivery Address (field hidden) and Income (renamed to Revenue). The question re-asks what the thread already decided instead of what the ruling left open.
4. **Code formatting copied from the thread:** backticks around `company_id` (Company ×2).
5. **A source line with text outside the quotes** (1/12).

## Check note

**"Question names a case" failed 7/12**, and it's fixture-shaped: it needs a 3+ digit number, "Customer X" or a clock time. Product debates rarely have one, even when the question names a concrete scenario. Don't make it a hard gate for non-ops fixtures.

## Next

For the eval fixtures, pick ERPNext #34467 (a strong split with an answer key) and Odoo #93552 (the weakest question, and the invented-split pattern to target). Keep the text fetched at eval time, per the PO rule.
