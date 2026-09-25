# Slice 2a: publish the app and `/api/chat`

The working app and its chat function go live on a new Netlify site, `ddd-coach`, on "Steven Diamante's team". The hosted URL passes the slice 2 checks: a real two-turn exchange that uses memory, and failure → Retry. No secret reaches the static bundle. Code changes are kept small. Request-size edges get fixed before the endpoint goes public: a body cap (B39), a per-message cap (B40), and no dead Retry on a 413 (B41). There's also a per-IP rate limit and a few safe headers. Everything, including the env values, goes through the Netlify CLI (user decision).

Acceptance check from the plan: "Verify a real two-turn exchange and failure/retry on the hosted URL. Keep `.env` out of the bundle."

## Goal fit

| Goal | How slice 2a contributes |
|---|---|
| Maximize learning | What changes between `netlify dev` and production: env contexts and secrets, the platform timeout and its response shape, body limits, rate limiting at the edge. Each one is measured, not assumed |
| Fun | A real URL to open on a phone or share |
| Solve real DDD problems | Later slices (voice, the board) get tested where they will actually run, from slice 3 on. Early hosting catches platform surprises while the app is still small |

## Verified facts (2026-09-24)

**Netlify account and CLI** (read-only checks):
- `netlify-cli/27.9.0`. The folder isn't linked: `.netlify/state.json` has no `siteId`.
- Team "Steven Diamante's team", slug **`sdiamante13`**, is on the **legacy Free** plan (`type_slug: free-is-free`, `credit_features: false`).
  - `env_var_secrets: true`, but **`env_var_scopes: false`**, so don't pass `--scope`.
  - `block_builds_when_usage_exceeded: true`, `accumulate_overages: false`: on Netlify's side, overuse suspends the site; it isn't billed.
  - 125k function invocations a month. `max_traffic_rules: 2`.
  - No site password (`secure_site: false`).
- `https://ddd-coach.netlify.app` returns 404 `text/plain`, so the subdomain is probably free.
- `git status -sb`: `main...origin/main`, with nothing ahead.

**Netlify docs** (docs.netlify.com/build/functions/configuration):
- Synchronous function limit: **60 s**, not configurable. **Measured on this site: 30.4 s** (see Hosted timeout).
- Buffered request/response payload: **6 MB**.
- Function Node version: the build's Node version, falling back to Node 24.

**Rate limiting** (docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting):
- Code-based rules are available on all plans, 2 per project on Free.
- `aggregateBy: ["ip","domain"]` only.
- `windowSize` is at most 180 s.
- A limited request gets 429.
- The `Config.rateLimit` type exists in `@netlify/functions` 6.0 (`dist/main.d.ts:102-137`).

**CLI source** (`node_modules/netlify-cli/dist`):
- `env:set <key> [value]` prints `Set environment variable KEY=value …` **unless `--secret`**, in which case it prints the key only (`commands/env/env-set.js`, last `log`).
  - `--json` prints the whole env, values included.
  - `--force` skips the overwrite prompt, which the agent shell can't answer (no TTY).
- A secret value needs `--context` other than `all` or `dev`, and the CLI drops the post-processing scope for secrets itself.
- **`env:import <file>` prints a Key/Value table of every imported value** (`env-import.js`). It also has no `--secret` flag. Rejected.
- **The `env:list` table isn't safe masking.**
  - With `isCI`, it prints the values.
  - Otherwise it prints a masked table, then opens an inquirer "Show values?" prompt. The agent shell has no TTY (`CI` unset, stdin not a TTY), so it hangs or errors.
  - `--plain` and `--json` print values.
  - The safe check is `--json` piped through a filter that drops the values (below).
- `deploy --build` is deprecated ("this is now the default"). Plain `deploy --prod` builds.
- `.env` is loaded only by `dev`, `serve` and `functions:serve` (`utils/dev.js`). `deploy` never reads it.
- `--upload-source-zip` is hidden and defaults to off. Never pass it: it zips the repo.
- Vite puts only `VITE_*` variables into client code, and the app has none.

