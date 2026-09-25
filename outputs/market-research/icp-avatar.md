# ICP avatar: DDD Coach

Fictional composite, used for synthetic interviews after each slice. It stands in for real users and does not replace them. Every insight tagged *synthetic* still needs a real practitioner to confirm it.

## One-line ICP

A working developer or tech lead on a team with a messy business domain. They have read some DDD, want to use it on real code this quarter, and have nobody around who has done it before.

## Avatar: Priya Raman

| Field | Detail |
|---|---|
| Role | Senior backend engineer who acts as tech lead, 8 years of experience |
| Company | Mid-size logistics SaaS company (~250 people, 40 engineers). Freight booking, carrier integrations, customer portal |
| Stack | TypeScript/Node services, a legacy Rails monolith, Postgres, Kafka at the edges |
| DDD exposure | Read half of the Blue Book, all of *Learning DDD* (Khononov), and watched Brandolini's talks. Joined one remote EventStorming session on Miro that "fizzled after 90 minutes" |
| Team | 5 engineers, 1 PM, 1 domain expert (ex-ops lead) who is busy |
| Trigger | Asked to split "Booking" out of the monolith. Nobody agrees what a "booking" is: ops, finance and carriers each mean something different |

## Jobs to be done

1. **Functional:** find the boundaries and the vocabulary for one workflow before committing to a service split.
2. **Functional:** turn fuzzy stakeholder talk into events, rules and open questions she can take into planning.
3. **Emotional:** avoid looking like she is cargo-culting DDD jargon in front of the staff engineer who thinks DDD is "enterprise astronaut stuff."
4. **Social:** run a modeling session that the domain expert finds worth their time.

## Pains

- The books are abstract, and the examples (cargo, banking) don't map onto her mess.
- EventStorming needs a facilitator and a room. Remote boards turn into sticky-note soup, and nobody knows what to do next.
- ChatGPT gives confident, generic answers ("you should have a Booking aggregate") without asking questions.
- She can't tell whether her model is *good*. There is no feedback loop until production hurts.
- The domain expert has about 1 hour a week.

## Gains she would pay attention to

- Something that asks the *next good question* the way an experienced facilitator would.
- A visible artifact (timeline, open questions) she can screenshot into a design doc or ticket.
- Learning the technique while doing real work, not through a course.
- Surfacing disagreement ("ops says X, code says Y") instead of hiding it.

## Current alternatives

Miro/FigJam EventStorming templates, ChatGPT/Claude chat, the DDD-Crew GitHub repos (Bounded Context Canvas, Context Mapping), books, and hoping a consultant visits. Context Mapper DSL is tried and abandoned: "too much ceremony."

## Buying and adoption

- Tries free tools herself, bringing in the team only after one solo win.
- Company-paid tools need a manager's OK above about $20/user/month. Personal spend is fine up to about $15/month if it clearly saves hours.
- Trust killers: hallucinated DDD "rules", a mandatory account before first value, a tool that insists on its own method.
- Privacy: she hesitates to paste proprietary code or workflows into an unknown hosted tool. Needs to know where the data goes.

## Watering holes

DDD Europe/Explore DDD talks, Virtual DDD meetups, the DDD-CQRS-ES Discord, r/softwarearchitecture, Mastodon/Bluesky tech circles, and Khononov's and Brandolini's posts.

## Anti-ICP (not designing for)

- Seasoned DDD consultants who facilitate weekly. They want a better Miro, not a coach.
- Students with no real domain. They learn from the conversation but have nothing to model.
- Enterprise architects looking for a modeling-governance repository.

## Open tension to resolve

The session handoff targets **"developers new to DDD."** The loop brief says **"DDD practitioners."** Priya sits in the overlap: she practices DDD on real work but is early in her mastery. If the target shifts to experienced practitioners, the voice-coach-first direction weakens and board fidelity plus export matter more.
