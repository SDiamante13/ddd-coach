# A shared modeling board, guided by voice

Confirmed direction: the coach constructs diagrams and stickies as the visitor talks. The evolving domain model is the primary interface. Closed captions default on and are easy to disable. A full session transcript is optional and closed by default.

The earlier chat mockup is superseded. Slice 1's text field and reply log remain an internal connection test, not the intended product experience.

## The interaction to prove

Visitor: “The carrier can reject the booking.”

The coach adds **Booking rejected by carrier** to the event timeline, connects it to submission, and asks: “What happens next?”

Visitor: “We choose another carrier and resubmit.”

The coach adds the return path and marks the actor as an open question if the visitor has not identified who chooses. The changed region briefly highlights. The visitor can say “Move that before confirmation,” “Rename that,” or “Undo.”

Only add the facts needed for the current exchange. A large complete-looking diagram can falsely suggest that discovery is finished.

## Choose the technique to serve the question

| Need | Surface | Coach behavior |
| --- | --- | --- |
| Understand what happens and where it stalls | EventStorming-style event timeline | Place events, mark uncertainty, investigate alternatives and hotspots. |
| Clarify a rule in a specific story | Example Map | Organize story, rules, concrete examples, and questions. |
| Understand conflicting meanings or responsibilities | Candidate context map | Show proposed boundaries and their rationale; keep them tentative. |
| Specify how information produces behavior | Event Model | Connect commands, events, and views with concrete examples when the workflow is sufficiently understood. |

Example Mapping's story/rule/example/question structure is documented by [Cucumber](https://cucumber.io/docs/bdd/example-mapping/). EventStorming is a flexible collaborative exploration practice, not just a diagram format: [original site](https://www.eventstorming.com/). Event Modeling is a distinct technique: [original explanation](https://eventmodeling.org/posts/what-is-event-modeling/).

The coach can say “Let’s test that rule with an example” and open an Example Map anchored to the selected event. Avoid repeatedly replacing the whole board or asking beginners to choose a method before they know what it does. Preserve the original timeline and the identity of the fact under discussion.

## What would improve the experience

- **Stable spatial memory:** add and update small regions; preserve positions the visitor has moved. A “Follow coach” control can focus the active area without constantly dragging the viewport away.
- **Explain edits through the activity:** point at the sticky being discussed, briefly highlight additions, and speak one short explanation. No separate confirmation dialog for routine edits.
- **Easy correction:** support “not that,” rename, move, connect, and undo. Let the visitor point to or select a card so “this rule” has an unambiguous referent.
- **Visible uncertainty:** mark proposed facts and unresolved questions with labels, not just colors. Source details are available on selection rather than crowding every sticky.
- **Progressive detail:** begin with a few events. Add actors, rules, examples, and boundaries only when useful. Treat unanswered questions as progress in discovery, not an error state.
- **Captions as a lightweight overlay:** the current utterance appears near the voice controls. CC toggles it off. Captions do not accumulate into a feed. Showing captions and keeping a full transcript are separate preferences.
- **Optional transcript:** an explicitly opened, same-screen drawer for conversation history. Define whether enabling it captures only subsequent turns before implementation; do not imply that hidden captions are saved. Speech recognition still processes speech for the voice interaction when captions are hidden.
- **Continuous ownership:** the user can pause, interrupt, correct, or undo. The board should feel shared, not like a presentation the AI controls.

## Minimum useful generative UI

Start with one technique and one reliable loop: **describe an event → coach places a sticky → correct it → coach updates the same sticky**. Add connections and a hotspot next. Example Mapping follows once this loop is trustworthy. Voice can then control these already-tested actions.

Keep the renderer stable. The model proposes small typed actions such as `addEvent`, `renameCard`, `connectCards`, and `addQuestion`. The application applies them to a board with stable card IDs and supports undo. It should not regenerate an unrelated page after each utterance. Provider messages, conversational history, domain facts, and visual layout serve different purposes.

These are application correctness mechanics, not an additional user-facing approval system. OpenRouter remains the text/model integration. The development DDD sensor remains development-only.

## Roadmap change

- Preserve slices 1–3 as the smallest connection, continuity, and coaching groundwork.
- Insert slice 2a after slice 2: publish a working preview to Sites or the user’s Netlify, including the server-side OpenRouter route and hosted environment values.
- Replace the text-only recap in slice 4 with a small board progression: 4a one generated event sticky; 4b correct the same sticky and undo; 4c connect two events; 4d mark one unresolved question. Each is separately demonstrable.
- Keep development sensors at slice 5.
- Add captions when speech is introduced, default on with a visible CC toggle. The final surface is the board, microphone controls, captions, and context attachments.
- Promote Example Mapping and optional transcript into explicit backlog candidates. Rich technique selection follows evidence from the first board exercise.

Success test: after a short Eazy Freight discussion, the visitor can point to the workflow and its rejection/resubmission path, correct a mistaken card, and explain one unresolved question without reading a chat history.