**Current code:**
- `chatHandler` reads the body with `readJson(request)` (`src/shared/json.ts`, which the client also uses) and then applies `parseChatRequest`, which enforces ≤ 50 turns and ≤ 24,000 chars.
- `askCoach` maps any non-2xx body without an `error` string to the timeout message for 504, and to "The coach is unavailable. Try again." for anything else. So a platform 429, 502 or 504 in plain text still shows a clean message with Retry.
- Every failure gets Retry: `AskResult` failure is `{ ok: false; error }`, and `ExchangeOutcome` always renders the button. So a 413 offers a Retry that can only 413 again.
- `parseChatRequest` counts the message in the 24,000-char total, so a single 24,001-char message with an empty log gets "…Reload the page", which a reload can't fix (verifier finding).
- `chat.mts` config: `{ path: "/api/chat" }`.
- `netlify.toml` has no `[[headers]]` and no redirects.

## Decisions

### Deploy mechanism: CLI `netlify deploy --prod`, not GitHub continuous deploy

| | CLI deploy (chosen) | GitHub CD |
|---|---|---|
| Private repo | No repo access needed | The Netlify GitHub App needs read access to the private repo, granted in the browser through `netlify init` or the UI |
| Fit with the slice loop | Deploys once per approved slice, after verifier | Every committer micro-commit (sweeper ACN refactors) goes to production mid-slice |
| Agent-drivable | Yes, with no browser OAuth | Setup is interactive |
| Repeatability | One pinned command sequence, guarded by a clean-tree check plus `bin/check.sh` | Clean-clone builds: stronger reproducibility |
| Local contamination | Guarded: `deploy` doesn't read `.env`, Vite exposes no non-`VITE_` vars, and the clean-tree check blocks uncommitted code | None |

CD wins on reproducibility. It becomes worth it once deploys are routine and CI runs the tests, so it goes to a **backlog candidate (B45)**.

### Pinned commands (deployer)

Pre-flight:
```bash
test -z "$(git status --porcelain --untracked-files=no)" && git status -sb | head -1   # expect: main...origin/main, nothing ahead
bin/check.sh
```

1. Create and link the site. This is non-interactive and writes `siteId` to `.netlify/state.json`, which is gitignored:
   ```bash
   npx netlify sites:create --name ddd-coach --account-slug sdiamante13
   npx netlify status        # confirm project ddd-coach, team sdiamante13
   ```
   If the name is taken, use `ddd-coach-sd` and tell navigator.

2. The deployer sets the env values: run the dummy-var gate, then set and verify (see the Env values section below). Nothing deploys until verification shows both keys `set`.

3. Deploy to production. The build runs `npm run build` from `netlify.toml`; the chat function is bundled from `netlify/functions`:
   ```bash
   npx netlify deploy --prod --message "slice 2a $(git rev-parse --short HEAD)" --json > work/deploy-2a.json   # no --build: deprecated, building is the default
   ```
   Record `url`, `deploy_id` and `logs` from the JSON. Confirm the function list includes `chat`. Delete `work/deploy-2a.json` afterwards; don't commit it.

**Never** pass `--upload-source-zip`, `--env`/`--secret-env` with the key, or `--auth` with a token on the command line.

### Env values: the deployer sets them from `.env` via the CLI, and never sees them

The user decided the CLI does it all. Two guarantees: no value appears in a command line the transcript records, and none appears in any output the transcript records.

**Why not the obvious forms:**
- `env:import .env` prints a Key/Value table of all values.
- `env:list` without `--plain` isn't reliably masked (see Verified facts).
- `set -a; . ./.env` works only if `.env` is valid shell (no spaces, `$` or quotes in values), which pathfinder can't check without reading it. `node --env-file` parses dotenv syntax the way `netlify dev` does.
- `>/dev/null 2>&1` hides errors too, so a failure can't be diagnosed. Redact the output instead.

**Step A: dummy-var gate** (right after `sites:create`, before any real value). This proves the flag combination on this Free plan, including that the API accepts `--secret` without the scopes feature, and that the value doesn't echo:
```bash
npx netlify env:set DDD_COACH_PROBE probe-7f3a9c --secret --context production --force 2>&1 | tee work/probe-out.txt
grep -c probe-7f3a9c work/probe-out.txt      # expect 0
grep -c "DDD_COACH_PROBE" work/probe-out.txt  # expect ≥1 ("Set environment variable DDD_COACH_PROBE … as a secret in the production context")
npx netlify env:unset DDD_COACH_PROBE --force && rm work/probe-out.txt
```
- If the set **fails** because of scopes or secrets on Free, drop `--secret` for the key. With `--secret` off, the value echoes on stdout, but Step B discards stdout anyway, so it's still safe. Record the finding.
- If the value count isn't 0, stop and report.

