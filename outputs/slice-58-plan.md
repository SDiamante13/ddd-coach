# Slice 58 (#58): ground the coach in the DDD Reference (v1: Reference only)

The spec is issue #58's body and comments. #80's spike measured the Reference at about 14.3k tokens (o200k), listed its 54 section titles and prepared the attribution text. The source is `work/ddd-reference-2015.txt` (CC BY 4.0, with its attribution header).

In one line: prompt v12 carries the whole DDD Reference as a stable part of the system prompt. On a general DDD question the coach paraphrases it and cites the section, with a title that must exist word for word. When the Reference doesn't cover the question, the coach says so. Citations show in replies but are never copied. A #78 A/B against v11 proves the grounding doesn't cost the question or the analysis.

## Goal fit
- **ICP trust killers:** "hallucinated DDD rules" and confident generic answers. Grounding plus verbatim citations she can spot-check (04b, 05: "I can't spot-check what I can't see") address both.
- **Scope:** Evans backs definitions only. Claims about her own system keep citing her thread ("From thread:"), never a book.
- **DDD proportionality:** one server-side text module, a prompt version and three eval checks. No vectors and no tool calls.

## Verified facts (main at `8522f16`)
- **The hook already exists.** `coachInstructions(reference?)` inserts `<reference>…</reference>` between the material stance and the reply rules (`server/coachInstructions.ts:75–82`). `chat.mts` calls it with no reference today.
- **The whole system message is static per version,** so it's one cacheable prefix: KB plus rules, about 16.8k tokens.
- **Terra prices, from the recorded v10/v11 calls:**
  - input $2.50/M uncached and about $0.20/M cached;
  - output about $12/M;
  - F1 costs $0.026 uncached and $0.008 cached.
- **The KB adds about 14.3k input tokens per call:**
  - **+$0.036 uncached, +$0.003 cached.**
  - A cached F1 exchange goes from about $0.008 to about $0.011, well under the #58 fallback bar of $0.03.
  - The cache is shared across visitors while it's warm, because the prefix is identical.
- **Latency:**
  - v11 terra: median 3.3 s, max 17.6 s (one outlier) across the A/B.
  - The server deadline is 25 s. #58's hosted bar is a 20k paste plus the KB within 15 s, and TTFT is to stay under 10 s.
  - The eval records `ms`, `promptTokens` and `cachedTokens` per call.
- **Existing checks:**
  - `no jargon` bans "bounded context"/"aggregate" in thread replies, which is right: thread analysis stays in her words.
  - Non-thread fixtures don't run it.
- **The Reference's titles** carry ` *` markers ("Domain Events *", meaning a new term). The verbatim title is the text without the marker.

## Decisions
- **D1. The KB lives server-side as a module (U1).**
  - `server/knowledge/dddReference.ts` exports `DDD_REFERENCE`, the file's exact text, generated once from `work/ddd-reference-2015.txt` by `server/knowledge/build.ts`.
  - A test asserts the module equals the file, byte for byte.
  - Being a TS module, it bundles into the Netlify Function with no `included_files` or runtime fs.
  - A test asserts `dist/` holds no KB sentence, so the text never reaches the client bundle.
- **D2. Section titles** come from `server/knowledge/sections.ts`: `referenceTitles(text)` parses the Contents list (dot leaders, page numbers and ` *` stripped), giving the 54 verbatim titles. A test pins the count and a sample.
- **D3. Prompt v12 = v11 + the reference block + a grounding rule (U3, U4).** In "Follow-ups" and "Messages that aren't material":
  > When you explain a general DDD idea, base it on the reference and end that answer with one line `Source: Evans, Domain-Driven Design Reference (2015), "<section title>".`, using a section title exactly as it appears in the reference. Cite nothing for claims about the visitor's own material, which keep "From thread:" / "Guess:". If the reference doesn't cover the question, say "The sources I have don't cover this." and then only what's general practice, labelled as such, with no Source line.

  The three-part thread reply is unchanged: no citations and no jargon. `chat.mts` passes `DDD_REFERENCE`, and the eval's `instructionsOf(12)` reads the v12 snapshot, which includes the reference, so the A/B sends exactly what production sends.
- **D4. Citation display and copies (U5).**
  - The reply parser gains a `citation` block for `Source: Evans, …` lines, rendered as a small "Source" line under the answer.
  - **Never copied:** the #6 export already drops non-analysis blocks, and **Copy the conversation strips citation lines** ("never in anything copied", 05).
  - Attribution: a quiet app footer, "The coach draws on Eric Evans, Domain-Driven Design Reference (2015), CC BY 4.0", with the licence link (U6).
- **D5. Eval checks** (`server/eval`).
  - **`citations verbatim`** (gating, every fixture): every `Source: … "<title>"` line names a title in `referenceTitles`.
  - **`cites the reference`** (gating, fixtures with `expect.cites: ["Bounded Context"]`): at least one citation, naming an expected title.
  - **`admits not covered`** (gating, fixtures with `expect.notCovered`): the reply says the sources don't cover it (`/sources I have don't cover|reference doesn't cover/i`) and has no Source line.
  - **New non-thread fixtures:**
    - `ddd-bounded-context`: "What's a bounded context?", which cites "Bounded Context";
    - `not-covered`: "How do I run an Event Storming workshop?". Event Storming appears 0 times in the Reference.
