# Slice 41 (#41, P1): a shared-password gate for conference use

Today anyone with the URL can spend OpenRouter credit. The only guards are a per-IP rate limit (20/min) and whatever credit limit is set on the key. Steven wants conference attendees to use the hosted coach, so this slice adds **one shared passphrase**. There are no accounts.

After this slice, a first visit shows the purpose line, the data-flow notice and one field, "Conference password". The right password sets a signed HttpOnly cookie that lasts 7 days. `/api/chat` returns 401 without a valid cookie, **before** it reads the body or creates a coach. Everything stays stateless: the cookie is an HMAC over an expiry, keyed with the existing `COACH_SIGNING_KEY`, and it binds the current password. Changing `ACCESS_PASSWORD` invalidates every cookie.

## Goal fit

| Goal | How slice 41 contributes |
|---|---|
| Maximize learning | Stateless session tokens (MAC over an expiry vs a server session store), cookie attributes and what each one actually defends against, CSRF under SameSite, domain separation when one key does two jobs, constant-time compare, where rate limits fail (shared conference NAT), fail-closed config |
| Fun | Show the conference link on a slide, and the room is using it a minute later |
| Solve real DDD problems | Gets the coach in front of real practitioners with real messy threads, with spend bounded |

## Verified facts (2026-09-25)

**Code today:**
- `createChatHandler` checks in this order: method → `config.ok` → `signingKey.ok` → body cap → parse → verify → `replyFrom(createCoach(…))`. The coach is created only on the last step.
- `server/turnSignature.ts` holds a private `sameText(actual, expected)` that checks length and then runs `timingSafeEqual` over the UTF-8 bytes. The tag is `"ddd-coach/turn/v1"` and the input is `JSON.stringify([tag, prompt, reply])`.
- `readSigningKey(env)` fails closed below 32 chars. `present()` trims, and a blank value counts as missing.
- `askCoach`: `NOT_WORTH_RETRYING = [400, 413]`. A non-retryable failure (`isRefused`) puts the prompt back into the draft through `onRefused`.
- `App` renders `PurposeLine`, `DataFlowNotice` and `ConnectionTest`. `MessageBox` has `autoFocus`.
- Test harness:
  - `stubFetch` parses every call's `init.body` as JSON, so a bodyless GET would throw.
  - `appDriver.send` returns `fetchMock.mock.calls.length - 1` as the pending-call index, so any extra fetch shifts the indices.
  - There are 50 `renderApp()`/`startConversation()` call sites, and all of them read the textbox synchronously.

**Netlify** (from slice 2a, plus `node_modules` source read today):
- The legacy Free plan allows **2 code-based rate-limit rules per project**, and `chat` uses one. `RateLimitConfig = { windowLimit, windowSize ≤ 180, aggregateBy: "ip" | "domain" | both, action?, to? }`, and a limited request gets a 429 before the function runs.
- `netlify env:set` has **no prompt for the value**: the value is an optional argv (`[value]`, default `''`). With `--secret`, the log line prints the key only. Secrets need `--context production`, and env changes need a redeploy.
- Build secrets scanning (`@netlify/build` `secrets_scanning`) searches the repo and the build output for the values of env vars marked secret, unless `SECRETS_SCAN_OMIT_KEYS` lists them. Secret values can't be read back through the API, so the local CLI build doesn't see them. The scan matters once remote builds (B45) arrive.
- `*.netlify.app` is on the Public Suffix List, so another Netlify site can't set cookies for `ddd-coach.netlify.app`.

## Decisions

### Architecture: two small new functions, and a check in chat

| Endpoint | Function | Does | Rate limit |
|---|---|---|---|
| `POST /api/unlock` `{password}` | `netlify/functions/unlock.mts` → `server/unlockHandler.ts` | right password → **204** + `Set-Cookie`; wrong → **401** `{error}`; bad body → **400**; config missing → **500** | **rule 2 of 2** |
| `GET /api/session` | `netlify/functions/session.mts` → same module | valid cookie → **204**, otherwise **401**; config missing → **500** | none (cheap, never calls OpenRouter; no rule budget left) |
| `POST /api/chat` | existing | no valid cookie → **401** `{error: ACCESS_REQUIRED}` before the body is read | rule 1 (see the numbers below) |