**Step B: set the real values.** Values go from the process env straight into argv; stdout is discarded; stderr is redacted:
```bash
node --env-file=.env -e '
const { spawnSync } = require("node:child_process");
const redact = (text) => [process.env.OPENROUTER_API_KEY, process.env.OPENROUTER_MODEL]
  .filter(Boolean).reduce((out, v) => out.split(v).join("[REDACTED]"), text).replace(/sk-or-[\w-]+/g, "[REDACTED]");
const set = (key, extra) => {
  if (!process.env[key]?.trim()) return console.log(`${key}: missing in .env, not set`);
  const r = spawnSync("npx", ["netlify", "env:set", key, process.env[key], "--context", "production", "--force", ...extra],
    { encoding: "utf8", stdio: ["ignore", "ignore", "pipe"] });
  console.log(`${key}: ${r.status === 0 ? "set" : "FAILED " + redact(r.stderr ?? "")}`);
};
set("OPENROUTER_API_KEY", ["--secret"]);
set("OPENROUTER_MODEL", []);
'
```
- Use `spawnSync` with an argument array: no shell, so no quoting or expansion issues.
- `node --env-file` doesn't override variables already in the shell. If the shell exports `OPENROUTER_*` (for smoke tests), those win. It's the same key in practice; note it if the hosted model differs.
- The value exists briefly in the local `ps` argv. That's acceptable on a single-user machine, and it's inherent to `env:set`.

**Step C: verify without values:**
```bash
npx netlify env:list --context production --json | node -e '
const env = JSON.parse(require("fs").readFileSync(0, "utf8"));
for (const key of ["OPENROUTER_API_KEY", "OPENROUTER_MODEL", "DDD_COACH_PROBE"])
  console.log(key, env[key] ? "set" : "absent");'
```
Expect: key set, model set, probe absent. The final proof comes after deploy: a missing value makes the function return 500 `"OPENROUTER_API_KEY is not set."` or `"OPENROUTER_MODEL is not set."`.

**Scope, context and other rules:**
- **Scopes:** omit `--scope`. The Free plan has no scopes feature (`env_var_scopes: false`), so values apply to every scope, including functions. For secrets, the CLI removes post-processing itself.
- **Context:** `production` only. Secrets can't use `all` or `dev`, and deploy previews and drafts don't need the key (see the timeout probe below).
  - Side effect of linking: `netlify dev` now also pulls site env for the `dev` context. That's empty, so local dev keeps using `.env`.
- **`COACH_TIMEOUT_MS`** is optional. Don't set it; the 25 s default stays under the measured 30.4 s platform cut-off (5 s margin).
- **Recommended: a credit limit on the key** in the OpenRouter dashboard (user; for example $5). If the user makes a dedicated hosting key, they put it in a separate env file, the deployer reruns Step B with `--env-file=<that file>`, and then redeploys (env changes need a redeploy).
- **Agents never** run `env:get`, `env:import`, `env:list` with `--plain` or an unfiltered `--json`, or `env:set` with `--json`. They never print `.env`; `node --env-file` in Step B is its only use.

### Hosted timeout: 60 s from the docs; measure it with a throwaway probe

The server deadline (25 s) should always fire first, so the platform limit only matters if the deadline fails. Measure it anyway, without touching production or OpenRouter. Create `work/timeout-probe/slow.mts` (never committed):

```ts
export default async () => {
  await new Promise((resolve) => setTimeout(resolve, 75_000));
  return new Response("finished");
};
export const config = { path: "/api/slow" };
```

```bash
npm run build
npx netlify deploy --no-build --skip-functions-cache --dir dist --functions work/timeout-probe --message "timeout probe" --json   # draft, not --prod
curl -s -o work/probe-body.txt -w "%{http_code} %{time_total}s %{content_type}\n" -X POST <draft_url>/api/slow
head -c 300 work/probe-body.txt
```

Record the status, elapsed time, content type, and whether the body is JSON or plain text, and whether it contains a stack trace or paths. Then delete the probe and body file, and the draft: `npx netlify api deleteDeploy --data '{"deploy_id":"<id>"}'`.

