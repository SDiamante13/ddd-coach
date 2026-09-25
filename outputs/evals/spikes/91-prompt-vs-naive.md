# #91 spike: live prompt v11 against a one-line prompt

**Verdict under #91's decision rule: the coach doesn't win ≥70% of pairs, so shift weight to UX, export and the real-practitioner loop (#70).** Across all 28 pairs, the 4 fixtures at n=6 plus #92's 2 real threads at n=2, the coach's question won 11/28 on #91's criterion, 39% (95% Wilson CI 24–58%). It won 8/28 on "settles", 29% (CI 15–47%). Both CIs end below 70%. What the prompt does buy is structure the UX depends on: every coach reply parses into the three parts, names no one and quotes two verbatim sources, and no one-line reply does any of that. The moat is that contract plus the UI that renders it, not the question's insight.

The real threads agree with the fixtures: the coach won 2/4 on "not thought of" and 0/4 on "settles". They also show that the team-based holder lines fall back to "Team unclear" when the people aren't in teams, which loses who means what (see "Real threads"). The four fixtures are synthetic and v11 was tuned on them, which should favour the coach.

## Setup

- Model `openai/gpt-5.6-terra`, effort `none`, both arms, set per command (`OPENROUTER_MODEL=… OPENROUTER_REASONING_EFFORT=none node --env-file=.env …`), and recorded in the JSON.
- **Coach arm:** the system message is `coach-instructions.v11.txt` (the live `LIVE_INSTRUCTIONS_VERSION`), sent exactly as `chat.mts` sends it.
- **Naive arm:** the system message is #91's wording, "Here is a work thread. List where people use words differently, then ask one question for the domain expert." It goes in the same system slot, so the prompt is the only difference.
- Fixtures F1 `booking-split`, F2 `rebook-notes`, F3 `carrier-status` and `example-thread`, n=6 per arm (48 calls). Pasted as a visitor pastes, no nonce, with the arms interleaved as in the #78 A/B (coach first on odd runs). Same 1,000-token cap. All 48 calls ended `stop`.
- Scored with the eval's `scoreReply` (the #78 checks and keys), from a scratchpad script that imports `server/eval/*`. No product code changed.

## Hard checks per arm (24 thread replies each)

| Check | Coach v11 | Naive |
|---|---|---|
| **All gating checks clean** | **23/24** | **0/24** |
| parses into three parts | 24/24 | 0/24 |
| 1–5 numbered events | 24/24 | 0/24 |
| no person's name | 24/24 | **6/24**: every F1, F2 and F3 reply names people (Dana, Tom, Maya…) |
| exactly one question (coach format) | 24/24 | 0/24 |
| no markdown | 24/24 | 0/24: tables, bold, headings |
| question asks (open, no "should" ruling)¹ | 24/24 | 1/24 |
| question names a case¹ | 24/24 | 2/24 |
| question sources (two verbatim quotes) | 24/24 | 0/24 |
| at most 600 words | 24/24 | 22/24 (max 742) |
| code guess | 23/24: F2 r4 "Code counts REBOOKED rows twice." cites no `codeDescribed` phrase, the known #73 mode | vacuous |
| complete ending, ≤4 quoted words, no offers, no jargon | 24/24 | 24/24 |
| labels, holders, split labels, stable views, attribution | 24/24 | vacuous: no parse, so nothing to check |
| soft: split / Code line / question spans the thread | 24/24 each | 12/24, 6/24, 12/24 |

¹ Run on the extracted question text for the naive arm, since the whole-reply check can't find a question it can't parse. The naive questions are almost all rulings: "Should X be Y… and are there any exceptions?"

Spend by arm: coach $0.153, naive $0.181. Naive replies run longer (median 352 words, max 742; coach median 321, max 439).

## Blind pairwise judge (question only)

