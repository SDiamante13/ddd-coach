from pathlib import Path
p=Path('outputs/ddd-coach-backlog.md')
s=p.read_text().replace('- One coaching screen: conversation, file context, and microphone controls together.', '- One coaching screen centered on a generative modeling board: diagrams, stickies, file context, and microphone controls. The earlier chat-first mockup is superseded.\n- Closed captions default on with a visible CC toggle; a full transcript is optional and closed by default.\n- The coach chooses a useful modeling technique as the discussion evolves, preserving prior work and supporting immediate corrections.')
s=s.replace('| B11 | Visual event board | A pilot where an ordered text workflow is insufficient. |', '| B11 | Promoted: generative event board | Core direction confirmed; replace slice 4’s text-only recap with sub-slices 4a–4d. See generative-coach-direction.md. |')
s=s.replace('## Development tooling candidate', '''## Generative UI candidates

The [generative coach direction](generative-coach-direction.md) supersedes the chat-first mockup. B11 is now core product work, not a decorative future board.

| ID | Candidate | Acceptance check | Dependency |
| --- | --- | --- | --- |
| B22 | One Example Map | Select a workflow event; coach creates a story with one rule, concrete example, and open question. Original event remains linked and visible. | Slice 4 board actions. |
| B23 | Captions on by default | A spoken exchange shows current captions. CC hides them immediately without stopping voice or board updates. They do not accumulate into chat history. | Speech output/input slices. |
| B24 | Optional transcript drawer | Visitor explicitly enables transcript capture and opens it on the same screen. Default is off/closed; define capture timing explicitly. | Conversation + voice turns. |
| B25 | Coach selects a useful technique | Coach opens an Example Map when exploring a rule, explains the move briefly, and preserves the originating timeline and fact identities. | B22; real coaching examples. |
| B26 | Stable focus while the board evolves | Visitor pans away; new coach edits do not yank the viewport back. Follow coach restores focus when wanted. | Slice 4. |
| B27 | Point and speak | Select a sticky and say “rename this”; the intended card changes, with undo available. | Slice 4 correction + voice input. |

## Development tooling candidate''')
p.write_text(s)
p=Path('outputs/ddd-coach-plan.html')
s=p.read_text().replace('One useful conversation first.', 'A shared model, built together.')
s=s.replace('A basic web app that helps people reason about their domain. Start with a reply log and one text field. Progress to voice as the default, with no typing in the voice session.', 'A voice-led modeling workspace. The coach builds diagrams and stickies while you explore your domain. Captions default on; the full transcript is optional. Early text slices prove the connection before the board takes center stage.')
s=s.replace('<section class="panel"><h2>First useful outcome</h2>', '<section class="panel"><h2>Generative UI is the product</h2><p>The shared board is the main surface. The coach places events, connects a workflow, and opens an Example Map when a rule needs concrete examples. Small edits, stable positions, immediate correction and undo.</p><p>Closed captions default <strong>on</strong> with a CC toggle. Transcript history is optional and closed by default. The earlier chat mockup is superseded.</p><p><a href="generative-coach-direction.md">Read the interaction proposal and improvements</a></p></section>\n<section class="panel"><h2>First useful outcome</h2>',1)
s=s.replace('One text field → one real AI reply in a log.</strong>', 'Internal connection test: one text field → one real AI reply in a log.</strong>')
s=s.replace('The whole-session learning outcome arrives through slices 2–4.', 'The shared-board experience arrives through slices 2–4; this connection test is not the intended product layout.')
s=s.replace("{title:'Recap the workflow and exception',phase:'Text',change:'A recap action shows one ordered business workflow, its key exception, shared vocabulary, and unresolved questions.',check:'For Eazy Freight, recap the booking flow and carrier rejection/resubmission branch. Preserve the visitor’s meaning of request, submission, carrier confirmation, and customer confirmation; mark unknowns.',exclude:'A text recap; no diagram or export system.'}", "{title:'Build the first shared board',phase:'Generative board',change:'Split into 4a: add one event sticky; 4b: correct that same sticky and undo; 4c: connect two events; 4d: add an open-question sticky.',check:'Describe carrier rejection. See the event appear, correct its wording without duplicating it, connect it to submission, and retain the open question about what happens next.',exclude:'One small event board first. Example Mapping and adaptive technique selection follow as separate backlog slices.'}")
s=s.replace('The visible reply remains available.', 'Current captions are on by default with an easy CC toggle; a full transcript is optional.')
s=s.replace('Its transcript enters the log and the coach responds.', 'Its words appear as current captions and the coach responds; persistent transcript capture is optional.')
s=s.replace('The log, microphone state, pause, and end controls remain visible.', 'The board, default-on captions, CC toggle, microphone state, pause, and end controls remain visible; transcript history is optional.')
s=s.replace('Ending the voice session produces the same recap introduced in slice 4.', 'Ending the voice session leaves the current board and unresolved questions available to inspect.')
s=s.replace('Keep the log, attachments, and voice controls in the same coaching surface.', 'Keep the board, attachments, captions, and voice controls in the same coaching surface; open transcript history only on request.')
s=s.replace('Keep a readable log and explicit microphone pause/end controls.', 'The final experience centers on a generative modeling board with captions on by default, an easy CC toggle, an optional closed transcript drawer, and explicit microphone pause/end controls.')
s=s.replace('Begin with one text input and an AI reply log.', 'Use one text input and an AI reply log only as the first internal connection test. Build the shared event board in slice 4, in small separately demonstrable steps.')
s=s.replace('after the workflow recap and before speech', 'after the first shared-board progression and before speech')
s=s.replace('Defer visual boards, Three.js, and GSAP to later design sessions.', 'The board is core: event stickies first, then Example Mapping and other techniques as useful. Defer Three.js and GSAP polish.')
s=s.replace('Draft 06', 'Draft 07')
p.write_text(s)