Expected: about 60 s, with some non-2xx status. Whatever the status, `askCoach` maps it to a clean message. If the body leaks a stack trace, that's a finding, not a blocker.

- **`--skip-functions-cache` is required.** Without it, `--no-build` reuses the cached `.netlify/functions` (from the last build) and ignores `--functions`: the draft ships only `chat`, and `/api/slow` returns 400 "Bad request, missing form".
- **Measured (2026-09-24, deploy-preview draft): 504 after 30.4 s, `text/html`, a Netlify "Inactivity Timeout" page.** No stack trace or paths. That's about half the documented 60 s, so `COACH_TIMEOUT_MS` must stay under about 28 s. A longer deadline (e.g. the ~45 s the model-eval proposal suggests for reasoning models) needs streaming (B35); "inactivity" suggests early bytes keep the connection alive (unverified).

### B39 body cap: **in** (small, TDD'd)

On Netlify, the platform buffers the whole body (≤ 6 MB) before the function runs, so "before the full body is read" is moot. What's left to cap is the `JSON.parse` of up to 6 MB. The fix is a byte check before parsing:

- `MAX_BODY_BYTES = 128 * 1024`. Headroom: the largest legitimate body is 24,000 UTF-16 units × at most 3 UTF-8 bytes (72 KB), plus JSON escaping and the keys for 50 turns, which comes to under 80 KB for realistic text.
- `server/requestBody.ts`: `readJsonWithin(request, maxBytes): Promise<{ ok: true; body: unknown } | { ok: false }>`. It reads `arrayBuffer()`; if `byteLength > maxBytes`, it returns `{ ok: false }`; otherwise it decodes and `JSON.parse`s in try/catch, with `null` on invalid JSON as today.
  - It lives in `server/`, not `src/shared/json.ts`, because the client doesn't need it.
- The handler maps over-cap to the existing `rejected("tooLong")`, which returns 413 with `COACH_TOO_LONG`. No new contract message.
- No `Content-Length` pre-check: the platform has already buffered the body, and the header can be absent or false.

### B40 per-message cap and B41 no dead Retry on 413: **in** (small, TDD'd)

These are request-size edges a public visitor hits first. Pasting a long spec is the obvious one.

**B40, server:**
- `MAX_MESSAGE_CHARS = 8_000`. That's a third of the 24k budget, so a long message still leaves room for history. About 2k tokens.
- `RejectionReason` gains `"messageTooLong"`. `parseChatRequest` checks the trimmed prompt after `readConversation` and before the total.
  - Order: turn count → malformed → message → total.
- The handler maps it to 413 with a new `COACH_MESSAGE_TOO_LONG = "This message is too long for the coach. Shorten it and send it again."` in `chatContract.ts`.
- `rejected` becomes a lookup from reason to response.
- A 24,001-char message with an empty log now gets the shorten message. A too-long *conversation* keeps "Reload the page".

**B41, client:** a 413 isn't retryable. Every 413 means resending the same request fails again.
- `AskResult` failure becomes `{ ok: false; error: string; retryable: boolean }`. `FailedExchange` carries `retryable`.
- `canRetry` also requires `retryable`. `ExchangeOutcome` renders no Retry button when `!exchange.retryable`.
- `askCoach`: `retryable = status !== 413`. Network failure, 5xx, 429 and "unexpected" stay retryable.
- **Make the change easy first:** a behaviour-preserving refactor commit adds `retryable: true` everywhere (type, `fail`, `askCoach`, test builders and assertions). The `feat` commit then only adds the 413 rule and the hidden button.

Not included:
- a client-side pre-check or input `maxLength`, which silently truncates pastes;
- restoring the draft into the input (the user copies it from the log);
- trimming history (B38).

### Rate limit: **in** (one config line, verified on the hosted site)

```ts
export const config: Config = {
  path: "/api/chat",
  rateLimit: { windowLimit: 20, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
```

20 requests a minute per IP is far above human use (about 3 a minute) and slows a single scripted abuser. It is **not** a global spend cap: many IPs get through. The OpenRouter key credit limit is the real bound. The rule uses 1 of the 2 Free rules. It's platform config, so there's no unit test; verifier checks for 429 on the hosted site.

