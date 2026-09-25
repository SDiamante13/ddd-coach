# AGENTS.md — repo map

A map of where things live. Rules and guidelines live in the files it points to.

## Product & planning
- `outputs/SESSION-HANDOFF.md` — orientation and latest decisions
- `outputs/ddd-coach-plan.html` — interactive roadmap; stable slice IDs `1, 2, 2a, 3 … 13`
- `outputs/generative-coach-direction.md` — shared modeling board and voice direction
- `outputs/app-assessment.md` — seven-angle snapshot of the app, evidence limits, and proposed product test
- Backlog: [GitHub Issues](https://github.com/SDiamante13/ddd-coach/issues), owned by the product-owner session; `outputs/ddd-coach-backlog.md` holds the pointer, product direction and promotion rule
- `outputs/slice-*-plan.md` — per-slice plans (acceptance criteria, test order, demo script); issue-driven slices use the issue number, e.g. `slice-37-plan.md`

## Decisions
- No ADR directory yet.
- Decisions live in the slice plans: "Stack decision" (slice 01), "Design notes" (slice 01b), "Decisions" (slice 02).

## Team & workflow
- `outputs/agent-team.md` — archetypes, slice loop, demo recording, screenshot rules
- User-level skills used by the loop (in `~/.claude/skills`): `tdd`, `sweep`, `commit`, `agent-browser`, `story-planner`

## Domain / DDD references
- `outputs/ddd-research.md` — DDD research
- `outputs/ddd-domain-analysis.md` — domain analysis
- `outputs/ddd-analysis-sensor.md` — dev-only DDD analysis sensor
- `outputs/ddd-analysis-review.md` — review of the analysis (stale)

## Demos
- `outputs/demos/` — `slice-NN.mp4`, `.gif`, `.md` report, `.png` screenshots

## Code
- `src/domain/` — exchange and conversation types and pure rules
- `src/api/` — `askCoach` browser client for `/api/chat`
- `src/shared/` — chat contract and JSON helpers shared by client and server
- `src/ui/` — React components and the `useExchanges` hook
- `src/styles/` — live design tokens and base styles (source of truth; the copies in `outputs/design/` are the handoff record, so don't copy them back over)
- `src/acceptance/` — app-level tests, one file per feature, driving `<App />` through the browser surface
- `src/test/` — Vitest setup, fetch stub and `appDriver` (render and converse helpers for acceptance tests)
- `src/App.tsx`, `src/main.tsx` — app shell and entry
- `server/` — chat handler, config, deadline, `Coach` port and OpenRouter adapter
- `netlify/functions/chat.mts` — Netlify Function wiring config and coach into the handler
- `bin/check.sh` — runs test, typecheck and build; prints output only on failure
- `work/` — one-off plan-editing scripts

## Commands
- `npm run dev` — `netlify dev` on :8888, proxying Vite on :5180
- `npm test` — Vitest (smoke test runs only when OpenRouter vars are in the environment)
- `npm run typecheck` — `tsc --noEmit`
- `npm run build` — Vite build to `dist/`
- `bin/check.sh` — full pre-commit gate

## Hard constraints (details in the docs above)
- Never print `.env`; `.env.example` lists the variable names. Only the deployer reads it, via the redacted env flow in `outputs/slice-02a-plan.md`.
- Secrets stay server-side (`server/`, `netlify/functions/`), never in `src/`.
- Commits go through the committer agent.
