# DDD Coach backlog

Status: candidate work, separate from the 14 planned slices (1, 2, 2a, then 3–13). Promote individual items when needed; do not automatically expand slice 1.

## Confirmed deployment milestone

Slice **2a**, immediately after slice 2: publish a working preview to **Sites or the user’s Netlify**. Target is chosen during implementation. Include the server-side OpenRouter endpoint and hosted environment configuration; verify a real two-turn exchange and failure/retry at the resulting URL. Existing board and sensor slice numbers remain 4 and 5.

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

## First candidates to turn into slices

| ID | Candidate | Smallest observable result | Acceptance check | Suggested dependency |
| --- | --- | --- | --- | --- |
| B01 | Drop one text file | Drop a `.txt` or `.md` file onto the coaching screen; it becomes context for the next reply. Include an attachment button for keyboard/mobile access. | Drop a short Eazy Freight glossary, then ask about a term. The reply uses its definition; the filename and ready state appear inline. A failed read shows an inline retry/remove action. | After slice 2; candidate before deeper coaching work. |
| B02 | Start coaching from a dropped file | A successful drop automatically produces a brief acknowledgment and one relevant question. | A new visitor drops a workflow note without typing or pressing Send. The coach asks about a gap or exception; no import dialog appears. | B01. |
| B03 | Remove attached context | Remove a file from the active context using its inline attachment chip. | The next request excludes the removed file body. The interface makes clear that previous conversation messages remain. | B01. |
| B04 | Drop a text-based HTML explanation | Extract readable content from one HTML file and attach its source name. | Drop the supplied Eazy Freight shipment trace. Coaching can refer to its booking section; scripts and styling do not become conversational content or execute. | B01. |
| B05 | Add a second source | Include two attachments in the same session with source attribution. | Drop two notes that disagree. The coach identifies which source says what and asks the visitor to resolve the discrepancy. | B01. |
| B06 | Refresh the recap automatically | Update the existing workflow recap after the visitor supplies a new confirmed fact. | Explain carrier rejection/resubmission. The recap adds the exception without a separate Generate action. Keep it inside the coaching screen. | Slice 4. |
| B07 | Make optional guardrails configurable | Add a small server configuration for one optional topic restriction; default is disabled. | With default configuration, the coach follows a visitor’s change of topic without an app-added topic gate. When explicitly enabled, the restriction is observable and reversible. | First demonstrated need; separate behavior-preserving refactor before integration if required. |
| B08 | Read a text-based PDF | Extract text from one PDF using the same attachment flow. | A readable PDF contributes context. An image-only PDF gets an accurate inline unsupported message, not an empty success. | B01; OCR remains separate. |
| B17 | Attach a public GitHub file URL | Fetch one text file and make it available to the coach automatically. | Attach a public Markdown or source-file URL. The reply uses its content and identifies the file/revision; invalid or unavailable links show an inline recovery action. | Shared attachment context from B01; generalize that mechanism in a separate refactor commit first if needed. |
| B18 | Attach a public repository URL | Resolve the revision, read its README and file listing, then retrieve a small set of relevant text files as coaching needs them. | Attach a repository URL and ask about a workflow. The coach names the files it read and asks about missing context; it does not imply it read the whole repository. | B17. |

These are proposed extraction points, not new numbered commitments. B01–B02 and B17 are the leading context candidates for the next planning session.

## Generative UI candidates

The [generative coach direction](generative-coach-direction.md) supersedes the chat-first mockup. B11 is now core product work, not a decorative future board.

| ID | Candidate | Acceptance check | Dependency |
| --- | --- | --- | --- |
| B22 | One Example Map | Select a workflow event; coach creates a story with one rule, concrete example, and open question. Original event remains linked and visible. | Slice 4 board actions. |
| B23 | Captions on by default | A spoken exchange shows current captions. CC hides them immediately without stopping voice or board updates. They do not accumulate into chat history. | Speech output/input slices. |
| B24 | Optional transcript drawer | Visitor explicitly enables transcript capture and opens it on the same screen. Default is off/closed; define capture timing explicitly. | Conversation + voice turns. |
| B25 | Coach selects a useful technique | Coach opens an Example Map when exploring a rule, explains the move briefly, and preserves the originating timeline and fact identities. | B22; real coaching examples. |
| B26 | Stable focus while the board evolves | Visitor pans away; new coach edits do not yank the viewport back. Follow coach restores focus when wanted. | Slice 4. |
| B27 | Point and speak | Select a sticky and say “rename this”; the intended card changes, with undo available. | Slice 4 correction + voice input. |

