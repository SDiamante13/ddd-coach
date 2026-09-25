# DDD Coach — session handoff

## Read this first

Planning and research are complete enough to begin slice 1. No application, SDK integration, deployment, or development hook has been implemented. Do not mistake the interactive HTML plan for the running product.

Workspace: `/Users/stevendiamante/Documents/Codex/2026-09-24/ddd-coach-ai-vocal-modal-asks`.

## Latest decisions override earlier drafts

- Build a web app for developers new to DDD. First useful outcome: one business workflow, a key exception, and shared vocabulary.
- **Generative UI is central:** the coach builds diagrams and stickies while facilitating. It chooses EventStorming, Example Mapping, or other techniques when useful. The original generated chat mockup is superseded.
- Keep the board stable, make small visible changes, and support corrections and undo. Do not regenerate unrelated screens after each turn.
- Text input is allowed in early technical slices. Voice becomes the default; the final voice experience has no conversational text composer.
- Closed captions default on with an easy CC toggle. Full transcript history is optional and closed by default. Transcript capture timing and retention remain open.
- One screen; minimal onboarding, few windows, and automatic routine actions. File and GitHub context attachments remain available with voice.
- Optional application guardrails default off. This does not disable server credential handling or basic application correctness.
- Use the official OpenRouter TypeScript SDK, `@openrouter/sdk`, on the server. Configure `OPENROUTER_API_KEY` and `OPENROUTER_MODEL` through local `.env` and hosted environment values.
- `.env`, `.env.example`, and `.gitignore` exist. Both OpenRouter values were empty at handoff. Never ask for the secret in chat.
- Keep styling basic. Three.js/GSAP polish is deferred.
- Apply DDD during development. The requested DDD analysis-quality sensor is **development-only**, not a live coaching gate.
- Keep a separate backlog and promote candidates into small slices deliberately.

## Build order

1. One input → one real AI reply in a log; pending state, inline failure, retry without duplicating the user's message. This is a connection test, not the intended product layout.
2. Maintain context across turns in the current session.
2a. Publish the working app and server endpoint to **Sites or the user's Netlify**. Choose the provider during implementation. Verify a real two-turn exchange and failure/retry on the hosted URL. Keep `.env` out of the bundle.
3. Apply DDD coaching behavior and the briefed Eazy Freight example.
4. First shared board, split into separately demonstrable increments: 4a event sticky; 4b correction and undo; 4c connection; 4d open question.
5. Bring in Katacombs structural, behavioral, and design sensors. Add the separate domain-analysis charter incrementally. Prove hooks actually fire before calling them installed.
6–13. Progressively add speech output, microphone input, spoken exchange, turn detection, continuous listening, interruption, voice-default UI, and a useful ending state.

The HTML plan uses stable IDs: `1, 2, 2a, 3 … 13`. Do not renumber sensor references accidentally. First-time deployment is intentionally early.

## Domain context and research

Start the coach with a short Eazy Freight briefing, then ask about gaps and exceptions. This was explicitly chosen over discovering everything from scratch.

- Repository: `/Users/stevendiamante/personal/eazy-freight`.
- Supplied explanation: `/Users/stevendiamante/explanations/2026-09-24-explanation-eazy-freight-shipment-trace.html`.
- The user's original `../eazy-freight` did not resolve relative to this workspace; the repository above was located and inspected.
- First bounded exercise: booking request → carrier submission → carrier confirmation → customer confirmation. Exception: rejection → resubmission. Carrier confirmation and customer confirmation are distinct in the inspected source.
- Repository behavior is evidence of implementation, not proof of intended business policy. Actor assignments and other missing facts remain questions.
- Sensor source: `/Users/stevendiamante/personal/katacombs-kata-ts`. Read its `INSTALL.md` before implementing the transfer; the earlier inspection covered README, SENSORS, trigger notes, hooks, and design-review machinery.
- Research agent produced seven original author/publisher resources. Start with Khononov, Evans's free reference, and Brandolini. Commercial books were not read in full. Keep DDD, EventStorming, Example Mapping, and Event Modeling distinct.

## Open choices — resolve when needed

**Before a real slice 1 smoke test:** select an OpenRouter model and set the API key locally. Select the application checkout/repository and a minimal server-capable stack. No framework has been chosen; TypeScript is the natural fit for the selected SDK and sensor source.

**At slice 2a:** choose Sites or the exact Netlify project/account and the intended preview audience. Hosting must run the server-side provider endpoint, not just static assets.

**Before board behavior:** clarify how a visitor correction revises the working model, and how tentative claims remain distinguishable without confirmation dialogs for every edit.

**Before voice/transcript work:** choose speech services, browser target, and transcript capture/retention behavior. A saved transcript is separate from transient captions and the speech processing needed for voice.

None of these requires reopening the agreed audience, generative UI direction, or initial workflow outcome.

## Artifacts

- [Interactive plan](ddd-coach-plan.html)
- [Generative UI direction](generative-coach-direction.md)
- [Separate backlog](ddd-coach-backlog.md)
- [DDD research](ddd-research.md)
- [Initial domain analysis](ddd-domain-analysis.md)
- [Development sensor contract](ddd-analysis-sensor.md)
- [Historical manual review](ddd-analysis-review.md) — explicitly stale after the generative UI revision; not a current hook receipt.

The plan's JavaScript parses and its local artifact links resolve. Earlier browser checks covered navigation and controls; later document edits have not received a full fresh visual review. No real API call has been made.

## Next-session starting prompt

“Read outputs/SESSION-HANDOFF.md and the current plan. Begin implementing slice 1 only. Keep the app ready to become the generative board described in the plan without building later slices early. Use the OpenRouter SDK with server-side environment configuration. Apply DDD proportionally to this slice; do not invent aggregates or microservices. Ask only for unresolved information that blocks the work.”

## Working preferences

Start replies with ☀️. Keep communication concise. Use small expressive functions, keep responsibilities separate, and use strong types. For integrations, first make any necessary behavior-preserving structural change separately, then add the integration. Use agent-browser for browser automation. Subagents were explicitly requested for DDD research; do not infer blanket authorization to create unrelated agents. Keep generated deliverables in `outputs/` and intermediate work in `work/`.
