# DDD Coach — agent team archetypes

Candidates for `.claude/agents/*.md` definitions. Not yet installed.

## Slice loop

pathfinder plan → builder test + code → committer `feat` commit → sweeper ACN refactors (each via committer) → verifier check + demo recording → **stop: demo + status report** → user approval → next slice.

One working tree; agents run sequentially so builder and sweeper never edit concurrently.

- **Commit requests are final.** Once a request is sent to committer, never withdraw or hold it; fix forward with a follow-up commit (holds and commits crossed twice in slice 2a).
- **`netlify dev` hot-reloads functions on every save.** Do multi-file renames in one atomic edit, or the shared dev server crashes.

## Archetypes

| Name | Role | Responsibilities | Tools / skills | Active |
|---|---|---|---|---|
| navigator | Orchestrator (main session) | Slice sequencing, handoffs, commits, status report: where now / where next / why / goal fit | all | always |
| pathfinder | Slice planner, read-only | Acceptance criteria, test list, out-of-scope list, DDD-proportionality check (no invented aggregates or services) | `story-planner`, `split`, `review-plan` | before each slice |
| builder | TDD implementer | Outside-in red-green, hardcode-first, one failure per turn, `feat` commit | `tdd`, `commit` | every slice |
| committer | Commit gatekeeper | Owns every `git commit`: inspects the staged diff, stages non-secrets, flags issues with ❗️, runs test/typecheck/build, single-sentence message, no Claude co-author; other agents stop at green and hand off | `commit` | each commit point |
| sweeper | Refactorer | Smell report, then provable behavior-preserving refactors as ACN micro commits, green bar throughout | `sweep`, `tidy` | after each `feat` commit |
| verifier | Independent checker + demo recorder | Tests, real-app browser checks, mutation-verify key tests, fresh-eyes pass, record slice demo, capture slice screenshot | `agent-browser`, `test-feature`, `retroactive-test-check`, `tw-fresh-eyes-blunder-pass` | after sweep |
| domain-steward | DDD / Eazy Freight expert | Ubiquitous language, coaching prompt, Eazy Freight briefing, dev-only analysis sensor | `outputs/ddd-*.md` | slice 3+ |
| deployer | Hosting | Netlify or Sites setup, hosted env values, verify `.env` absent from bundle, hosted two-turn and retry check | `netlify` CLI | slice 2a |
| sensor-installer | Katacombs transfer | Follow `katacombs-kata-ts/INSTALL.md`; prove hooks fire before calling them installed | — | slice 5 |

## Demo recording

- `agent-browser record start <path>.webm` → scripted acceptance steps → `record stop`.
- Captions: inject an on-page banner per step via agent-browser (local ffmpeg lacks `drawtext`/`subtitles` filters).
- Convert: `ffmpeg -i in.webm -c:v libx264 -pix_fmt yuv420p out.mp4`; GIF via `-vf "fps=10,scale=800:-1"`; optional soft CC track by muxing `.srt` as `mov_text`.
- Output: `outputs/demos/slice-NN.{mp4,gif,md}`.
- Never reload or open mid-recording: the recorder silently stops capturing. Split with `record stop`/`start` and join with ffmpeg concat.
- Recording ignores `set viewport`, so take the 1280×800 PNG outside the recording. If `record stop` fails with "ffmpeg wait failed", retry it.
- Injected overlays (captions, spy panels) need `pointer-events:none` and body padding so they don't hide results or catch clicks.
- Mid-script, use CSS selectors or `form.requestSubmit()` instead of `@eN` refs, which go stale. Avoid `wait --fn` (it hangs past the tool timeout).
- Always give `screenshot` an absolute path: a relative path lands in the repo root.
- Run a rate-limit burst truly last. Afterwards every POST returns 429 for about 60 s, even oversized ones.

## Slice screenshot

The [mockups canvas](https://claude.ai/artifact/RjbLasj538CpC29jWrqzGf) pairs each slice's projected screen with an `ActualNN.dc.html` frame (IDs: `01`, `02`, `02a`, `03`, `04a`…`04d`, `05`…`13`).

- Verifier: after the demo, set the viewport to 1280×800 and screenshot the state the slice's acceptance check describes → `outputs/demos/slice-NN.png`. Slice 5 has no UI: capture the terminal finding instead.
- Navigator: upload the PNG as a canvas asset, replace the placeholder body of `ActualNN.dc.html` with `<img src="/_blob/<id>">` (1280×800, descriptive `alt`), and retitle the frame `Actual · NN (built)`.
- Every agent-browser command uses a named session (`agent-browser --session <agent> …`); the default session is shared across sessions and mixes up captures. Reuse the running dev server on :8888 rather than starting another `netlify dev`. If a demo must restart it (e.g. `COACH_TIMEOUT_MS=1`), restore it afterwards in tmux session `ddd-coach` with `npm run dev`. Inside swarm panes use `tmux -S /private/tmp/tmux-501/default`. Run the server as a plain command in an interactive shell (not `zsh -c`), so C-c doesn't kill the session.
