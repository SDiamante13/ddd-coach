# DDD Coach backlog

**Work items live in GitHub Issues: https://github.com/SDiamante13/ddd-coach/issues** — owned by the PRODUCT OWNER session. B-numbers are kept in issue titles. Labels: `P1`/`P2`/`P3`, `type:*`, `icp`, `icebox` (#33), `slice:*`. Decisions awaiting Steven: label `type:decision`.

This file keeps product direction and rules only.

## Confirmed product direction

- One coaching screen centered on a generative modeling board: diagrams, stickies, file context, and microphone controls. The earlier chat-first mockup is superseded.
- Closed captions default on with a visible CC toggle; a full transcript is optional and closed by default.
- The coach chooses a useful modeling technique as the discussion evolves, preserving prior work and supporting immediate corrections.
- First-time visitors can start immediately. No onboarding wizard, mandatory tutorial, account gate, or provider settings in their path to a first reply. OpenRouter configuration belongs to the app operator.
- Dropping a file expresses intent to use it as session context. Read it automatically, show progress inline, and continue coaching without a separate import approval step.
- Accept a GitHub URL as a context source alongside dropped files. Reuse the same inline source status and removal controls.
- Automatically organize context, suggest the next useful question, and refresh the working recap as supporting capabilities arrive.
- Optional application guardrails default off. Topic restrictions, enforced exercise order, and approval checkpoints can be added as explicit configuration later.
- Keep basic visuals. Text supports early slices; the final voice experience has no text composer. File attachment remains available alongside voice.

## Friction checks for every promoted slice

- A first-time visitor can understand the next action from the main screen.
- A routine action does not open another window or require a confirmation modal.
- Pending, ready, and failed states appear beside the relevant message or attachment.
- Automatic actions do not duplicate messages or discard the visitor’s current contribution.
- The next conversational question is asked only when the answer is needed; routine processing continues automatically.

For file slices, choose the first supported format and a clear size/context limit during implementation. Show unreadable or oversized files honestly, preserve the conversation, and let the visitor recover inline.

## GitHub versus local files

Recommendation: support both, beginning with public GitHub links and dropped local files. GitHub supplies shared, committed context; local files supply private drafts and uncommitted work. Neither replaces the other.

Broader local access remains a proposal: let the user select a project folder and automatically read within that scope. Start read-only; coaching does not require changing source files. Browser directory access requires user interaction and permission, and `showDirectoryPicker()` is not supported uniformly. Preserve file attachment as the fallback. Source: [MDN directory picker](https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker).

The hosted server cannot use the visitor’s `/Users/...` path as a local filesystem path. Selected content must be supplied by the browser, or through a later local companion. Since replies use OpenRouter, reading locally does not mean inference stays on the device.

Use one source representation for dropped files and GitHub results: source identity, revision when available, readable content, and load state. Keep selection/loading separate from the coach’s conversation. In the eventual voice experience, GitHub links are context attachments, with no conversational text composer.

## Promotion rule

Pick one issue, define one visible behavior and its failure recovery, confirm dependencies, assign a slice label, and update the HTML plan. Parked ideas move out of the icebox (#33) into their own issue only with the listed evidence.