- **Why separate functions, not chat extensions:** the unlock rate limit has to apply only to password guesses. `rateLimit` is per function, and chat already has its own rule. `session` would eat the guess budget if it shared `unlock`'s function (one GET per page load).
- **Why a status check instead of a client-side hint:** the cookie is HttpOnly, so JS can't see it. A `localStorage` "unlocked until" hint would skip the round trip, but it drifts from the server's truth after a rotation, and then needs 401 → clear hint → reload handling in `askCoach`. `GET /api/session` keeps the server as the only truth, for one small request per load.
- Both new responses carry `Cache-Control: no-store`.
- **DDD proportionality:** access is infrastructure, not coaching domain. There are no new domain types in `src/domain`, no aggregates and no service classes. The server side is pure functions given the key, the password and a clock. The client side is one API module, one hook and one component.

### Cookie format: HMAC over the expiry, reusing `COACH_SIGNING_KEY` with its own domain tag

```
coach_access=<exp>.<mac>
exp = Unix seconds, issued as now + 604800 (7 days)
mac = base64url(HMAC-SHA256(COACH_SIGNING_KEY, JSON.stringify(["ddd-coach/access/v1", exp, ACCESS_PASSWORD])))
```

`exp` is the exact digit string from the cookie, so there's no canonicalisation. A leading-zero variant simply MACs differently.

- **Reuse the key, not a new secret.** A third secret would mean another fail-closed reader, another `.env` line, another prod `env:set`, and another thing to rotate, for no real gain. Domain separation already makes the two uses independent:
  - the tags differ (`…/turn/v1` vs `…/access/v1`), so no turn signature can ever be a valid access MAC, and the reverse holds too. A unit test pins this;
  - a leaked key compromises both uses either way, since both live in the same function environment;
  - side effect: rotating `COACH_SIGNING_KEY` also logs everyone out. That's acceptable.
- **The password goes inside the MAC input and never into the cookie.** Setting a new `ACCESS_PASSWORD` and redeploying changes every expected MAC, so every old cookie fails. That's the rotation requirement at zero extra cost. Bumping the tag to `v2` also force-logs everyone out without changing the password.
- **The server checks the expiry itself** (`exp > nowSeconds`); it doesn't trust the browser's `Max-Age`. There's no sliding renewal.
- **Parse strictly before any crypto:** `/^(\d{1,12})\.([A-Za-z0-9_-]{43})$/`. Anything else is not admitted and doesn't throw. The MAC compare reuses `sameText`, compared as a string without base64-decoding (the lenient-decoding lesson from #37).

### Cookie attributes

`Set-Cookie: coach_access=<exp>.<mac>; Max-Age=604800; Path=/api; HttpOnly; Secure; SameSite=Lax`

| Attribute | Why |
|---|---|
| `HttpOnly` | XSS can't read the pass (replies are already rendered as text, slice 1) |
| `Secure` | **Always set, with no dev branch.** Chromium and Firefox accept `Secure` cookies from `http://localhost`, so `netlify dev` on :8888 works in agent-browser. Safari may drop them on plain http: use Chrome locally. A "Secure only if https" branch would be a downgrade path in production |
| `SameSite=Lax` (as the spec says) | A cross-site POST to `/api/chat` (form or fetch) doesn't carry the cookie, so it gets a 401. `Strict` adds nothing here: only same-origin `fetch` calls ever need the cookie, and the page itself is public |
| `Path=/api` | Only the API needs it, so static assets don't carry it. Unlock, session and chat all live under `/api` |
| No `Domain` | host-only |
| No `__Host-` prefix | Its protection (sibling-subdomain injection) is already covered by the PSL entry, and it adds a localhost-over-http question for no gain |

**CSRF:**
- `/api/chat`: under Lax, a cross-site POST has no cookie → 401. A cross-origin JSON POST also needs a CORS preflight, which the function never grants. That's two layers, and no Origin check is needed.
- `/api/unlock`: "login CSRF" would need the attacker to know the password, and it would only unlock the victim's own browser. Harmless.
- `/api/session` is a read-only GET.

