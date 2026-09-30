# Slice 5 (#5): keep the session across a reload, in this browser only

The spec is issue #5's body. It's browser-only, with no paid calls and no server storage. It builds after #96 (the React Flow board) and #123.

## Goal fit

- **Real problem:** a reload loses the conversation and every board edit, which the board makes worse.
- **The shared entity model:** #100 (glossary) and #90 (statuses) build on the same entityId keys, so the stored board is a replayable action log, not a snapshot.

## Design

**One versioned entry.** The key is `ddd-coach.session.v1`, holding `{ version: 1, exchanges, visitorActions }`.
- **exchanges:** as sent, with prompts in swapped space and their turn signatures, so the server still verifies the history.
- **visitorActions:** the entityId-keyed corrections and links (#95, #96). Card positions join this log as a `moveCard` action when #20 adds drag. The board is replayed as `boardOf(exchanges, visitorActions)`, exactly as it is live.
- **Swaps** keep their own store (#56). They already outlive a conversation, and "New conversation" doesn't clear them.
- **The glossary** keeps its own store (#100). It deliberately outlives a conversation.

**Reading and writing.**
- The entry is read once on mount and written on every change. Every read and write is in `try/catch`.
- On load it's validated with type guards: exchange shape and status, the prompt via `parsePrompt`, the signature a string, and each action's shape.
- **Fail safe:** corrupt JSON, another version or any invalid entry loads an empty session and never throws. A throwing `setItem` (quota or blocked storage) is ignored.
- **A pending exchange at reload** comes back as failed, with Retry: "The page reloaded before the coach answered."

**Clearing.**
- "New conversation" clears the entry, the visitor actions and the log.
- #68's offer to start with the last pasted thread still works: it reads the exchanges before they're cleared.

**Signed history.**
- Turn signatures are an HMAC of prompt and reply under `COACH_SIGNING_KEY`. They don't expire and don't depend on the access session.
- A restored history only turns unverified if the signing key rotates. The server then refuses it as unverified, and the existing refusal offers "New conversation" (#84).

## Copy (same slice)

The words follow the behaviour.
- **Notice:** "This browser keeps your conversation and board until you start a new conversation; your word swaps, with real names, stay until you delete them. Nothing is stored on our server."
- **/data, "What stays in your browser":** the same, in full, and it says that "New conversation" clears the conversation and board.

## Acceptance tests (outside-in)

1. A reload keeps the conversation, the board, and the corrections and links (render again after `cleanup`).
2. "New conversation" clears the stored session. Swaps survive, and the copy says so.
3. Corrupt JSON loads an empty session, and so does an old or unknown version.
4. Storage that throws on read or write never crashes the app.
5. A pending exchange at reload comes back as a retryable failure.
6. A restored history refused as unverified shows the refusal with "New conversation", not a broken state.
7. The notice and /data copy, pinned.

## Known limits (v0)

- **Two tabs:** the last write wins, with no `storage`-event sync.
- **Positions:** none until #20 adds drag.
- **Storage size:** capped only by the existing message and conversation limits. A quota error is ignored, so the session simply isn't saved.
