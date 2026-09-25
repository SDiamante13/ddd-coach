# Slice 77 (#77): group-named views, a question with a case, and no "should" rulings

The spec is issue #77's body (rewritten from interview 07). This plan adds the approach, the order and the spend. It follows #78's ship rule (`outputs/evals/slice-03/summary.md`, "Ship rule (#78)").

## #77 approach

**Check changes first, one commit each. After each, re-score `ab-2026-09-25-openai-gpt-5-6-terra-v6-v8.json` (d1121c0) at $0 and record how the verdict moves.**

1. **`no boilerplate` catches the self-introductions it missed.** Sentence-initial "I help you…" and "I'm for <verb>ing…" (v6 greeting r6, one-line-note r1 and r6). "I'll help identify…" stays allowed. Expect v6's target to fall from 3/18 to 0/18, with the verdict unchanged.
2. **`jointRoles` is not scored on non-thread fixtures.** They have no question, so the always-0/6 rows go. Reported only, so the verdict is unchanged.
3. **`question asks` fails a "should" ruling.** A clause that starts with "should" ("…, should the working item remain one booking … or become…") fails. "Which count should include X, Y or neither?" still passes, because the clause opens with "which". Calibrated on the 48 recorded thread questions, it hits v8 F1 5/6, v8 example 3/6, v8 F2 1/6, v6 F1 1/6 and v6 example 1/6. **Expected verdict move: v8 against v6 flips to no-ship** (F1 question asks 5/6 → 1/6). That's the regression interview 07 saw, now measured.
4. **New hard check: `question names a case`.** The question text names a load ID (3+ digits), a "Customer X" or a message time (H:MM). Thread fixtures only. On the recorded replies it passes 48/48, so it's a guard that keeps v9 from dropping the case.
5. **Views may be named by group, the check side of U2 (make the change easy).** `holderOf` accepts "Ops (night shift) means" as a view labelled "night shift", next to "(view A)". Stable views, split labels and the `split` soft score work on either label. A bare "Ops night shift means" still fails holders. The re-score must be unchanged, because no recorded reply uses names.

**Then the prompt, v9 (one change set, U2 plus the question):**
- views labelled with the group's name from the thread, e.g. "Ops (night shift)" and "Ops (day desk)", instead of "(view A)"/"(view B)". The same group keeps the same name under every word.
- the question opens with what, which, who or how, never "should", and names the load, customer or message time.
- **A/B:** `npm run eval -- --ab 9 --live 8 --target booking-split:question asks,example-thread:question asks,rebook-notes:split labels` (n=6, 84 calls, about $0.34). The target is named before the run.
- **Budget cap:** $1.50 for the slice, so at most two A/B runs (v9, and one v10 if v9 misses).
- **If it ships:** commit the prompt, bump `LIVE_INSTRUCTIONS_VERSION` to 9 and record it in `summary.md`.
- **If it doesn't:** revert `coachInstructions` to v8, keep the v9 snapshot and result as a record, and escalate.
- F1 reply length (under400Words, v8 0/6) is reported every run but doesn't gate.

**Out of scope:**
- the hosted F2 3/3 check (deployer, after a ship);
- the split-labels extension for a merged or dropped group (interview 07 follow-up, not in #77's acceptance);
- #76's same-meaning check.

**Open for team-lead:** step 3 makes the rule call v8 a regression against v6. v8 stays live under U5 (no auto-rollback), and v9 is the fix.
