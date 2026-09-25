# Slice 3 demo: paste a messy thread, see where people disagree (#4) plus #69

Recorded 2026-09-25 on the **production URL https://ddd-coach.netlify.app**. Deploy `6ab68f04…`, built from `f3f1e41`, model `openai/gpt-5.6-terra` at effort `none`, prompt v4. The session was `agent-browser --session verifier` (v0.23.0).

## Files

| File | Size |
|---|---|
| `slice-03.mp4` (2 min 34 s, H.264, yuv420p, 1280×578, one take) | 3.1 MB |
| `slice-03.png` (1280×800, hosted: the full three-part reply to F1, page zoomed to 55% so all of it fits above the composer) | 151 KB |
| `slice-03-first-visit.png` (1280×800, fresh page: sharpened purpose line, #69 notice, box focused) | 65 KB |

No GIF (team rule). The blue top banner is the step caption. The yellow panel on the right is a pass-through fetch spy: for each `POST /api/chat` it prints the message length, line count and history length, then the status and the Send → response time.

Every 20k first turn was nonce'd so it stayed uncached: the thread's header line got the send time (`#booking-split (export at 09:13:36, sanitized: …)`), padded so the paste is still exactly 20,000 characters.

## Demo steps (captioned in video; times approximate)

| Time | Step | What it shows |
|---|---|---|
| 0:00 | – | Intro caption: slice 3 + #69, live URL, gpt-5.6-terra |
| 0:04 | 1 | First visit, no clicks. The purpose line reads "Paste a messy thread or meeting notes. The coach puts the events in order, shows which words each team uses differently, and gives you one question for your expert." The #69 notice has ink text, a border and a blue edge, and ends "Don't paste customer names, rates, lanes or contract terms." Both are outlined |
| 0:08 | 2 | F1 put in through the page (native setter + `input` event). The count reads **20,000 / 24,000 characters** (warn tone), and Send is enabled |
| 0:24 | 2 | Enter → "Coach is thinking…" |
| 0:35 | 2 | Spy: `msg 20,000 ch, 586 lines, hist 0 → 200 in 9.82 s`. The caption gives the latency against the 25 s limit and the 15 s rule |
| 0:45 | 2 | Three parts highlighted: the section heads, the four "Ops (view A)/(view B)" holders and the "Question for …:" lead in yellow, and all 19 "From thread:" labels in blue |
| 1:10 | 2 | The one question: joint roles (ops lead + finance controller) and the forum (27 Oct RFC review) |
| 1:15 | 3 | Follow-up: "Which of those words matters most for invoicing?" Spy: `hist 1 → 200 in 3.39 s`, and the answer builds on the earlier reply |
| 1:40 | 4 | New conversation → Clear (focus + Enter) → F2 `rebook-notes` (2,230 chars, notes that give each view a person's name). Spy: `hist 0 → 200 in 7.06 s`. The reply names no people |
| 2:30 | – | Closing caption |

Take notes: one take, no reload. The F2 step's latency caption didn't update (an eval error in the overlay script), so the video's banner there still reads "4 · New conversation…". The 7.06 s is in the spy panel. The step 2 caption says "587 lines" while the spy counts 586: the file's 587th line is its trailing newline, which was trimmed.

## Acceptance criteria (hosted)

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | 20k paste accepted and answered within 25 s | **PASS** | Video 0:08–0:35: 20,000 / 24,000 → 200 in 9.82 s. Off-video 8.74 s. Deployer 13.35 s |
| 2 | Five more turns fit; 24,001 → 413 | **PARTIAL** (1 follow-up on hosted; 24,001 checked) | Video 1:15: signed follow-up → 200 in 3.39 s (deployer: 3.95 s). `curl` 24,001 chars → **413** "This message is too long…" in 0.41 s. The plan's five follow-ups were swapped for team-lead's single follow-up. The 64k conversation bound is covered by the builder's handler tests |
| 3 | Body math: the platform accepts the size, our cap governs | **PASS** | `curl` with about 390 KB of junk JSON → **400** "Send a message." in 0.87 s (not a Netlify 413) |
| 4 | Reply shape: 1–5 events, words by team with Ops (view A)/(view B) and Code, one "Question for <role>", every claim labelled | **PASS** | `checkReply` hard checks are empty for all three first-turn replies; `slice-03.png` |
| 5 | No people, no jargon | **PASS** | No names in F1 or F2 replies (`checkReply` + grep for Dana/Maya/Tom/Sam/Priya: 0). No aggregate or bounded-context talk |
| 6 | Complete ending within the cap | **PASS** | All replies end on the question's "?", with no cut-short note. The F1 replies are 355 and 403 words |
| 9 | Nothing leaks | **PASS** (deployer) | Deployer: no leaks in the deployed JS, headers present |
| 10 | Sharpened purpose line on first visit | **PASS** | Video 0:04, `slice-03-first-visit.png` |
| 11 | Nothing regressed | **PASS** (spot) | Signed follow-up, New conversation → Clear question → Clear, paste box count all behave as before |
| #69 | Notice has visual weight and the warning line, and isn't hidden before the first send | **PASS** | `slice-03-first-visit.png`: ink text at body size, strong border, blue left edge, sits right under the purpose line, and the warning is verbatim |

AC 7 (prompt server-only, KB slot) and 8 (eval ship bar) are covered by tests and by `outputs/evals/slice-03/summary.md` (v4 on terra: hard 9/9, attribution 9/9).

## Latency: 20k first turn, hosted, gpt-5.6-terra (15 s rule)

| Run | Who | Send → 200 | Notes |
|---|---|---|---|
| 1 | deployer | 13.35 s | `checkReply` hard all pass, soft 9/9 |
| 2 | verifier, on video | 9.82 s | nonce 09:13:36 |
| 3 | verifier, off video | 8.74 s | nonce 09:17:22, the reply in `slice-03.png` |
| **median** | | **9.82 s** | **under 15 s, and max 13.35 s is under 22 s: the rule doesn't fire, and #8 stays where it is** |

Follow-ups (history 1): 3.39 s (video) and 3.95 s (deployer). F2's 2,230-char first turn: 7.06 s. The eval's dev-machine median was 8.1 s (`latency.md`), so hosted is about the same. The deployer's 13.35 s shows the tail is real: one in three is about 13 s.

## Replies

### Step 2: F1 first turn (video), 355 words

```
Events, in order
1. From thread: Customer submits on the portal and Ops starts working the booking.
2. From thread: Ops tenders to a carrier, and the carrier accepts the tender as CARRIER_ACK.
3. From thread: A same-carrier date change can be handled as AMENDED or REBOOKED.
4. From thread: Rebook creates a new row and ref, while the carrier sees the original load cancelled and a new tender.
5. From thread: Proof of delivery makes a load invoiceable.

Words that don't match
"booking"
- From thread: Ops means the customer's portal submission that the desk starts working immediately.
- From thread: Finance means an invoiceable load, after proof of delivery.
- From thread: Carriers mean a load or tender, not a booking.
- From thread: Code treats a rebook as a new booking row, while the customer portal shows the original ref.

"rebook"
- From thread: Ops (view A) means a carrier or lane change creates a new booking.
- From thread: Ops (view B) means night dispatch uses REBOOKED for date changes because AMENDED does not reach the carrier portal.
- From thread: Finance means a new booking with a separate invoice and a voided old one.
- From thread: Carriers mean cancel the original load and send a new tender, which can cause a TONU.

"booking count"
- From thread: Ops means dashboard rows not CANCELLED, including both rows of a rebooked shipment.
- From thread: Finance means invoiceable bookings from the ledger export.
- From thread: Night dispatch means the dashboard count minus rebooks mentally removed.

"hold"
- From thread: Ops (view A) means a booking waiting on the customer.
- From thread: Ops (view B) means the day desk says "waiting on customer" rather than hold.
- From thread: Finance means a credit hold on the account, so nothing ships.

Question for the ops lead and the finance controller, at the tue 27 oct booking-split RFC review: For the Customer B same-carrier date change that was REBOOKED because AMENDED did not sync, should it count as one operational booking, two booking rows, or zero invoiceable bookings until proof of delivery?
```

### Step 3: follow-up "Which of those words matters most for invoicing?"

```
From thread: "rebook" matters most for invoicing, because rebook creates a new booking row and the invoice job treats that row as separately billable. From thread: "booking" is the underlying mismatch, since Finance uses it to mean invoiceable, while Ops uses it from portal submission.
```

### Off-video run 3 (F1), the question only

> Question for the ops lead and the finance controller, at the tue 27 oct booking-split RFC review: For Customer B's same-carrier date change after the truck was already rolling, should it remain one booking for Finance while Ops sends an AMENDED carrier update instead of creating a new REBOOKED row and invoice line?

### Step 4: F2 rebook-notes, excerpt

```
"RB"
- From thread: Ops means a new booking when the lane changes or the carrier changes.
- From thread: Ops means the operationally safe option for a date-only change at night until amend! updates the carrier portal.
- From thread: Finance means a change that creates a new invoice and voids the old one.
…
Question for the ops lead and the finance controller, at the Tue 27 Oct RFC review: For Load 48213's same-carrier, same-lane one-day date change, should the night shift create an AMENDED booking while using a phone call until amend! syncs, so Finance has one invoice even if the carrier charges TONU?
```

## checkReply

`node server/eval/checkReply.ts <fixture> <reply.txt>` on each hosted first turn:

| Reply | Fixture | Hard failures | Soft |
|---|---|---|---|
| Step 2 (video) | booking-split | **none** (exit 0) | 9/9: attribution, split, codeLine, noStaleMeaning, quotedWordsInThread, under400Words, questionSpansThread, jointRoles, forum |
| Run 3 (off video) | booking-split | **none** (exit 0) | 8/9. `under400Words` is false (403 words) |
| Step 4 (F2) | rebook-notes | **none** (exit 0) | 9/9 (split and question checks are vacuous for F2) |
| Deployer run | booking-split | none | 9/9 |

## Findings

Ranked by severity. This is a fresh-eyes read from the ICP's side: Priya, an ops analyst with a messy thread and an RFC review coming up.

1. **Medium: "Ops (view A)/(view B)" isn't stable across words.** In the video reply, view B is night dispatch under "rebook", but under "hold" view A is the night meaning ("waiting on the customer") and view B is the day desk. Priya would read view A as the same group in both places. The "hold" split is also muddled: in the thread (lines 418–427), night says "hold" and day says "waiting on customer" for the *same* meaning. That's two words for one meaning, and the reply draws it as two meanings. The eval's split check only looks at "rebook", so it passes. Candidate prompt fix: "view A/B keep the same group for the whole reply; if a team uses two words for one thing, say so."
2. **Medium: a sub-team shows up as a holder on terra.** "From thread: Night dispatch means the dashboard count minus rebooks…" under "booking count" is exactly the gpt-6-luna failure the eval summary says terra never makes. It isn't caught, because the split soft check only covers "rebook". It happened in 1 of 2 verifier F1 runs (run 3 used "Code" there instead).
3. **Medium: F2 splits Ops without labels.** Under "RB" and "booking", two lines each start "Ops means…" with different meanings and no (view A)/(view B). For Priya that reads as a contradiction. `checkReply` scores F2's split as vacuously true, so the eval can't see it. Consider adding a split key to F2 (day desk vs night shift).
4. **Low: the forum is lower-cased and loose.** "at the tue 27 oct booking-split RFC review" (twice on F1). F2 got "Tue 27 Oct". Cosmetic, but it's the line she'd copy into an invite.
5. **Low: run 3 went over 400 words** (soft `under400Words` false, 403 words). It's still well under the cap with no cut-short note, but it's the longest reply seen.
6. **Latency tail.** The median of 9.82 s is fine, but 13.35 s is within 2 s of the rule. If #58 adds 25–30k tokens of knowledge base to every first turn, re-measure before shipping it. #8 might come due then.
7. **No "Guess:" labels on F1 at all** (19 "From thread:" and 0 "Guess:" on video). That's accurate for this thread, but the demo never shows the Guess path on hosted. The eval covers it (F2 and F3 Code → Guess).

**Is the question one she wouldn't have thought of?** Partly. Priya already knows REBOOKED vs AMENDED is the fight. She said so in 03b, and the coach found it without prompting, which was her own test. What's new is that the question ties the argument to **one concrete load (Customer B's same-carrier date change after the truck was rolling)**. It also makes the two people who disagree answer in terms of *count and invoice*, not the status word. That turns a glossary debate into a decision they can make in the 27 Oct review. The step 2 wording, though, gives three options ("one operational booking, two booking rows, or zero invoiceable bookings until proof of delivery") that mix *when* something is invoiceable with *how many* bookings there are, so the question is less sharp than it looks. Run 3's version is a leading yes/no that proposes the answer (AMENDED + one booking). That's useful, but it's advice dressed as a question. F2's question is the strongest: a real load (48213), a real cost (TONU), and the trade-off between the night shift's safety and Finance's one-invoice rule.

The follow-up passes the memory test. It picks "rebook" for invoicing and explains why from the earlier reply (a new row that the invoice job bills separately). It also names "booking" as the root mismatch, which is the right answer.

## Deployer checks (hosted; cited, not repeated)

- The page and the #69 notice.
- A 20k first turn → 200 in 13.35 s, with `checkReply` passing every hard check and 9/9 soft scores.
- A signed follow-up in 3.95 s.
- No leaks; security headers present.

## Tooling notes

- Each command ran under `timeout 60` after `agent-browser --session verifier close`; no screenshot hangs.
- `eval` shares one global scope across calls, so a second top-level `const p` throws. Wrap overlay code in `{ … }`. That's what dropped the step 4 caption.
- The CSS Custom Highlight API (`::highlight`) marks words inside the reply's single `<p>` without changing the DOM, which made step 2's highlighting cheap.
- The recorder is 1280×578 whatever the viewport. The full reply is about 1,220 px tall at 100%, so `slice-03.png` uses a 55% page zoom to show all three parts at 1280×800.
- Model spend for this demo: four terra calls (three first turns and one follow-up), about $0.07 at the eval's per-call cost.