### Password check: constant time

```ts
passwordMatches(given, expected) =
  timingSafeEqual(sha256(given.trim()), sha256(expected))   // both 32 bytes, so lengths never differ and nothing throws
```

- Hash both sides first, so neither the length nor the prefix leaks through timing. `expected` is already trimmed by `present()`.
- The match is **case-sensitive**. The field is `type="password"`, which iOS and Android don't auto-capitalise.
- The unlock body is read with `readJsonWithin(request, 1024)`.
  - Over 1 KiB, unparsable, or `password` not a string → 400 "Enter the conference password."
  - An empty string after trimming → 401, the same as wrong.
- **Nothing logs.** The unlock and session handlers have no log dependency, and Netlify doesn't log request bodies. Rate-limited requests never reach the function.

### Rate limits: the conference NAT problem (flag)

At a venue, most attendees share **one public IP** (the Wi-Fi NAT), and phones on cellular sit behind carrier NAT. So per-IP limits act as per-room limits.

- **`unlock`: `{ windowLimit: 30, windowSize: 60, aggregateBy: ["ip", "domain"] }`.**
  - The spec's 10/min would 429 most of a room unlocking together after a slide.
  - 30/min still makes online guessing slow: a 3-word passphrase (≈ 2³³ combinations) at 30/min is thousands of years, even from 100 IPs.
  - Against a *dictionary word* ("aggregate"), no per-IP limit helps much. **Passphrase strength is the real defence; the limiter is friction.**
  - Netlify's limiter is approximate, counted at the edge. Treat it as soft.
- **`chat` (existing 20/min/IP): raise it to `{ windowLimit: 300, windowSize: 60 }`.**
  - 100 people × ~3 messages/min from one venue IP is ~300/min. At 20, most of the room gets "The coach is unavailable."
  - The gate now bounds who can call chat, and the OpenRouter credit limit bounds spend. The per-IP rule only has to slow a scripted abuser who already has the password.
  - This is a one-line change to config that already exists, and it belongs to "conference use". **Approved.**
- Both rules use the 2 Free-plan rules. `session` gets none, and there's no budget left for future functions without dropping one.

### Fail closed, and how dev works

- `readAccessPassword(env)` goes in `server/config.ts` and returns `{ ok: true; password } | { ok: false; error: "ACCESS_PASSWORD is not set." }`. It has no minimum length; the passphrase advice below covers strength.
- If it's missing or blank in **any** environment:
  - `unlock` → 500;
  - `session` → 500, which the client treats as locked;
  - `chat` → 500 naming it. Chat never serves.
- Same for `COACH_SIGNING_KEY`, which unlock, session and chat all need.
- **No dev bypass.** Slice 37 rejected dev fallbacks because any "optional locally" branch (e.g. on `context.deploy.context === "dev"`) is a path where production could run open.
- **Dev uses a known, non-secret dev password.** The deployer appends it; it isn't secret because it only unlocks localhost:
  ```bash
  grep -q '^ACCESS_PASSWORD=' .env || echo 'ACCESS_PASSWORD=local-coach-dev' >> .env
  ```
  Then restart `npm run dev`. Agents may type `local-coach-dev` in local checks, since it's documented here. Production secrets are set for `production` only, so `netlify dev` doesn't pull them.
- `.env.example` gains `ACCESS_PASSWORD=`, with a comment: required; dev can use any value; production is set by Steven in the Netlify UI.

### How Steven sets the production password: the Netlify UI (decided)

Steven sets it himself, so the value never enters chat, the transcript, or a command line an agent runs. There's no script.

1. Netlify → project `ddd-coach` → Project configuration → Environment variables → Add a variable → key `ACCESS_PASSWORD`.
2. Tick **"Contains secret values"**, choose different values per deploy context, and fill **Production only**. Leave deploy previews and branch deploys empty; drafts already fail at `OPENROUTER_API_KEY` (2a).
3. Tell navigator "set". The deployer redeploys, because env changes need a redeploy, and runs the slice 2a Step C filter with `ACCESS_PASSWORD` added to the key list. It prints `set`/`absent` only.