## Development tooling candidate

**B21 — DDD analysis-quality sensor (development only).** Review our domain analysis, language, scenarios, and boundary decisions as we build. Attach this to the slice 5 sensor integration, then implement one small increment at a time: charter → receipt validator → trigger → reasoned review → hook liveness proof. See [sensor contract](ddd-analysis-sensor.md), [initial domain analysis](ddd-domain-analysis.md), and [research sources](ddd-research.md).

Acceptance: a seeded unsupported business claim produces a located, evidence-backed finding and a useful next question; a simple slice is not rejected for lacking aggregates; stale or unavailable review never looks current. Do not add a reviewer or enforcement gate to live coaching sessions. Hook implementation remains pending.

## Friction checks for every promoted slice

- A first-time visitor can understand the next action from the main screen.
- A routine action does not open another window or require a confirmation modal.
- Pending, ready, and failed states appear beside the relevant message or attachment.
- Automatic actions do not duplicate messages or discard the visitor’s current contribution.
- The next conversational question is asked only when the answer is needed; routine processing continues automatically.

For file slices, choose the first supported format and a clear size/context limit during implementation. Show unreadable or oversized files honestly, preserve the conversation, and let the visitor recover inline.

## Later ideas awaiting refinement

| ID | Idea | Evidence needed before slicing |
| --- | --- | --- |
| B09 | Images, scanned PDFs, and diagrams | Examples where visual context changes coaching quality. |
| B10 | Read a selected local project folder | Need for local/uncommitted context beyond individual file drops; verify browser support and selected-folder permissions. Read-only, limited to the chosen project. |
| B11 | Promoted: generative event board | Core direction confirmed; replace slice 4’s text-only recap with sub-slices 4a–4d. See generative-coach-direction.md. |
| B12 | Saved sessions and projects | Repeat visits that need prior context, plus a retention decision. |
| B13 | Additional DDD exercises | A concrete next exercise requested by pilot users. |
| B14 | Team facilitation | A real multi-person session with clear turn-taking needs. |
| B15 | Accounts | A demonstrated need for ownership or cross-device history. |
| B16 | Three.js / GSAP visuals | A specific interaction that improves understanding. |
| B19 | Private GitHub repositories | A pilot using private code; add repository-scoped authentication when needed. |
| B20 | Local companion with ongoing project access | Repeated context refresh needs that a web folder selection cannot satisfy; justify installation and maintenance cost. |

## GitHub versus local files

Recommendation: support both, beginning with public GitHub links and dropped local files. GitHub supplies shared, committed context; local files supply private drafts and uncommitted work. Neither replaces the other.

Broader local access remains a proposal: let the user select a project folder and automatically read within that scope. Start read-only; coaching does not require changing source files. Browser directory access requires user interaction and permission, and `showDirectoryPicker()` is not supported uniformly. Preserve file attachment as the fallback. Source: [MDN directory picker](https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker).

The hosted server cannot use the visitor’s `/Users/...` path as a local filesystem path. Selected content must be supplied by the browser, or through a later local companion. Since replies use OpenRouter, reading locally does not mean inference stays on the device.

Use one source representation for dropped files and GitHub results: source identity, revision when available, readable content, and load state. Keep selection/loading separate from the coach’s conversation. In the eventual voice experience, GitHub links are context attachments, with no conversational text composer.

## Promotion rule

Select one backlog ID, define one visible behavior and its failure recovery, confirm dependencies, and assign a slice number. Record the mapping here and update the HTML plan. Preserve the current slice 1 boundary and the planned sensor integration after slice 4 unless explicitly rescheduling them.