### Security headers: minimal and dev-safe

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "frame-ancestors 'none'; object-src 'none'; base-uri 'self'"
```

- No `script-src`. `netlify dev` applies `netlify.toml` headers, and Vite dev injects an inline React-refresh preamble, so a `script-src 'self'` would break local dev. A full CSP applied only to the build goes to a **backlog candidate (B44)**.
- No `Permissions-Policy` either: `microphone=()` would have to be undone at slice 7.
- HSTS comes from `*.netlify.app`; verify it, don't add it.
- Reply rendering is already XSS-safe (slice 1, criterion 8).

### Streaming (B35): **out**

Replies are capped at 600 tokens, the deadline is 25 s, and the platform cut-off measured 30.4 s. There's no hard reason to stream now. It stays in the backlog until the probe or real use shows 504s.

## Acceptance criteria

1. Given the site is deployed, when the user sends a turn and then a follow-up that needs a detail from turn 1, the hosted reply uses that detail, and the second request carries `history` with one turn.
2. Given a request fails on the hosted URL (network offline, or a server 504), the entry shows the inline error with Retry. Retry resends the same prompt with the history it would have had, and gets one reply without duplicating the prompt.
3. Given the production `dist/`, the deployed JS assets and the bundled `chat` function zip, none contains `sk-or`, and no deployed static asset contains `OPENROUTER`. `/.env`, `/src/main.tsx` and `/server/config.ts` return 404, and `dist/` has no `.map` files.
4. Given a POST body over 128 KiB, the server returns 413 `COACH_TOO_LONG` and doesn't call the coach. A maximal legitimate conversation (50 turns, 24,000 chars of 3-byte characters) is still accepted.
5. Given more than 20 POSTs to `/api/chat` from one IP within 60 s, the extra requests get 429, and the UI would show "The coach is unavailable. Try again."
6. Hosted responses for `/` carry `X-Content-Type-Options: nosniff`, `Referrer-Policy` and a `frame-ancestors 'none'` CSP. HSTS is present.
7. The hosted platform timeout is measured and recorded (status, time, content type, and whether the body is JSON or text with stack traces), and the hosted handler's 504 is JSON.
8. Slice 2 behaviour holds on the hosted site: a role-shaped history gives 400, and 51 turns or more than 24,000 chars in total give 413 "…Reload the page".
9. Given a message over 8,000 chars (after trimming), the server returns 413 with the shorten message and doesn't call the coach. An 8,000-char message with an empty history is accepted. A single 24,001-char message gets the shorten message, not "reload".
10. Given any 413, the entry shows the error and **no** Retry button. Other failures (network, 5xx, 504, 429) keep Retry.

## Test order (TDD only where there is code)

Outside-in for B40 and B41 (after the refactor commit that adds `retryable: true`):
1. `src/App.test.tsx`: fetch stub → 413 `{error: COACH_MESSAGE_TOO_LONG}`. The entry shows the message, and `queryByRole("button", {name: "Retry"})` is null. Predicted failure: the Retry button exists.
2. `src/api/askCoach.test.ts`: 413 with a JSON error → `{ok:false, error, retryable:false}`; 502 → `retryable:true`.
3. `src/domain/exchange.test.ts`: `canRetry` is false for a failed exchange with `retryable: false`.
4. `server/chatRequest.test.ts`:
   - an 8,001-char message with `history: []` → `{ok:false, reason:"messageTooLong"}`;
   - 8,000 → ok;
   - a 24,001-char message → `"messageTooLong"`;
   - the existing total tests are unchanged, since they use short messages.
5. `server/chatHandler.test.ts`: a `messageTooLong` body → 413 with `COACH_MESSAGE_TOO_LONG` and the coach not called.

Handler, B39 (`server/chatHandler.test.ts`):
1. **Red:** a valid body padded to `MAX_BODY_BYTES + 1` bytes with an ignored `pad` field → expect 413 `COACH_TOO_LONG` and the coach not called. Predicted failure: 200, because the parser ignores extra fields.
2. **Guard:** 50 turns totalling exactly 24,000 `€` characters (3 bytes each in UTF-8) → 200. This may pass straight away, so mutation-check it (`retroactive-test-check`): set the cap to 64 KiB and it must fail.
3. The existing "not JSON → 400" test must still pass through the new reader.

A unit test for `readJsonWithin` is optional. The handler tests cover it; add one only if the sweeper extracts more.

Config and ops (no unit tests; verified on the hosted site): `rateLimit` in `chat.mts`, and `[[headers]]` in `netlify.toml`. Builder runs `bin/check.sh` and, locally, `curl -sI localhost:8888 | grep -i -E "nosniff|frame-ancestors"` to confirm the headers don't break `netlify dev` (the page loads and HMR works).

Commits (through committer):
- `r`: add `retryable: true` everywhere (behaviour-preserving).
- `feat`: B40 per-message cap.
- `feat`: B41 no Retry on 413.
- `feat`: B39 body cap.
- A config commit: rate limit plus headers.

The deploy itself creates no commit.

## Hosted checks (deployer, then verifier)

Let `U=https://ddd-coach.netlify.app`.