Post-conference rotation is the same steps with a new value, then a redeploy. Secret values can't be read back in the UI, so Steven keeps the passphrase where he keeps the slide.

**Passphrase advice (for Steven):**
- Use three unrelated lowercase words joined by hyphens, easy to put on a slide, that appear nowhere in the app or repo text. For example "tidal-lantern-quartz", but not that one.
- If it's also a word in the repo, a future remote build (B45) fails secrets scanning. Fix that with a stronger phrase, or with `SECRETS_SCAN_OMIT_KEYS=ACCESS_PASSWORD`.

**Credit limit (flag, before the conference):**
- Set a credit limit on the OpenRouter key Netlify uses: about $0.023 per first turn on terra, and 100 people × 20 turns ≈ **$25–50**. Suggest a limit of about $50, ideally on a dedicated hosting key (swap it in with 2a Step B).
- The gate stops strangers, but not the password leaking to social media; rotate if it leaks and gets abused (the credit limit bounds the cost).

### UI

`App` gets an access state from `useAccess()`: `"checking" | "locked" | "open"`.
- On mount it calls `checkAccess()` → `GET /api/session`. 204 → `open`; anything else, including network failure or 500 → `locked`.
- `PurposeLine` and `DataFlowNotice` **always render**, above whichever state is showing, so the notice is on the gate for free.
- `checking`: `<p role="status">Checking access…</p>`. It's brief, and the gate never flashes for someone who already has a cookie.
- `locked`: `<AccessGate onUnlocked={…}/>`.
- `open`: `ConnectionTest`, as today. `MessageBox`'s `autoFocus` puts focus in the message box after unlock.