- **D6. Latency and cost are recorded.**
  - The A/B summary gains per-arm median and max ms plus cached-token share.
  - A 5-turn cached session check (#58 comment) runs once in the hosted demo.
  - Fallback bar (#58): switch to the table-of-contents plus tool fallback if cached cost is above $0.03 per exchange or TTFT is above 10 s.

## A/B and budget (#78 rule)
```
OPENROUTER_MODEL=openai/gpt-5.6-terra OPENROUTER_REASONING_EFFORT=none npm run eval -- --ab 12 --live 11 \
  --target "ddd-bounded-context:cites the reference,not-covered:admits not covered"
```
- **Scope:** 9 fixtures × 6 × 2 = 108 calls.
- **Estimate:**
  - the live arm is about $0.19;
  - the candidate is about $0.19 plus the KB, i.e. one uncached prefix ($0.04) plus about 53 cached prefixes (53 × $0.0034 ≈ $0.18);
  - **about $0.60 total.**
- **Cap: $1.50**, i.e. at most two runs (v12, plus one v13 if a fixable drop blocks).
- **Expected target:** 0/12 to about 12/12, since v11 never cites and never uses the fixed not-covered phrase.
- **Gating:** everything else must hold within one run: `question asks`, `question names a case`, `question sources`, `split labels` and friends. That's the "grounding doesn't regress the question" requirement.
- **Watch items:** F1 length and latency (median and max per arm).

## Acceptance criteria
1. "What's a bounded context?" gets a paraphrase that ends with `Source: Evans, Domain-Driven Design Reference (2015), "Bounded Context".` The title is checked against the extracted text, and the reply invents no rules.
2. "How do I run an Event Storming workshop?" gets "The sources I have don't cover this." with no Source line.
3. Thread replies are unchanged in shape: no citations and no jargon. The A/B shows no gating drop over one run.
4. Citations show in the reply as a "Source" line. The #6 RFC copy and Copy the conversation contain none.
5. The KB text is absent from `dist/`. `server/knowledge/dddReference.ts` equals the source file.
6. The app shows the CC BY 4.0 attribution.
7. The A/B records cost per arm, cached-token share, and median and max ms. The hosted demo records a 20k paste plus the KB replying within 15 s, and a 5-turn session's cache hits and cost per exchange.
8. `bin/check.sh` is green.

## Test order
1. `r`: move the text to `server/knowledge/`, with the generated module and the equality test. `chat.mts` is still without a reference, so there's no behaviour change.
2. `referenceTitles`, pure: count, a sample, and the ` *` stripping.
3. Checks, one at a time: `citations verbatim`, then `cites the reference`, then `admits not covered`. Then the new fixtures. Then a $0 re-score of the v10–v11 A/B (the new fixtures aren't in it, and the existing replies have no Source lines, so the verdict is unchanged).
4. The A/B summary's per-arm latency and cache share.
5. Prompt v12: content assertions (red), then the prompt. `chat.mts` passes `DDD_REFERENCE`. The snapshot is written.
6. UI:
   - the `citation` block and its "Source" line (acceptance);
   - Copy the conversation strips citations;
   - the #6 export has none (a guard);
   - the footer attribution.
7. The dist guard: build, then grep `dist/` for a KB sentence.
8. The paid A/B, then record it. If it ships, commit the prompt, set `LIVE_INSTRUCTIONS_VERSION` to 12 and hand off to deploy.

## Demo (verifier, hosted, about $0.10)
1. "What's a bounded context?": a paraphrase plus the Source line. Open the Reference to "Bounded Context" to show the title matches.
2. "How do I run an Event Storming workshop?": "The sources I have don't cover this."
3. Try an example thread: the three parts, no citation, question card as before.
4. A 5-turn session: record `cached_tokens`, cost and TTFT per turn.
5. A 20k paste within 15 s.
6. Copy the conversation and Copy for your RFC: no "Source:" lines.

## Out of scope
- DDD-Crew repos and paid books (#59).
- The table-of-contents fallback (only if the bar fails).
- Technique names and the "why" panel (Exploration 05b).
- Streaming (#8).

## Decisions (recommended defaults marked)
- **U1: where the KB lives.** **Recommended: a generated TS module under `server/knowledge/`**, bundled into the Function, with an equality test against the text file. The alternatives are Netlify `included_files` plus `fs` at runtime (a second path to get wrong) or a separate blob store (overkill for 77 kB).
- **U2: caching.** **Recommended: rely on provider prefix caching.** The whole system message is static per version, so it's one shared prefix, and no cache-control plumbing is needed (OpenAI-family prompt caching is automatic above 1,024 tokens). Measure the cached share in the A/B and the demo.
- **U3: the citation format.** **Recommended: one line, `Source: Evans, Domain-Driven Design Reference (2015), "<exact section title>".`, at the end of a general DDD answer.** It's easy to verify, easy to parse and easy to strip. The alternative is inline brackets, which are harder to check and harder to strip from copies.
- **U4: the not-covered wording.** **Recommended: the fixed sentence "The sources I have don't cover this."**, then optional general practice, labelled. The alternative is free wording, which is harder to check and invites soft hallucination.
- **U5: Copy the conversation.** **Recommended: strip Source lines**, since 05 said "never in anything copied". The alternative keeps them, since it's her undo copy, not an export.
- **U6: attribution.** **Recommended: a one-line app footer with the licence link**, plus the header kept at the top of the KB in the prompt. The alternative is an About page.
- **U7: budget cap.** **Recommended: $1.50** for the slice's paid runs (about $0.60 per A/B), plus about $0.10 for the hosted demo.
