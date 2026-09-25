# DDD Coach — agent team archetypes

Candidates for `.claude/agents/*.md` definitions. Not yet installed.

## Slice loop

pathfinder plan → builder test + code → `feat` commit → sweeper ACN refactor commits → verifier check + demo recording → **stop: demo + status report** → user approval → next slice.

One working tree; agents run sequentially so builder and sweeper never edit concurrently.

## Archetypes

| Name | Role | Responsibilities | Tools / skills | Active |
|---|---|---|---|---|
| navigator | Orchestrator (main session) | Slice sequencing, handoffs, commits, status report: where now / where next / why / goal fit | all | always |
| pathfinder | Slice planner, read-only | Acceptance criteria, test list, out-of-scope list, DDD-proportionality check (no invented aggregates or services) | `story-planner`, `split`, `review-plan` | before each slice |
| builder | TDD implementer | Outside-in red-green, hardcode-first, one failure per turn, `feat` commit | `tdd`, `commit` | every slice |
| sweeper | Refactorer | Smell report, then provable behavior-preserving refactors as ACN micro commits, green bar throughout | `sweep`, `tidy` | after each `feat` commit |
| verifier | Independent checker + demo recorder | Tests, real-app browser checks, mutation-verify key tests, fresh-eyes pass, record slice demo | `agent-browser`, `test-feature`, `retroactive-test-check`, `tw-fresh-eyes-blunder-pass` | after sweep |
| domain-steward | DDD / Eazy Freight expert | Ubiquitous language, coaching prompt, Eazy Freight briefing, dev-only analysis sensor | `outputs/ddd-*.md` | slice 3+ |
| deployer | Hosting | Netlify or Sites setup, hosted env values, verify `.env` absent from bundle, hosted two-turn and retry check | `netlify` CLI | slice 2a |
| sensor-installer | Katacombs transfer | Follow `katacombs-kata-ts/INSTALL.md`; prove hooks fire before calling them installed | — | slice 5 |

## Demo recording

- `agent-browser record start <path>.webm` → scripted acceptance steps → `record stop`.
- Captions: inject an on-page banner per step via agent-browser (local ffmpeg lacks `drawtext`/`subtitles` filters).
- Convert: `ffmpeg -i in.webm -c:v libx264 -pix_fmt yuv420p out.mp4`; GIF via `-vf "fps=10,scale=800:-1"`; optional soft CC track by muxing `.srt` as `mov_text`.
- Output: `outputs/demos/slice-NN.{mp4,gif,md}`.
