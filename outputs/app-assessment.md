# DDD Coach — seven-angle assessment

Reviewed 2026-09-24 (America/Denver). This is a snapshot of the current app, the proposed product, and the available evidence. Recheck it as slices land.

## Verdict and evidence boundary

The current app is a working AI connection test with same-page, multi-turn memory. The proposed DDD coach is promising but unproven. The shared board, DDD facilitation, source ingestion, persistence, export, and voice interaction are not implemented in `src/` or `server/` at this review. The interactive roadmap is a plan; `../docs/ddd-coach/index.html` is a record of the agent-team process and slice demos, not the product UI.

Evidence: [`src/App.tsx`](../src/App.tsx), [`server/openRouterCoach.ts`](../server/openRouterCoach.ts), [slice 2 demo](demos/slice-02.md), [product direction](generative-coach-direction.md), [roadmap](ddd-coach-plan.html), and [design exploration](design/explore-01/untangle-v2.html). The demo records real local provider replies. I did not verify a hosted deployment or run a fresh paid provider call. `bin/check.sh` passed; `npm test -- --reporter=dot` reported 82 passed, 2 skipped during this assessment. Scores judge **today's app**, not the planned experience.

| Angle | Score | Judgment and evidence |
| --- | ---: | --- |
| Product value | 2/5 | The first useful outcome is a workflow, exception, and shared vocabulary ([roadmap](ddd-coach-plan.html)). Today the user can only send text and read replies ([app](../src/App.tsx), [screen](demos/slice-02.png)). No distinctive deliverable leaves the session. |
| Learning effectiveness | 1/5 | The adapter sends prior user/assistant turns without a coaching or Eazy Freight briefing ([adapter](../server/openRouterCoach.ts)). A model may answer a DDD question, but the app does not yet scaffold discovery or check understanding. |
| DDD rigor | 2/5 | The [direction](generative-coach-direction.md) correctly separates event exploration, rules, tentative boundaries, and open questions. No board facts, sources, uncertainty states, correction actions, or domain-question policy exist in the running app. |
| UX and accessibility | 2/5 | The log, pending text, inline alert, retry, and labeled input are useful ([UI](../src/ui/ConnectionTest.tsx), [outcome](../src/ui/ExchangeOutcome.tsx)). The first screen does not say what domain material to bring or what the user will produce. The visual design remains a deliberately plain connection test. |
| Architecture | 4/5 | Pure exchange/conversation functions, a browser API client, request parsing, handler, and provider adapter have separate responsibilities ([domain](../src/domain/), [server](../server/)). This is a good base for typed board operations, but those operations have not been implemented. |
| Reliability | 3/5 | The [demo](demos/slice-02.md) proves turn recall, failure display, and retry. State lives in React memory ([hook](../src/ui/useExchanges.ts)); reload erases work. The server rejects conversations above 50 turns or 24,000 characters ([parser](../server/chatRequest.ts)). Current 413 handling disables retry, but offers no way to retain or shorten the session. A 600-token reply can end mid-sentence, as the demo shows. |
| Security and operations | 2/5 | The API key is read on the server ([function](../netlify/functions/chat.mts)); request shape and size are checked. The chat handler has no authentication or rate limiting ([handler](../server/chatHandler.ts)), so public deployment needs a deliberate cost-abuse decision. The UI does not tell users where their text is sent. Provider-policy and retention claims must be verified before making them. |

## What is promising

The smallest convincing interaction is already described: a visitor says the carrier rejected a booking; the coach adds one event, asks what happened next, and updates that same card when corrected ([direction](generative-coach-direction.md)). The [design exploration](design/explore-01/untangle-v2.html) extends this to conflicting terms, events marked as sourced or guessed, and three concrete questions for a domain expert. It is a concept, not shipped behavior.

The [synthetic interviews](market-research/README.md) suggest that messy pasted material, a session that survives return visits, and export into existing documents may matter more than a voice-first experience. They are hypotheses from a fictional persona; they cannot validate demand, price, accessibility, or an enterprise's actual AI policy. Do not promote those claims as customer evidence without real practitioners.

## Recommended product test

1. Prove one complete job with a real practitioner: supply messy domain material, identify two conflicting meanings, place a few tentative events, correct one, and leave with three concrete questions plus a reusable export. Record what they actually reuse a week later. This is a proposed evaluation, not a change to the approved slice order.
2. Before asking users to invest work in a board, specify recovery across reload and a path through the conversation limit. Show which statements came from supplied material, which came from the visitor, and which are coach guesses.
3. Keep text/paste available while testing voice in realistic work settings. Decide whether removing the composer improves the tested job before implementing slice 12 as written.
4. Before a public preview, state the data flow in the UI and review the endpoint's cost controls. Do not imply that an honest notice makes an unapproved provider acceptable under a visitor's company policy.

The most important success measure is whether someone can use the output to ask a better question of a domain expert and accurately revise the model afterward. Message count, board size, and demo polish do not establish that outcome.