`AccessGate` (`src/ui/AccessGate.tsx`):
- It's a `<form>` with a `<label>` "Conference password" wired to `<input type="password" name="password" autoComplete="current-password" required autoFocus>`, plus a submit button, **"Enter"**.
- While pending, the button is disabled and reads "Checking…".
- Errors: `<p role="alert" id="access-error">`. The input gets `aria-invalid="true"` and `aria-describedby="access-error"`. **The value is kept** and focus goes back to the input.
- Messages, in `src/shared/accessContract.ts`, which the server uses too:
  - 401 → `ACCESS_WRONG_PASSWORD = "That password isn't right. Check the slide and try again."`;
  - 429 (the platform's plain-text body) → `"Too many tries from this network. Wait a minute, then try again."`;
  - 5xx, network or anything else → `"Could not check the password. Try again."`.
- It reuses the existing composer tokens (field, button). No new design tokens.

**Mid-conversation 401** (expired cookie or rotation):
- Chat returns `{error: ACCESS_REQUIRED}`, where `ACCESS_REQUIRED = "Your access has expired. Copy the conversation, then reload the page to enter the password again."`
- `askCoach` adds 401 to `NOT_WORTH_RETRYING`: no Retry, and the prompt goes back into the draft, as for any refusal.
- **No live switch back to the gate.** That would unmount the log; it's rare with a 7-day cookie, and "Copy conversation" already exists.
- **No logout.** It isn't needed; clearing site data does it.

### Server layout

```
src/shared/accessContract.ts   ACCESS_REQUIRED, ACCESS_WRONG_PASSWORD, ACCESS_BAD_REQUEST ("Enter the conference password.")
server/constantTime.ts         sameText (moved from turnSignature.ts, r commit)
server/accessPass.ts           ACCESS_COOKIE, ACCESS_MAX_AGE_S; createAccessPass(key, password) =
                               { issue(now): string /* Set-Cookie value */, admits(cookieHeader: string | null, now): boolean };
                               passwordMatches(given, expected); cookieValue(header, name)
server/config.ts               readAccessPassword(env)
server/unlockHandler.ts        createUnlockHandler({ access, signingKey, now }), createSessionHandler({ access, signingKey, now })
server/chatHandler.ts          deps gain access: AccessPasswordResult, now; 401 check after config checks, before readJsonWithin
netlify/functions/unlock.mts   path /api/unlock, rateLimit 30/60 ip+domain
netlify/functions/session.mts  path /api/session
netlify/functions/chat.mts     access: readAccessPassword(process.env), now: () => new Date(); rateLimit 300/60 (if approved)
src/api/access.ts              checkAccess(): Promise<"open" | "locked">; unlock(password): Promise<{ ok: true } | { ok: false; error: string }>
src/ui/useAccess.ts            state + unlock callback
src/ui/AccessGate.tsx          the form
src/App.tsx                    switch on access state
.env.example                   ACCESS_PASSWORD=
```

Chat handler order: method → coach config → signing key → **access password (500)** → **cookie (401)** → body cap → parse → verify → coach.

## Acceptance criteria

1. Given no valid cookie, a first visit shows the purpose line, the data-flow notice and a "Conference password" field with an "Enter" button, and no message box.
2. Given a wrong password:
   - an inline alert "That password isn't right…" appears;
   - the field keeps its value, is `aria-invalid`, and has focus;
   - the unlock response sets no cookie.
3. Given the right password (surrounding spaces ignored, case-sensitive):
   - unlock returns 204 with `Set-Cookie: coach_access=…; Max-Age=604800; Path=/api; HttpOnly; Secure; SameSite=Lax`;
   - the app shows the message box, focused;
   - a reload goes straight to the app (session 204).
4. Given `POST /api/chat` without a cookie, or with an expired, tampered, other-password, other-key or malformed cookie, or with a turn signature passed off as a cookie:
   - it returns **401** `{error: ACCESS_REQUIRED}`;
   - `createCoach` is not called and the body is not read.
   - With a valid cookie, every slice 2, 2a and 37 behaviour is unchanged.
5. Given a chat 401 in the UI, the entry shows `ACCESS_REQUIRED` with **no Retry**, and the prompt returns to the draft.
6. Given more than 30 unlock POSTs from one IP within 60 s, the extras get 429, and the gate shows "Too many tries from this network…".
7. Given `ACCESS_PASSWORD` is missing or blank (any environment), unlock and chat return 500 "ACCESS_PASSWORD is not set.", session returns 500, and the UI stays on the gate. The same applies with `COACH_SIGNING_KEY` missing.
8. Given `ACCESS_PASSWORD` changes and a redeploy, a cookie issued under the old password gets 401 from session and chat.
9. Given the production `dist/`, no asset contains `ACCESS_PASSWORD` or the password value. `src/` doesn't import `server/accessPass.ts` or `node:crypto`.
10. Session and unlock responses carry `Cache-Control: no-store`.

## Test order (outside-in; each red → green)

**Make the change easy first** (behaviour-preserving `r` commits):
- **r1:** move `sameText` to `server/constantTime.ts`.
- **r2:** harness.
  - `stubFetch` routes by URL: `GET /api/session` resolves 204 by default (option `{ session: 401 }`), and only `/api/chat` and `/api/unlock` calls enter the pending queue. A bodyless call records `body: undefined`.
  - `send` returns the pending-queue index, not `mock.calls.length - 1`.
  - `renderApp` becomes `async`, installs a default stub when the test hasn't, and awaits the message box.
  - All 50 call sites get `await`. This passes before the gate exists, because nothing fetches `/api/session` yet.

**Acceptance** (`src/acceptance/accessGate.test.tsx`, driving `<App/>`):
1. Session 401 → the "Conference password" textbox (a password input has no textbox role, so use `getByLabelText`), the notice text and the purpose line are visible; `queryByRole("textbox", {name: "Message"})` is null (AC1). Predicted failure: no field; the message box renders.
2. Type "nope", Enter → unlock body `{password: "nope"}` → reply 401 `{error: ACCESS_WRONG_PASSWORD}` → alert text, value `"nope"`, `aria-invalid`, focus on the field (AC2).
3. Right password → 204 → the message box is visible and focused (AC3).
4. Unlock 429 plain text → the "Too many tries…" alert (AC6, client side).
5. Chat 401 `{error: ACCESS_REQUIRED}` → the entry shows it, no Retry, and the draft holds the prompt (AC5).
6. Update `onLoad.test.tsx`: the notice test also asserts the notice is visible on the gate.

**Client API** (`src/api/access.test.ts`; `askCoach.test.ts`):
7. `checkAccess`: 204 → `"open"`; 401, 500 or a throw → `"locked"`, and it GETs `/api/session`.
8. `unlock`: 204 → ok; 401 with an error → that error; 429 text → too many; 502 or a throw → "Could not check…"; it POSTs `{password}` as JSON.
9. `askCoach`: 401 with an error → `retryable: false`.

**Server handlers** (`server/unlockHandler.test.ts`, node env, with a real `createAccessPass` on `TEST_SIGNING_KEY` and a fixed `now`):
10. Right password → 204; parse `Set-Cookie` into attributes and assert each (AC3). The cookie admits at `now`.
11. `"  pw  "` with `ACCESS_PASSWORD=pw` → 204. `"PW"` → 401. Wrong → 401 `ACCESS_WRONG_PASSWORD` and **no** `Set-Cookie`.
12. Non-JSON, `{password: 42}`, or a body over 1 KiB → 400. GET → 405.
13. `access` missing → 500 "ACCESS_PASSWORD is not set."; `signingKey` missing → 500 naming it.
14. Session: valid cookie → 204; none, expired or forged → 401; missing config → 500; both carry `no-store` (AC10).

**Chat handler** (`server/chatHandler.test.ts`):
15. First, update the `post()` helper so every existing request carries a valid cookie issued from the test pass, with `access` and `now` added to `handler()` defaults. Existing tests stay green.
16. `it.each` of no cookie, expired, tampered exp, tampered MAC, other password, other key, `coach_access=garbage`, and a turn signature as the MAC → 401 `ACCESS_REQUIRED`, `createCoach` not called. **Body-not-read proof:** send a body over `MAX_BODY_BYTES` without a cookie and expect 401, not 413 (AC4).
17. `access: {ok: false}` → 500 (AC7).

**Unit** (`server/accessPass.test.ts`, `server/config.test.ts`):
18. `issue` → `coach_access=<exp>.<43 chars>` with `exp = floor(now/1000) + 604800`. `admits` is true at `now` and at `exp - 1 s`, false at `exp` and after.
19. `admits` is false for:
    - a different password;
    - a different key;
    - exp +1 with the old MAC;
    - a leading-zero exp;
    - a 42- or 44-char MAC;
    - `+/` in place of `-_`;
    - a missing dot;
    - an empty header;
    - a `null` header.

    None of these throws.
20. `admits` finds the cookie among others (`a=1; coach_access=…; b=2`) and ignores `xcoach_access=…`.
21. Domain separation: `createTurnSigner(key).sign({prompt: exp, reply: password})`, used as the MAC, doesn't admit.
22. `passwordMatches`: equal → true; different, and different lengths → false without throwing; trims the given side.
23. `readAccessPassword`: missing or whitespace → "ACCESS_PASSWORD is not set."; set → the trimmed value.
24. Mutation checks (verifier, `retroactive-test-check`):
    - remove the expiry check → 18 fails;
    - drop the password from the MAC input → 19 (different password) and AC8 fail;
    - move the 401 check after `readJsonWithin` → 16's body proof fails.

**Config and ops** (no unit tests): the `rateLimit` numbers in `unlock.mts` and `chat.mts`. Builder, locally:
- `curl -si -X POST localhost:8888/api/unlock -d '{"password":"local-coach-dev"}'` shows the `Set-Cookie` line;
- replaying that cookie with `curl -b` against `/api/session` gives 204.

That proves `netlify dev` passes the cookie through.

**Commits** (through committer):
- `r` constantTime;
- `r` harness;
- `feat` access pass + config;
- `feat` unlock and session functions;
- `feat` chat 401;
- `feat` gate UI + askCoach 401;
- `chore` rate limits + `.env.example`.

## Env and deploy sequence

1. **Deployer, local:** append the dev password (the command above) and restart `npm run dev` in tmux `ddd-coach`.
2. **Deployer, production:** set a **throwaway demo password**. It's generated, never printed, and written to a scratch file outside the repo, readable only by Steven's user account (mode 600):
   ```bash
   DEMO_PASS_FILE="$SCRATCH/slice-41-demo-pass"   # the session scratchpad dir, never under the repo
   node -e '
   const { spawnSync } = require("node:child_process");
   const { randomBytes } = require("node:crypto");
   const { writeFileSync } = require("node:fs");
   const value = "demo-" + randomBytes(6).toString("hex");
   writeFileSync(process.argv[1], value, { mode: 0o600 });
   const r = spawnSync("npx", ["netlify", "env:set", "ACCESS_PASSWORD", value, "--secret", "--context", "production", "--force"],
     { encoding: "utf8", stdio: ["ignore", "ignore", "pipe"] });
   console.log(`ACCESS_PASSWORD: ${r.status === 0 ? "set" : "FAILED " + (r.stderr ?? "").split(value).join("[REDACTED]")}`);' "$DEMO_PASS_FILE"
   ```
   - Verify with the Step C filter, then send the verifier the file **path**, never the value.
   - Then `bin/check.sh` → `deploy --prod`. **Order matters:** deploying first leaves the site locked (unlock 500) until the value is set. That fails closed and is harmless.
3. **Verifier:** the hosted demo below. It reads the value only through command substitution (`"$(cat "$DEMO_PASS_FILE")"`), so the value never appears in a command line the transcript records.
   - Check the first `agent-browser fill` output doesn't echo the value. If it does, stop, have the deployer rotate the demo value, and switch to `agent-browser eval` that reads a `window` variable set by that eval.
   - Delete the file after the last curl: `rm "$DEMO_PASS_FILE"`.
4. **Steven:** sets the real conference passphrase in the Netlify UI (above) and tells navigator "set".
5. **Deployer:** redeploys and runs Step C (`set`).
6. **Verifier:** reloads the demo browser → the gate is back, because the demo cookie is invalidated (AC8). Then a `curl` unlock with the old demo value, run before the file is deleted, → 401. **Steven** enters the real passphrase himself → the app works.

## Demo script (verifier, hosted URL)

Use `agent-browser --session verifier` with a fresh profile (no cookie) and one caption per step. Record `outputs/demos/slice-41.webm`. Every paid message includes a nonce line, and the model is recorded.

1. Open `https://ddd-coach.netlify.app`. Caption: "Slice 41 (#41): a shared password for the conference." The gate shows the field, the purpose line and the data-flow notice. **Screenshot at 1280×800 → `outputs/demos/slice-41.png`** (outside the recording).
2. Type `not-the-password`, Enter → inline error, and the field keeps the value. Caption: "Wrong password: an inline error; the coach isn't called."
3. Fill the field with `"$(cat "$DEMO_PASS_FILE")"` → the app appears with the message box focused. Caption: "Right password: a 7-day HttpOnly cookie."
4. Send "Nonce <n>. My company is Eazy Freight; our carrier is Maersk. Reply only OK." → reply. Then "Which carrier? One word." → Maersk. Caption: "Chat works behind the gate; memory is intact."
5. Reload → straight to the app (the session check passes). Caption: "Remembered for 7 days."
6. `record stop`.

Off-video, record the output in `outputs/demos/slice-41.md`:
- `curl -si -X POST $U/api/chat -H 'Content-Type: application/json' -d '{"message":"hi","history":[]}'` → 401 `ACCESS_REQUIRED`, with its `time_total`. **Before OpenRouter:** the OpenRouter activity count doesn't change (Steven checks the dashboard, or the verifier compares key usage before and after), and there's no "Coach failed" in the function logs. The handler test (16) is the proof of order.
- The same request with a forged `-b 'coach_access=9999999999.AAAA…'` → 401.
- The unlock via `curl -si` with the body built from `"$(cat "$DEMO_PASS_FILE")"` → 204 plus the `Set-Cookie` attributes as listed.
- Session with and without that cookie → 204 and 401, with `cache-control: no-store`.
- `grep -rc ACCESS_PASSWORD dist` and `grep -rcF -f "$DEMO_PASS_FILE" dist` → all 0.
- **Last:** `for i in $(seq 35); do curl -s -o /dev/null -w "%{http_code} " -X POST -d '{"password":"x"}' $U/api/unlock; done` → 401 × ~30, then 429s. Record how soft the limit is: the exact count where 429 starts.
- Then steps 4–6 of the env sequence (rotation). Record the result, then delete the scratch file.

Part B, locally, fail closed: `ACCESS_PASSWORD= npm run dev` gives unlock 500 and chat 500 "ACCESS_PASSWORD is not set.", and the UI stays on the gate with "Could not check the password…". Restart normally. Navigator confirms :8888 is free to restart first.

## Out of scope

- Accounts, per-person passwords, SSO, captcha.
- A logout button, sliding renewal, or a cookie per conference day.
- A live return to the gate mid-conversation (copy + reload instead).
- An Origin/Referer check (SameSite + CORS preflight suffice).
- Server-side session storage.
- A global spend cap in code (the OpenRouter credit limit does this).
- Per-password analytics.
- A build-only CSP (B44) and GitHub CD (B45).

## Risks

- **Shared NAT at the venue.** Per-IP limits act per room. That's the reason for 30/min on unlock and the proposed 300/min on chat. If the venue still trips them, the fallback is to raise the numbers (config and a redeploy, ~2 min).
- **A weak passphrase.** A single dictionary or DDD word is guessable despite the limiter, which is approximate and soft. Use three random words, and rotate only on abuse (see the rotation note below).
- **The password leaks** (photo of the slide, social post). Spend is bounded only by the OpenRouter credit limit. Rotate in the Netlify UI and redeploy.
- **Cookie across `netlify dev` vs production.** `Secure` on `http://localhost` works in Chromium and Firefox, but may not in Safari. The builder's local curl check and the agent-browser run confirm it. Production is https with HSTS.
- **The first load gets one extra request** (the session check; a cold start can take a few hundred ms). The "Checking access…" status covers it.
- **Rule budget exhausted.** Both Free-plan rate-limit rules are used, so any future function can't have its own rule.
- **Secrets scanning on future remote builds** fails if the passphrase appears in the repo (see the passphrase advice).
- **The harness refactor touches 50 test call sites.** Keep it a separate `r` commit so the `feat` diffs stay small.
- **Rotating `COACH_SIGNING_KEY` logs everyone out.** Intended; note it in the rotation steps.
- **The demo password is live in production** until Steven sets the real one (step 4). It's never printed, but rotate the same day and delete the scratch file.

## Decisions (approved 2026-09-25)

1. **Steven sets the production `ACCESS_PASSWORD` himself in the Netlify UI** (secret, Production only). No script.
2. **The hosted demo uses a throwaway password.** The deployer generates it, it's never printed, and the verifier reads it from a mode-600 scratch file outside the repo, deleted afterwards. Then Steven sets the real one and we redeploy, which also demonstrates rotation.
3. **Rate limits:** unlock 30/min per IP, and chat raised from 20 to 300/min per IP (venue NAT).
4. **Reuse `COACH_SIGNING_KEY`** with the `ddd-coach/access/v1` tag. Rotating it logs everyone out.
5. **Dev:** the deployer appends `ACCESS_PASSWORD=local-coach-dev` to `.env` (append only; no read).
6. **For Steven:**
   - **Passphrase:** three random lowercase words joined by hyphens, not a DDD term, and nowhere in the repo, so a future remote build doesn't fail secrets scanning. Rotate only on abuse.
   - **Before the conference, set an OpenRouter credit limit:** about $50, ideally on a dedicated hosting key. The estimate is $25–50 for 100 people × 20 turns.

**Rotation (90-day pass):** rotate `ACCESS_PASSWORD` only on abuse. Rotating right after the conference would break the "unlocked for 90 days" promise to attendees (PO, #72). To rotate: change it in the Netlify UI, then redeploy. The password is part of the cookie MAC, so every existing pass stops working at once.

**As built (supersedes earlier sections where they differ):** the pass lasts 90 days (`ACCESS_MAX_AGE_S` = 7,776,000, 4f038cf). ACCESS_REQUIRED reads "Your access has expired. Enter the conference password below, then send your message again." and the password form appears inline above the composer (9520203). A session check that can't reach the server shows "Can't reach the coach" with Try again (d07c68c). Steven set the production password directly, so no throwaway demo password was used.