| Check | Command | Expect |
|---|---|---|
| Static bundle clean | `grep -rlE "sk-or\|OPENROUTER" dist; ls dist/assets/*.map` | no output |
| Function zip clean | `find .netlify -name 'chat*.zip' -newer package.json`, then `unzip -l <zip>` and `unzip -p <zip> \| grep -c "sk-or"` | no `.env` in the listing; count 0. `OPENROUTER` names *are* expected in the function |
| Deployed JS clean | `for a in $(curl -s $U/ \| grep -oE '/assets/[^"]+\.js'); do curl -s $U$a \| grep -cE "sk-or\|OPENROUTER"; done` | all 0 |
| Source not served | `curl -s -o /dev/null -w "%{http_code}\n"` on `$U/.env`, `$U/src/main.tsx`, `$U/server/config.ts` | 404 |
| Headers | `curl -sI $U/` | nosniff, Referrer-Policy, CSP frame-ancestors, `strict-transport-security` |
| Headers on the function (record only) | `curl -si $U/api/chat` | 405 JSON `{"error":"Use POST."}`. Note whether the toml headers apply to function responses |
| Validation | the slice 2 off-video curls (role-shaped 400, 51-turn 413 reload), an 8,001-char message → 413 shorten, a 129 KiB body → 413 | as stated |
| Server 504 is JSON | draft deploy `npx netlify deploy --env COACH_TIMEOUT_MS=1 --json` (not `--prod`), then POST a real message to `<draft_url>/api/chat` | 504 `application/json` with `COACH_TIMED_OUT`. If it returns 500 "OPENROUTER_API_KEY is not set." instead, drafts don't get the production secret: record that and use the fallback in Risks. **Measured: drafts get 500 "OPENROUTER_API_KEY is not set." Not re-run on prod; the JSON 504 path was demoed locally in slice 2** |
| Platform timeout | the probe (above) | recorded |
| Rate limit (last: it blocks your IP for up to 60 s) | `for i in $(seq 25); do curl -s -o /dev/null -w "%{http_code} " -X POST -d '{}' $U/api/chat; done` | 400 × 20, then 429s. Malformed bodies never call OpenRouter |

## Demo script (verifier, hosted URL)

Use `agent-browser --session verifier` throughout, with a caption banner injected per step. Record: `record start outputs/demos/slice-02a.webm`. Install the slice 2 pass-through fetch spy (`window.__bodies`) after the first load.

1. Open `https://ddd-coach.netlify.app`. Caption: "Slice 2a: DDD Coach, hosted on Netlify."
2. Send "My company is Eazy Freight. Remember: our carrier is called Maersk. Reply only OK." → one reply.
3. Send "Which carrier did I name? Answer in one word." → Maersk. Eval `__bodies.at(-1)`: `history` has 1 turn. Caption: "Hosted memory: turn 2 uses turn 1." **Set the viewport to 1280×800 and screenshot → `outputs/demos/slice-02a.png`.**
4. `set offline on`. Send "Correction: the carrier is actually MSC. Reply only OK." → "Could not reach the coach." + Retry. `set offline off`. Click Retry → one reply, with the prompt shown once. Caption: "Failure → Retry on the hosted URL."
5. Navigate to the `COACH_TIMEOUT_MS=1` draft URL. Send "Hello coach" → "The coach took too long. Try a shorter question or Retry." + Retry. Caption: "Server deadline → JSON 504, hosted." (Skip this step if the draft lacks the key; the criterion is then covered by the fallback.)
6. Back on production, paste a 9,000-char message and send it → "This message is too long for the coach. Shorten it and send it again.", with **no** Retry button. Caption: "B40/B41: too-long message, no dead Retry."
7. Still on production, eval `performance.getEntriesByType('resource').map(e => e.name)` and show the result in the caption: only `/assets/*.js|css` and `/api/chat`. Caption: "The browser talks only to /api/chat; the key lives in the function." The byte-level grep proof stays in the md.
8. `record stop`. Convert to `slice-02a.mp4` and `.gif` (see agent-team.md).