- Judge `anthropic/claude-sonnet-5`, reasoning off, a different family from the model under test.
- Each run i of the coach is paired with run i of the naive arm on the same fixture, 24 pairs.
- The A/B order is randomized per pair (mulberry32, seed 91). The coach came first in 16 of 24 pairs.
- The judge sees the numbered thread and the two questions. The coach's `From thread:` lines, the role prefix and all markdown are stripped.
- One call per pair scores two criteria, and the judge must pick A or B on each (no ties):
  - **"Not thought of"** (#91's criterion): which question would a tech lead who read the thread not have thought of, while the expert can still answer it?
  - **"Settles"** (team-lead's criterion): which question better joins two far-apart lines and, once answered, would settle the disagreement?

| Fixture | Coach wins, "not thought of" | Coach wins, "settles" |
|---|---|---|
| F1 booking-split | 5/6 | 0/6 |
| F2 rebook-notes | 3/6 | 2/6 |
| F3 carrier-status | 1/6 | 3/6 |
| example-thread | 0/6 | 3/6 |
| **Total** | **9/24 = 38% (CI 21–57%)** | **8/24 = 33% (CI 18–53%)** |

Position check: the coach won "not thought of" in 7/16 pairs where it came first and 2/8 where it came second. "A" was picked in 19/48 verdicts, a mild lean to B, so it's not driving the result.

**Why the judge picks the naive question, from its reasons:**
- The naive question synthesizes "the scattered amend/rebook/TONU/carrier-sync threads into one crisp rule", a policy the RFC must decide.
- The coach's question reads as "a narrow, oddly specific application-of-the-rule question".
- On F3 the judge twice called the coach question "already answered in the thread (Sam confirms it's the carrier's 990)".

**Caveat on the criterion:** "settles the disagreement" rewards exactly what the coach is told not to do. The naive questions are rulings ("should the canonical action be Amend… and are there exceptions?"), which the #73/#77 "question asks" check fails (1/24 pass). The coach's case-anchored "which of these, or neither?" follows #77's design. The judge prefers the proposal, and that's a real signal about the design: the case-anchored format may be too narrow.

## Example pairs

**F1 r6** (judge: coach for "not thought of", naive for "settles")
- Coach: "Which booking count applies to load 48213 after its same-carrier date move: the original REBOOKED row, the new row, or neither?"
- Naive: "For a same-carrier, same-lane date or pickup-window change after carrier acceptance, should the canonical business action be Amend (same booking and same tender), with carrier notification required—and are there any time/dispatch-stage exceptions where it must instead become a Rebook?"

**F3 r6** (naive on both)
- Coach: "What does Confirmed mean for Customer D's portal booking when the carrier's 990 arrives before Ops agrees the pickup window: carrier acceptance, customer window agreement, or both?"
- Naive: "Should carrier tender acceptance and customer pickup-window agreement be modeled and displayed as two separate statuses/events, and if so, what should each be called in customer-facing language?"

**Example thread r6** (naive for "not thought of", coach for "settles")
- Coach: "Which result applies to Customer D's load 7731, whose pickup was 3h after the window but delivery was 40 min before the appointment: late for the service credit and Q3 on-time %, on time, or neither?"
- Naive: "For customer reporting and service credits, should the authoritative “late” measure be actual delivery after the customer's delivery appointment, with pickup lateness and predicted delivery risk reported as separate fields rather than included in the same late-load metric?"

## Conclusion: prompt or UX?

- **Question insight is not a moat.** A one-line prompt on the same model writes a question the judge prefers in 17 of 28 pairs on "not thought of" and 20 of 28 on "settles", real threads included. The coach's edge is limited to F1's "not thought of" (5/6), the long thread.
- **The real threads expose a gap in the prompt:** with no teams in the paste, holders become "Team unclear" and the reply loses who means what, which the naive arm keeps (ERPNext's Germany vs India). Real practitioners' threads (#70) will look more like this than like the fixtures.
- **The prompt's measurable value is the contract the UX renders:** three parts, holders, verbatim sources, no names, plain text. The naive arm fails it 24/24 and names people in 18/24 (every F1–F3 reply). A one-line prompt doesn't produce that shape, and without the shape there's no swaps panel, question card or RFC export. So the moat is **prompt-as-format plus UX**. Prompt effort should protect that contract, not chase question cleverness.
- **Lead for prompt work (not a ship claim):** the case-anchored "which X, Y, or neither?" template may be too narrow. The judge called it already answered in F3. A question that names the case *and* asks for the rule behind it is worth a future A/B. That's a PO call.

## Real threads (#92), n=2 per arm

Two threads from #92's list: [ERPNext #34467](https://github.com/frappe/erpnext/issues/34467), where a participant names the split between "Invoice on Account" and "Advance Invoice", and [Odoo #93552](https://github.com/odoo/odoo/issues/93552), which is short and where the maintainers deny any confusion over "Company". They were fetched at eval time and aren't committed; the JSON redacts participant logins. It's n=2 per arm, since n=6 would have broken the $0.70 cap.

The fixtures had people in teams, but these threads don't. So the ad hoc keys hold only the participants' logins, with teams limited to "Code" and "Team unclear". That leaves holders, split labels and attribution with nothing real to judge.

| Check | Coach v11 (4 replies) | Naive (4 replies) |
|---|---|---|
| parses, events, one question | 4/4 | 0/4 |
| no names (participant logins) | 4/4 | 2/4: ERPNext names participants in both runs |
| no markdown | 2/4: Odoo copies the thread's backticked `company_id` | 0/4 |
| question sources | 3/4: Odoo r1 leaves the closing quote off one quote | 0/4 |
| question names a case | Odoo 2/2, by citing the issue number; ERPNext 0/2 | 0/4 |
| split labels | 0/4: every holder is "Team unclear", so "two plain lines" fires; an artifact of this key | vacuous |

**Answer key, ERPNext (read by hand):** both coach replies and both naive replies carry the split: a German advance request with no accounting until payment, against the Indian milestone invoice with tax due at issue.
- **The coach can't say who holds which meaning.** Every holder is "Team unclear".
- **The naive replies attribute it the way the thread does:** "German usage", "Indian usage", and the participant who proposes the two names. There, one line of attribution beats the coach's team model.
- **Coach r2's question asks for the split itself.** r1 asks which document records the advance tax once. That's the double-tax bug, not the naming split.

**Odoo, inventing conflict (read by hand):**
- Neither arm invents a feud. Both give the two real meanings of "Company": the contact type, and `company_id`.
- The coach records the maintainers' refusal as an event ("declined because its benefit is not seen as clear enough for its cost"). The naive replies leave it out.
- The coach invents roles for the question: "Contacts product lead", "multi-company product lead".
- Coach r2 adds a thin third word, "change": homogenization vs a costly cascade rename. That's opinion, not two meanings.
- The naive r2 reply lists 6 senses of "Company", one of them "general business-language meaning", which is padding.

**Judge (seed 92):**

| Thread | Coach wins, "not thought of" | Coach wins, "settles" |
|---|---|---|
| ERPNext #34467 | 1/2 | 0/2 |
| Odoo #93552 | 1/2 | 0/2 |

The judge's reasons match the fixtures:
- the naive question "synthesizes the Germany-vs-India terminology dispute into a single actionable design decision";
- the coach's Odoo r2 question is "trivially answerable from the issue text itself".

## Blind pairs for the owner

`91-blind-pairs.md` holds seven pairs labelled X/Y: one per fixture, a second F1 pair, and one per real thread. The key is in `91-blind-key.md`. The formatting is stripped, but the style can still give an arm away: naive questions tend to open "Should…/For…", coach ones "Which… or neither?".

## Spend

| Part | $ |
|---|---|
| Generation, 48 terra calls | 0.3339 |
| Judge, 24 Sonnet 5 calls | 0.2077 |
| Two failed judge calls: Sonnet 5 reasons by default and used all 400 tokens with no JSON (one recorded at $0.0245, one estimated) | ≈0.049 |
| Real threads: generation, 8 terra calls | 0.0573 |
| Real threads: judge, 4 Sonnet 5 calls | 0.0326 |
| **Total** | **≈0.680 of the $0.70 cap** |

Data: `91-prompt-vs-naive.json` holds every reply, score, judge verdict and reason, the seed and the spend.
