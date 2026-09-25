# DDD Coach

An AI coach that teaches Domain-Driven Design and helps you work through real DDD problems. It starts from a short briefing on Eazy Freight, a freight-booking example domain, then asks about gaps and exceptions. Later slices add a shared generative modeling board and voice as the default way to talk to the coach.

## Status

Early. Slice 1 (connection test) is built and demoed, slice 1b (hardening) is committed, and slice 2 (multi-turn conversation) is in progress. See `git log` and `outputs/ddd-coach-plan.html` for the roadmap.

## Prerequisites

- Node.js and npm
- An OpenRouter API key
- `netlify-cli` is a devDependency, so no global install is needed

## Setup

```sh
npm install
cp .env.example .env
```

Edit `.env` and set:

- `OPENROUTER_API_KEY` — your OpenRouter key
- `OPENROUTER_MODEL` — an OpenRouter model ID in `provider/model` format
- `COACH_TIMEOUT_MS` — optional server deadline for a reply (defaults to 25000)

`.env` is git-ignored. Keys are read only on the server.

## Run

```sh
npm run dev
```

Opens Netlify Dev on http://localhost:8888, which serves the Vite app (port 5180) and the `/api/chat` function.

## Test

```sh
npm test            # Vitest
npm run typecheck   # tsc --noEmit
npm run build       # production build to dist/
bin/check.sh        # all three; prints output only on failure
```

The OpenRouter smoke test runs only when `OPENROUTER_API_KEY` and `OPENROUTER_MODEL` are exported in your shell.

## Layout

```
src/        React client: domain, api, shared, ui, test
server/     chat handler, config, OpenRouter coach
netlify/    Netlify Function entry point
outputs/    plans, backlog, DDD research, demos
bin/        check script
```

## For agents

Start with [AGENTS.md](AGENTS.md).
