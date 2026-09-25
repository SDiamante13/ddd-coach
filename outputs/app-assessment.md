# DDD Coach — seven-angle assessment

Reviewed 2026-09-25 (America/Denver). This replaces the 2026-09-24 assessment. It distinguishes the deployed product from the workspace because the access gate is committed locally but its Netlify functions are uncommitted and not deployed.

## Verdict and evidence boundary

DDD Coach is now a real, hosted, paste-first DDD coaching prototype. It can accept a 24,000-character thread, preserve line breaks, provide a deliberately structured plain-text response, retain same-page context, let a visitor copy or clear a conversation, and recover a refused prompt into the composer. The coaching instruction set is evaluated against fixtures and paid model runs. The first distinctive product job is now present: turn messy material into disagreements, ordered events, and one question for an expert.

It is not yet a reliable shared modeling workspace. There is no persistent session, source ingestion beyond pasted text, structured renderer, board, correction/undo, export artifact, or voice interaction. Most importantly, its question quality varies between runs and a consistent-looking attribution error can be copied into a design document.

Evidence: [production URL](https://ddd-coach.netlify.app), [slice 3 demo](demos/slice-03.md), [model evaluation](evals/slice-03/summary.md), [coach instructions](../server/coachInstructions.ts), [current app](../src/App.tsx), and [latest synthetic interview](market-research/interviews/interview-06-after-slice-03.md). I checked the production page in a clean browser session on 2026-09-25: it showed the purpose and data-flow notice, focused composer, 24,000-character cap, no page errors, and no horizontal overflow at 390 px. I did not submit real private material or run a paid model call during this review. Synthetic interviews remain hypotheses, not customer evidence.

| Angle | Score | Judgment and evidence |
| --- | ---: | --- |
| Product value | 3/5 | The product now targets a concrete job: paste a thread or notes, expose differing meanings and event order, then get a question for an expert ([purpose line](../src/ui/PurposeLine.tsx), [slice 3 demo](demos/slice-03.md)). The 12k-thread demo found a tender-ID question spanning distant material, which is a meaningful result. A second run instead proposed an answer to a familiar disagreement, so value is not dependable yet ([interview evidence](market-research/interviews/interview-06-after-slice-03.md)). |
| Learning effectiveness | 2/5 | Instructions teach a useful move: ask about one real case rather than the general rule ([instructions](../server/coachInstructions.ts)). The interview records unprompted reuse of the real-case move, but it predates the product and the newer move did not persist. The app does not yet make a learner explain, correct, or apply the model. |
| DDD rigor | 3/5 | The model is constrained to distinguish sourced material from guesses, show disagreements, order events, and ask one question drawing on distant evidence. The production model passed the current fixture ship bar 9/9 across three runs ([evaluation](evals/slice-03/summary.md)). The bar does not prove stable attribution for every term; a view A/B swap passed the bar and was copied into a synthetic RFC draft ([#73 watch item](market-research/interviews/interview-06-after-slice-03.md)). |
| UX and accessibility | 3/5 | The styled composer has a visible purpose, plain language data warning, multiline paste, character feedback, collapse/expand, retry, copy, and an explicit clear confirmation ([slice 50 demo](demos/slice-50.md)). The reviewer confirmed no horizontal overflow at 390 px. Long drafts can consume roughly half the viewport and new refusal actions can sit behind the docked composer until focus or scrolling brings them up; screen-reader behavior for the live alert is untested. |
| Architecture | 4/5 | Browser UI, pure exchange/conversation rules, server request parsing, prompt construction, signed prior turns, and provider adapter remain separate ([source map](../AGENTS.md), [chat handler](../server/chatHandler.ts)). Signed assistant turns remove the earlier client-forged-history issue. The boundary is ready for typed board actions, but the current output is still an unstructured string. |
| Reliability | 3/5 | Hosted demos cover real replies, retry, 24k input, line preservation, capacity refusal, copy/reset, and conversation signatures. A completion truncated by the provider is trimmed to a complete line ([adapter](../server/openRouterCoach.ts)). Sessions disappear on reload; clearing does not preserve the last pasted source; no automated continuation or session summary exists. Quality variance across equivalent runs remains the practical reliability risk. |
| Security and operations | 2/5 | Production uses server-side credentials, security headers, Netlify chat rate limits, request-size validation, and signed history ([chat function](../netlify/functions/chat.mts), [slice 42 hosted checks](demos/slice-42.md)). The live data notice names OpenRouter and warns against sensitive material, but does not identify the actual provider, retention, training use, operator, or a security page. Production currently has no `/api/session` or `/api/unlock` route; direct `POST /api/chat` returned 200 on 2026-09-25. The in-progress conference gate must also enforce access in the chat handler, because its current handler accepts requests without checking the access cookie ([handler](../server/chatHandler.ts)). |

## Current decision record

### What the product has proved

- A real thread can yield a question a practitioner did not think to ask, drawing from an early invoice detail and a later carrier-system detail.
- The chosen production model, `openai/gpt-5.6-terra`, met the current instruction/evaluation bar; cheaper tested models did not.
- Paste-first interaction, character limits, copy/reset recovery, and visible data-flow warning are a stronger entry point than the earlier generic chat field.

### What remains unproved or unsafe to claim

- The coach reliably asks a non-leading question on the first run.
- The output's attribution and view labels are safe to paste into a design document.
- A user can return after an expert conversation without re-pasting work.
- The notice satisfies a practitioner's organizational AI policy.
- The conference password blocks direct provider use or spend.
- Voice should replace text/paste for this job.

## Prioritized next decisions

1. **Fix and measure output reliability before expanding the surface.** Add an evaluation that rejects leading questions and checks every split term for stable source/view assignment across real repeated replies. The current bar can pass while a plausible attribution error remains.
2. **Treat the access gate as incomplete until chat is authorized server-side.** Require a valid access pass before the chat handler creates a coach; deploy and verify `/api/session`, `/api/unlock`, and an unauthorized `/api/chat` response. The UI gate alone does not control the paid endpoint.
3. **Test the core job with a real practitioner.** The test is: paste a real sanitized thread, use the question in an expert conversation, then return to revise the output. Measure whether the question was useful and whether the visitor could find and correct an attribution error.
4. **Define persistence and export around that return visit.** Preserve the original source and current model locally before adding a board. A structured renderer or export should retain source/view labels, question status, and user corrections.
5. **Publish an operator-owned data page before asking for less-sanitized material.** It needs actual routing/provider, retention, training policy, operating entity, and a link suitable for a security review. Keep the in-product warning concise and accurate.

The next meaningful proof is not a bigger board or a voice loop. It is a stable, attributable question that a real practitioner uses successfully with an expert and can revisit afterward.