`outputs/demos/slice-02a.md` holds:
- the hosted-checks table with actual output;
- the probe results;
- the draft-context finding;
- the deploy id;
- links to the logs.

Delete the probe and `COACH_TIMEOUT_MS` drafts afterwards.

## Out of scope

- Streaming (B35).
- Logging deadline timeouts (B36) and aborting the call on 504 (B37).
- GitHub CD (B45) and a full `script-src` CSP (B44).
- A custom domain.
- Auth, accounts, a site password (Pro only), or captcha.
- Coaching prompt and briefing (slice 3).
- UI changes beyond hiding Retry on a 413.
- Trimming history (B38) and a client-side length pre-check.

## Risks

- **Cost exposure: a public, unauthenticated endpoint.** Anyone with the URL can spend OpenRouter credit. Each call is bounded (≤ 24k chars in, 600 tokens out).
  - Mitigations, smallest first:
    - (1) a dedicated OpenRouter key with a **credit limit** (user, in the dashboard; no code);
    - (2) a per-IP rate limit (this slice);
    - (3) watch usage.
  - Netlify itself can't bill: the legacy Free plan suspends instead.
  - If abuse shows up, rotate the key. Auth or a shared passphrase is a later backlog item.
- **Drafts lack the production secret (confirmed 2026-09-24).** CLI drafts run in the `deploy-preview` context, and the key is `production` only, so any draft `/api/chat` returns 500 "OPENROUTER_API_KEY is not set.". Fallback for the hosted 504 check: `npx netlify deploy --prod --env COACH_TIMEOUT_MS=1`, run the check, then redeploy `--prod` without it. Production is broken for about 2 minutes, which is acceptable with no users. Avoid putting the key in the `deploy-preview` context.
- **The name `ddd-coach` may be taken** globally. Fallback: `ddd-coach-sd`.
- **Local build, not a clean clone.** The pre-flight blocks uncommitted tracked changes. Untracked files under `outputs/` don't affect `dist`.
- **Headers in `netlify dev`.** The chosen headers avoid `script-src`. Builder confirms local dev still loads.
- **Rate-limit check blocks the verifier's IP for up to 60 s.** Run it last.
- **Secret handling by an agent.** This relaxes the "never read `.env`" constraint: `.env` is read by `node --env-file`, never printed. The dummy-var gate must pass first.
  - If a value ever appears in output, rotate the key in OpenRouter right away.
  - A wrong value shows up only as a hosted 502 (provider auth failure). Fix it with Step B and a redeploy.
- **The `retryable` refactor touches many test assertions** (`toEqual` on `AskResult`). Keep it a separate `r` commit so the `feat` diff stays small.
- **An 8,000-char message cap may be too low** once file or GitHub context attachments arrive. Revisit it then; attachments aren't typed messages.
- **The first production deploy happens before the env values are set.** That's impossible if you follow the order; if it happens anyway, the hosted site returns 500 naming the missing variable. Harmless.

## Backlog candidates (navigator to add)

- **B44 — Build-only strict CSP.** A `script-src 'self'` CSP applied to deployed builds only, via `public/_headers` or a Vite meta plugin, without breaking `netlify dev`.
- **B45 — GitHub continuous deploy.** Link the private repo through the Netlify GitHub App. Deploy from `main` only once CI runs `bin/check.sh`.
- **B46 — Access gate for the hosted coach.** A shared passphrase or sign-in if credit use shows abuse.

## Decisions for the user

1. **Set a credit limit on the OpenRouter key** used by Netlify (recommended; dashboard only). Optionally use a dedicated key via a separate env file.
2. Confirm B39, B40 and B41, plus the rate limit (20 requests a minute per IP), are in this slice.
3. Confirm the message cap: 8,000 chars.
