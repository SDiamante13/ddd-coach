# DDD Coach — agent team archetypes

Candidates for `.claude/agents/*.md` definitions. Not yet installed.

## Slice loop

pathfinder plan → builder test + code → committer `feat` commit → sweeper ACN refactors (each via committer) → verifier check + demo recording → **stop: demo + status report** → user approval → next slice.

One working tree; agents run sequentially so builder and sweeper never edit concurrently.

- **Stage at request time.** A main-tree builder runs `git add <exact files>` when it sends a commit request, freezing the snapshot; it may keep editing the working tree but doesn't touch the index until the hash comes back. The committer gates and commits the staged snapshot only.
- **Commit requests are final.** Once a request is sent to committer, never withdraw or hold it; fix forward with a follow-up commit (holds and commits crossed twice in slice 2a).
- **Land with `bin/land.sh <sha>`** (#134): it fetches, refuses anything that isn't a fast-forward of `origin/main`, pushes that exact SHA with a braced refspec, fast-forwards the local main checkout, and prints what landed. It avoids zsh's `:r`-style refspec mangling.
- **One rebaser.** Once a branch is handed to git-agent to land, only git-agent rebases it. The builder doesn't rebase that branch again until the landing is confirmed; parallel rebases have caused duplicate SHAs and stale worktrees.
- **Hold main is a handshake.** git-agent sends "hold main" and waits for the committer's ack before merging into main, then sends "release main". A merge started before the ack crossed a staged commit request once.
- **`netlify dev` hot-reloads functions on every save.** Do multi-file renames in one atomic edit, or the shared dev server crashes.
- **zsh history modifiers.** In `git show $SHA:server/...`, zsh reads `:s`/`:w`/`:h` after a bare variable as modifiers and mangles the path. Always brace it: `"${SHA}:path"`.
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

Template: the latest `outputs/demos/*-deploy.md` (e.g. `117-121-118-deploy.md`).
- Build from a pinned git worktree outside the repo (`npm ci` + `bin/check.sh`), deploy with `netlify deploy --prod`, then remove the worktree.
- Use the repo's `npx netlify` (27.x); the homebrew `netlify` on PATH is older and lacks flags such as `env:list --site`.
- Always pass `--context production` to `netlify env:list`/`env:get`; without it two vars are hidden and secrets read as blank, so they look falsely unset.
- Check env as booleans only (model, effort, keys and password set). Never print values or change them.
- Confirm the live index JS hash equals the build. Match response header names case-insensitively (`grep -i`).
- When checking new copy in the bundle, search for a stable fragment: plurals, templates and two-part labels ("QUESTION · OPEN") are split across strings.
- Run `bin/hosted-check.sh https://ddd-coach.netlify.app` (#135) after every deploy. It prints PASS/FAIL per check and exits 1 on any failure: the three security headers, `/api/health` ok, chat GET 405 and session-less POST 401, no `sk-or`/`OPENROUTER`, source maps or googleapis/gstatic in the HTML, JS and CSS, and every woff2 same-origin with a 200. The bullets below remain the full list; check the function zips by hand.
- Hosted checks: headers; chat GET 405 / POST 401; session 401 no-store; unlock GET 405; source paths 404; 0 `sk-or`/`OPENROUTER` in the HTML, JS and CSS, and 0 `sk-or` in the function zips (`OPENROUTER` there is only env var names, which is expected); no `.map`.
- Fonts: every CSS font URL is same-origin, every woff2 returns 200, and there are 0 googleapis/gstatic references.
- Shell gotchas on this machine: quote globs in zsh (`'--include=*.tsx'`), and `stat -f` resolves to GNU stat, so use `wc -c` for file sizes.
- Before a paid run or deploy, check the key for free: GET https://openrouter.ai/api/v1/key with `node --env-file=.env`, printing only status, error and the limit fields (never the key). Loading `.env` this way is allowed; printing it is not. OpenRouter keys can expire ("API key expired", 401); prod's Netlify secret can't be read back by the CLI, so verify prod with one hosted call.
- Deploy only a SHA whose `ci.yml` run is green. Find it with `gh run list --workflow ci.yml --json headSha,status,conclusion` and match `headSha`; `--commit` lists nothing while the run is still in progress.
- When a function zip changes, explain the diff: build both commits' zips (`zip-it-and-ship-it`), unpack and diff them. The server also bundles shared `src/` modules, so a client refactor can change a zip. When the CLI deploys functions from cache, re-bundle with `zip-it-and-ship-it --archive-format none` and compare against the deployed zips. Bundle each commit in a worktree with a real `npm ci`; a symlinked `node_modules` makes zip-it-and-ship-it copy all of it into the zip.
- After a deploy, `curl -s https://ddd-coach.netlify.app/api/health` must return `"status":"ok"`. The `health` GitHub Action checks it every 30 min and fails (emailing the owner) on anything else, including `key_expiring` a week before the key expires.
- No unlock and no paid calls; the verifier owns the demo.

## Demo recording

- **Default recorder (#116):** `node bin/demo-record.mjs --script <steps.mjs> --out <path without extension> [--viewport 1280x800] [--fixtures] [--chat-delay 1200]`. It drives system Chrome through `playwright-core` with a fresh temporary profile and records the viewport only, writes `<out>.mp4` (H.264, yuv420p, even size) and prints the page-error count (exit 1 if any). `--fixtures` starts its own `COACH_FIXTURES=1` Vite on :5195 (no paid calls) and stops it afterwards. A steps file default-exports `async ({ page, caption, overlay, shot, pause }) => …`: `caption(text)` sets the magenta bottom-left banner, `overlay(box, label)` draws a magenta dashed box (`overlay(null)` clears it), `shot(name)` saves `<out>-<name>.png`. Keep steps files in `outputs/demos/scripts/`. Example: `outputs/demos/scripts/111.mjs` re-records #111 with the command in its header.
- `agent-browser record start <path>.webm` → scripted acceptance steps → `record stop`.
- Captions: inject an on-page banner per step via agent-browser (local ffmpeg lacks `drawtext`/`subtitles` filters).
- Convert: `ffmpeg -i in.webm -c:v libx264 -pix_fmt yuv420p out.mp4`; GIF via `-vf "fps=10,scale=800:-1"`; optional soft CC track by muxing `.srt` as `mov_text`.
- Output: `outputs/demos/slice-NN.{mp4,png,md}`. Skip the GIF (git history keeps every byte forever); make one only if asked, and keep it under 1 MB.
- Never reload or open mid-recording: the recorder silently stops capturing. Split with `record stop`/`start` and join with ffmpeg concat.
- Recording ignores `set viewport`, so take the 1280×800 PNG outside the recording. If `record stop` fails with "ffmpeg wait failed", retry it.
- Demo highlights use magenta, a colour the app never uses, and every report says which marks are overlays. An orange pointer ring was once mistaken for app styling and drove a design change (#123).
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

- `record start` does not carry localStorage into the recorded context, and a mid-recording `location.reload()` can silently stop the recorder: seed storage on camera and reload at most once. Close any open composer panel before showing replies.
- `set viewport` mid-recording stretches the page into the fixed video frame and can silently not apply: check `innerWidth` after each change, and prefer a separate take per viewport. A `screenshot` during a recording works and saves a paid call.
- Record demos and run browser checks in system Chrome (153+) via playwright-core. agent-browser's bundled Chrome 147 returns `undefined` from `scrollIntoView`, so it hid the #120 crash that current Chrome's Promise return causes. Launch it with a fresh temporary profile (never the owner's user-data-dir) and keep captures viewport-only, so no signed-in avatar, tabs or address bar appear.
- **Safari check (#137):** `node bin/safari-check.mjs` (once: `npx playwright-core install webkit`, into the user cache, no sudo) starts its own fixture server (`SAFARI_CHECK_PORT`, default 5197) and checks the first visit in WebKit at 1280×800 and 1280×577 with the box unfocused: "Try an example thread" shows and fills the box. It exits 1 on failure.
- Never use the Playwright MCP browser: it can attach to the owner's own Chrome and show personal tabs. If it does, stop and delete its `.playwright-mcp/` snapshots and logs unread.
- If `agent-browser` screenshot/record hang (seen with 0.23.0, even on example.com), record with `playwright-core` driving agent-browser's Chrome instead; Playwright MCP may be locked by another session.
- Headless Chrome blocks clipboard reads even with permissions granted. To demo a paste, spy on `navigator.clipboard.write`/`writeText` in-page, keep what the app wrote, and insert it into the target box (contenteditable or textarea).
- After filling the password, never dump the gate's `innerHTML`, `outerHTML`, `value` or a full snapshot: React reflects the input value and the password lands in tool output. Check the gate by role or text only.
- Verifier: after the demo, set the viewport to 1280×800 and screenshot the state the slice's acceptance check describes → `outputs/demos/slice-NN.png`. Slice 5 has no UI: capture the terminal finding instead.
- Navigator: upload the PNG as a canvas asset, replace the placeholder body of `ActualNN.dc.html` with `<img src="/_blob/<id>">` (1280×800, descriptive `alt`), and retitle the frame `Actual · NN (built)`.
- Every agent-browser command uses a named session (`agent-browser --session <agent> …`); the default session is shared across sessions and mixes up captures. Reuse the running dev server on :8888 rather than starting another `netlify dev`. If a demo must restart it (e.g. `COACH_TIMEOUT_MS=1`), restore it afterwards in tmux session `ddd-coach` with `npm run dev`. Inside swarm panes use `tmux -S /tmp/tmux-$(id -u)/default`. Run the server as a plain command in an interactive shell (not `zsh -c`), so C-c doesn't kill the session.
