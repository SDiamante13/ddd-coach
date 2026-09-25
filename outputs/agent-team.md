# DDD Coach — agent team archetypes

Candidates for `.claude/agents/*.md` definitions. Not yet installed.

## Slice loop

pathfinder plan → builder test + code → committer `feat` commit → sweeper ACN refactors (each via committer) → verifier check + demo recording → **stop: demo + status report** → user approval → next slice.

One working tree; agents run sequentially so builder and sweeper never edit concurrently.

- **Commit requests are final.** Once a request is sent to committer, never withdraw or hold it; fix forward with a follow-up commit (holds and commits crossed twice in slice 2a).
- **`netlify dev` hot-reloads functions on every save.** Do multi-file renames in one atomic edit, or the shared dev server crashes.
- **Paid model runs.** A per-command shell env override beats `node --env-file`, so every eval or latency result must record the model it actually used. Latency runs only: add a unique nonce line so first turns stay uncached. Quality evals and hosted quality checks send the text exactly as a visitor would, since caching never changes the output but a nonce line is extra text the model reads. Production and dev models can differ (see `outputs/evals/slice-03/summary.md`), so demo on the hosted site.
- **Prompt changes ship only through `npm run eval -- --ab <N> --target …`** (rule in `outputs/evals/slice-03/summary.md`, "Ship rule (#78)").

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

## Deploy checklist

Template: `outputs/demos/chores-30af2d6-deploy.md`.
- Build from a pinned git worktree outside the repo (`npm ci` + `bin/check.sh`), deploy with `netlify deploy --prod`, then remove the worktree.
- Check env as booleans only (model, effort, keys and password set). Never print values or change them.
- Confirm the live index JS hash equals the build.
- Hosted checks: headers; chat GET 405 / POST 401; session 401 no-store; unlock GET 405; source paths 404; 0 `sk-or`/`OPENROUTER` in the HTML, JS, CSS and function zips; no `.map`.
- Fonts: every CSS font URL is same-origin, every woff2 returns 200, and there are 0 googleapis/gstatic references.
- No unlock and no paid calls; the verifier owns the demo.

## Demo recording

- `agent-browser record start <path>.webm` → scripted acceptance steps → `record stop`.
- Captions: inject an on-page banner per step via agent-browser (local ffmpeg lacks `drawtext`/`subtitles` filters).
- Convert: `ffmpeg -i in.webm -c:v libx264 -pix_fmt yuv420p out.mp4`; GIF via `-vf "fps=10,scale=800:-1"`; optional soft CC track by muxing `.srt` as `mov_text`.
- Output: `outputs/demos/slice-NN.{mp4,png,md}`. Skip the GIF (git history keeps every byte forever); make one only if asked, and keep it under 1 MB.
- Never reload or open mid-recording: the recorder silently stops capturing. Split with `record stop`/`start` and join with ffmpeg concat.
- Recording ignores `set viewport`, so take the 1280×800 PNG outside the recording. If `record stop` fails with "ffmpeg wait failed", retry it.
- Injected overlays (captions, spy panels) need `pointer-events:none` and body padding so they don't hide results or catch clicks.
- Mid-script, use CSS selectors or `form.requestSubmit()` instead of `@eN` refs, which go stale. Avoid `wait --fn` (it hangs past the tool timeout).
- Always give `screenshot` an absolute path: a relative path lands in the repo root.
- `network route` needs the full URL (`http://localhost:8888/api/session`); a `**/path` glob silently matches nothing. Run `tmux -S /tmp/tmux-$(id -u)/default …` directly, not through a shell variable, because zsh doesn't word-split it. `record start <url>` opens a new context, so set routes after recording starts. In that context `network requests` returns nothing; use an in-page fetch spy to show calls. `record stop` leaves the session on a blank page without the cookie, so re-open and re-unlock before any post-recording step.
- If screenshots hang, run `agent-browser --session <agent> close` first. Wrap each command in `timeout 60` so a hang can't stall the take.
- `click` doesn't check what's covering the target. A button under the sticky composer (e.g. a new entry's refusal actions) gets its click on the composer instead. Use `focus <selector>` + `press Enter`, which also exercises the scroll padding, or scroll first.
- Run a rate-limit burst truly last. Afterwards every POST returns 429 for about 60 s, even oversized ones.
- Put any fetch-spy panel in a right-hand column (about 300 px wide, `pointer-events:none`): a bottom panel covers the form. In zsh, wrap `agent-browser --session x` in a shell function, since `$AB` doesn't word-split.

## Slice screenshot

The [mockups canvas](https://claude.ai/artifact/RjbLasj538CpC29jWrqzGf) pairs each slice's projected screen with an `ActualNN.dc.html` frame (IDs: `01`, `02`, `02a`, `03`, `04a`…`04d`, `05`…`13`).

- After filling the password, never dump the gate's `innerHTML`, `outerHTML`, `value` or a full snapshot: React reflects the input value and the password lands in tool output. Check the gate by role or text only.
- Verifier: after the demo, set the viewport to 1280×800 and screenshot the state the slice's acceptance check describes → `outputs/demos/slice-NN.png`. Slice 5 has no UI: capture the terminal finding instead.
- Navigator: upload the PNG as a canvas asset, replace the placeholder body of `ActualNN.dc.html` with `<img src="/_blob/<id>">` (1280×800, descriptive `alt`), and retitle the frame `Actual · NN (built)`.
- Every agent-browser command uses a named session (`agent-browser --session <agent> …`); the default session is shared across sessions and mixes up captures. Reuse the running dev server on :8888 rather than starting another `netlify dev`. If a demo must restart it (e.g. `COACH_TIMEOUT_MS=1`), restore it afterwards in tmux session `ddd-coach` with `npm run dev`. Inside swarm panes use `tmux -S /tmp/tmux-$(id -u)/default`. Run the server as a plain command in an interactive shell (not `zsh -c`), so C-c doesn't kill the session.
