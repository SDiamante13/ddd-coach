# DDD Coach: initial domain discovery

Status: first analysis, not a validated domain model. User requirements are confirmed below; classifications, names, and boundaries remain proposals until explored with examples.

## Purpose and scope

Help a developer new to DDD understand one business workflow, its key exception, and shared vocabulary. The product constructs a shared visual model while guiding the conversation. Diagrams and stickies are the primary surface; captions default on and transcript history is optional. See [generative UI direction](generative-coach-direction.md).

We are modeling the coaching product. Eazy Freight is a separate subject domain used to exercise and evaluate it. A freight Booking must not silently become a concept in the coaching application's own model.

## Evidence ledger

| Evidence ID | Confirmed requirement | Source |
| --- | --- | --- |
| U01 | Serve developers new to DDD. | User's audience interview answer. |
| U02 | First exercise outcome: a workflow, a key exception, shared vocabulary. | User's revised build brief. |
| U03 | Begin with one text field and a real AI reply log; add voice in later slices. | User's original request and text-first clarification. |
| U04 | Use a short Eazy Freight briefing, then ask about gaps and exceptions. | User's context interview answer. |
| U05 | Use OpenRouter SDK; key and model configured through `.env`. | User's provider decision. |
| U06 | Accept files and GitHub URLs as context, with automatic processing and few interruptions. | User's context and friction requests. |
| U07 | Optional application guardrails default off. | User's backlog direction. |
| U08 | Bring Katacombs sensors after slice 4 or 5; plan currently places them at 5. | User's sensor request; documented planning choice. |
| U09 | Apply DDD while building; research authoritative material and develop analysis-quality enforcement. | Current user request. |
| U10 | Run the analysis-quality sensor in our development process only, for now. | User’s sensor-scope interview answer. |
| U11 | Coach builds diagrams and stickies, choosing Example Mapping, EventStorming, or another useful technique; captions on by default, transcript optional. | User’s generative UI correction. |

These IDs refer to this conversation, not external citations. External DDD literature supports modeling methods; it does not prove these product requirements or a visitor's business rules.

## Candidate language

| Term | Proposed meaning | Important distinction |
| --- | --- | --- |
| Coaching session | A visitor and coach exploring a particular domain problem. | Different from an HTTP request, provider conversation ID, or browser session. |
| Contribution | Something the visitor tells the coach. | A statement may describe a fact, guess, preference, or correction. |
| Context source | An attached document, GitHub file, or supplied briefing. | A source is evidence to interpret, not automatically business truth. |
| Domain claim | An assertion about an actor, event, rule, term, or relationship. | Keep its source and uncertainty visible. |
| Model proposal | The coach's tentative interpretation of domain claims. | A generated answer is not automatically an agreed model. |
| Hotspot | A contradiction, unresolved question, or uncertainty worth exploring. | Ordinary processing failures are not domain hotspots. |
| Workflow | A sequence of meaningful business actions and outcomes, including alternatives. | More than a list of HTTP calls or screen transitions. |
| Working model | Domain understanding represented by a board of events, rules, examples, questions, and relationships. | The model is distinct from a diagram layout and a conversation transcript. |
| Modeling view | A technique-specific representation, such as an event timeline or Example Map. | Changing views should preserve the identities and provenance of relevant domain facts. |
| Board edit | A bounded change to a card or relationship that can be corrected or undone. | A UI action is not automatically a domain event. |
| Working recap | A concise summary of the current model. | Secondary to the board; different from a verbatim transcript. |
| Analysis review | A check of reasoning and evidence quality at a particular revision. | Different from visitor agreement or expert validation. |

## Candidate capabilities and boundaries

**Coaching and evolving domain understanding** is the candidate core: deciding the next useful question, interpreting examples, surfacing inconsistencies, and helping revise a model. Its differentiating value still needs evidence from real sessions.

**Acquiring and preparing context** is a supporting capability: reading sources and retaining enough identity to explain where a claim came from. Start as a module. A separate bounded context is not justified just because GitHub and file loading use different APIs.

**Text generation, speech, and hosting** are externally supplied capabilities. The model provider's message schema should be translated at the integration boundary; it need not become our domain vocabulary.

Initial implementation hypothesis: one application and one coaching model. Discover additional bounded contexts only when language, rules, or ownership actually diverge. A bounded context does not require independent deployment.

## First concrete example

1. The visitor says they arrange cargo shipments and asks about booking.
2. The coach uses the short Eazy Freight briefing and asks who decides the next step after carrier rejection.
3. The visitor explains that an operations coordinator chooses another sailing and resubmits.
4. The coach proposes the rejection/resubmission branch and asks about an unresolved detail.
5. The working recap distinguishes the visitor's statement from any proposed inference.

Steps 3–5 require later slices. Slice 1 proves only the real request/reply path. This example proposes a visitor statement; the source trace alone does not establish that actor assignment as fact.

## Domain questions before imposing rules

- What makes a proposal accepted: explicit agreement, a visitor correction, or another signal? Avoid turning every claim into a confirmation dialog.
- What happens when the visitor contradicts an attached document? Preserve both accounts and investigate; do not silently pick a winner.
- If a source is removed, what should happen to conclusions previously based on it? Removing future source text does not erase the earlier conversation.
- What defines the end of useful coaching: a recap, visitor confidence, or an explicit modeling decision?
- When does a changed source require revisiting the model rather than simply asking another question?

## Candidate rules to test with examples

- A source-supported claim should identify its supporting source; an inference should remain distinguishable from that claim.
- Conflicting statements should remain visible until their relationship is understood.
- A review applies to the artifact revision it actually inspected. Changes make that review stale.
- The coach should not declare a missing exception impossible merely because it has not yet been discussed.

These are proposed product rules, not discovered aggregate invariants. We have not established transactional consistency needs or aggregate boundaries. Do not introduce a Session aggregate, event store, or repository abstraction simply to satisfy DDD terminology.

## Useful event candidates for discovery

`ContextAttached`, `WorkflowProposed`, `DomainClaimCorrected`, `HotspotRaised`, and `WorkingRecapRevised` describe potential meaningful outcomes. Check the names with the product owner. They are modeling aids, not a commitment to publish events or persist an event log.

## How we use DDD in each build slice

1. Bring one concrete user example and its failure or exception.
2. Clarify terms and distinguish confirmed facts from hypotheses.
3. State the observable behavior and the smallest rule needed to produce it.
4. Implement that thin slice and check the example.
5. Review the changed analysis and code for contradictions; revise the language and model together.

For slice 1, the meaningful technical failure is an unavailable AI reply. Preserve the submitted message and retry without duplicating it in the log. Treat this as application behavior; it does not establish a complex domain model by itself.

## First analysis review

- **Observed strength:** product domain and freight example are distinguished; requirements have provenance; proposed boundaries are explicitly tentative.
- **Open gap:** we have no observed novice coaching sessions yet. Claims about which questions improve learning remain hypotheses.
- **Open gap:** acceptance/correction of model proposals needs a concrete example before a state machine is designed.
- **Current verdict:** useful discovery draft; not expert-validated business truth and not a finished tactical design.
