# DDD research for the live coach

Product update: the user has since made generative diagrams and stickies the primary experience. The text-only MVP recommendation below is historical; see [the current direction](generative-coach-direction.md). Example Mapping reference: [Cucumber’s official guide](https://cucumber.io/docs/bdd/example-mapping/).

Research date: 2026-09-24. Recommendation: use a small, attributed reference set and evidence-based review questions. The proposed sensor applies **only to our development process for now**. It reviews our analysis and slice decisions; a runtime coach reviewer is deferred. A design sensor can expose unsupported conclusions; it cannot certify that a business model is true.

## Seven sources worth building around

These are recommendations for this product, not a universal ranking. Authors, titles, availability, and relevant topics were checked against original author or publisher pages. Commercial book interiors were not comprehensively read during this research.

| Source | Why it belongs here | Access and verification |
|---|---|---|
| **Vlad Khononov — [Learning Domain-Driven Design](https://www.oreilly.com/library/view/learning-domain-driven-design/9781098100124/)**, O’Reilly, 2021 | Best starting spine for the builder: business analysis, shared language, boundaries, tactical choices, and EventStorming. Start with chapters 1–4; consult 5–6 and 10 when deciding how much modeling code needs. | **Paid/restricted book.** Publisher description and contents verified. Free alternatives for selected concepts: Evans’s reference and the official EventStorming material below. |
| **Eric Evans — [Domain-Driven Design: Tackling Complexity in the Heart of Software](https://www.informit.com/store/domain-driven-design-tackling-complexity-in-the-heart-9780321125217)**, Addison-Wesley | Foundational treatment of knowledge discovery, language, model/code alignment, and strategic design. Its cargo-shipping example is relevant background for Eazy Freight, but must not be mistaken for Eazy Freight’s actual rules. | **Paid book.** Publisher page and contents verified. The publisher supplies a sample chapter; the free reference below is a companion, not a substitute for the explanations. |
| **Eric Evans — [Domain-Driven Design Reference: Definitions and Pattern Summaries](https://www.domainlanguage.com/ddd/reference/)**, 2015 | Compact terminology anchor for the coach and reviewer: bounded context, ubiquitous language, domain events, aggregates, and core domain. | **Free, CC BY 4.0.** Author page and [reference PDF](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf) verified. The author explicitly describes it as a reference for readers who already know the principles. |
| **Vaughn Vernon — [Implementing Domain-Driven Design](https://www.informit.com/store/implementing-domain-driven-design-9780321834577)**, Addison-Wesley, 2013 | Implementation reference when real invariants justify tactical modeling. Particularly useful for challenging aggregates chosen only because objects are related. | **Paid book; free authorized [aggregate chapter](https://www.informit.com/articles/article.aspx?p=2020371).** Publisher metadata, contents, and sample reviewed. |
| **Alberto Brandolini — [Introducing EventStorming: An act of Deliberate Collective Learning](https://www.eventstorming.com/book/)**, [Leanpub edition](https://leanpub.com/introducing_eventstorming) | Original inventor’s facilitation guidance. Useful for uncovering disagreements, process problems, and missing knowledge through collaborative exploration. | **Paid, unfinished book.** Official author site says Big Picture mechanics are covered more fully than Process/Software Design. A publisher-provided sample is available. |
| **Evelyn van Kelle, Gien Verschatse, Kenny Baas-Schwegler — [Collaborative Software Design: How to facilitate domain modeling decisions](https://www.manning.com/books/collaborative-software-design)**, Manning, 2024 | Helps design a coach that asks useful questions, includes missing perspectives, and handles uncertainty instead of merely reciting pattern definitions. Covers facilitation and decision-making alongside modeling methods. | **Paid/restricted book.** Publisher overview and [public welcome](https://livebook.manning.com/book/collaborative-software-design/welcome/v-10) verified. |
| **Adam Dymitruk — [Event Modeling: What is it?](https://eventmodeling.org/posts/what-is-event-modeling/)**, 2019 | Primary introduction to a solution blueprint: connect commands, events, and views; trace information; elaborate concrete scenarios. Useful when turning a discovered workflow into small implementation slices. | **Free article.** Original article and [method history](https://eventmodeling.org/about/) reviewed. Performance/cost claims remain the method author’s claims, not independently established guarantees. |

### Source confidence and limits

All linked domains were accessed on 2026-09-24: `oreilly.com`, `informit.com`, `domainlanguage.com`, `eventstorming.com`, `leanpub.com`, `manning.com`, `livebook.manning.com`, and `eventmodeling.org`. They are primary author/publisher sources, treated here as medium-high practitioner authority (0.8 on the source-verification skill’s scale), not empirical proof of effectiveness.

Bibliographic details and stated coverage: **verified**. DDD’s emphasis on business knowledge, language, and model boundaries: **corroborated across distinct authors/publishers**, although these works share intellectual foundations. Claims that any method or AI hook reliably produces correct models: **unverified**. Most sources sell books, training, or services; recommendations use their descriptions of practices, not marketing promises.

## Keep the practices distinct

- **Strategic DDD:** decide where models and meanings apply, what matters to the business, and how areas relate. **Tactical DDD:** express rules within those boundaries using appropriate implementation patterns. Khononov’s contents explicitly separate these and include simpler implementation approaches. [Learning Domain-Driven Design](https://www.oreilly.com/library/view/learning-domain-driven-design/9781098100124/)
- **EventStorming:** collaborative exploration of domains and processes. A solo AI-guided text exercise can borrow its questions, but cannot reproduce the knowledge contributed by multiple domain participants. [Introducing EventStorming](https://www.eventstorming.com/book/)
- **Event Modeling:** a more explicit information-flow blueprint involving inputs, events, outputs, and examples. An ordered event list alone is an early artifact, not a complete Event Model. Neither an event map nor DDD commits this MVP to event sourcing. [Original explanation](https://eventmodeling.org/posts/what-is-event-modeling/), [method history](https://eventmodeling.org/about/)

For the first exercise, keep the promised outcome: **one business workflow, one key exception, and shared vocabulary**, expressed as an ordered text event map. Visual boards and elaborate tactical patterns are unnecessary for this outcome.

## Candidate design-sensor questions

The following are **our proposed review heuristics**, derived from the cited practices. They are not an official DDD certification checklist. Apply only the questions relevant to the current slice; early exploration may legitimately answer “unknown.”

| Review question | Evidence expected | Starting behavior / source |
|---|---|---|
| Whose problem is this workflow solving, and where does it start and end? | Actor, desired business result, trigger, stopping point, explicit exclusions. | Ask about the biggest missing item. [Khononov](https://www.oreilly.com/library/view/learning-domain-driven-design/9781098100124/) |
| Which claims came from a person or artifact, and which were inferred? | Claim → conversation turn, file location, or source reference; `confirmed`, `inferred`, or `open` status. | Flag untraceable assertions. This provenance scheme is our adaptation of collaborative knowledge discovery. [Collaborative Software Design](https://www.manning.com/books/collaborative-software-design) |
| Do the events describe business facts, and can we explain their ordering? | Event names, actor/trigger where known, sequence rationale; uncertainty where steps may overlap. | Suggest clarification, not grammar-only rejection. [Evans reference](https://www.domainlanguage.com/ddd/reference/), [Dymitruk](https://eventmodeling.org/posts/what-is-event-modeling/) |
| Does an important exception change the story? | One concrete alternate scenario: precondition, attempted action, outcome, and any recovery. | Ask what happens when the happy path cannot proceed. Our exercise-specific requirement, informed by [Event Modeling’s scenario elaboration](https://eventmodeling.org/posts/what-is-event-modeling/). |
| Are important terms used consistently within their stated scope? | Small glossary with meanings, examples, aliases, and disputed terms. | Flag conflicting meanings; do not force a global glossary across distinct contexts. [Evans reference](https://www.domainlanguage.com/ddd/reference/) |
| If we propose a boundary, what evidence motivates it? | Differing meanings, responsibilities, rules, or ownership; a rationale and open questions. | Mark speculative boundaries provisional. [Khononov](https://www.oreilly.com/library/view/learning-domain-driven-design/9781098100124/) |
| If we propose an aggregate, which rule must always hold within its consistency boundary? | Business invariant, invalid transition example, and required consistency timing. | Defer this question until tactical design is needed. [Vernon’s authorized invariant discussion](https://www.informit.com/articles/article.aspx?p=2020371&seqNum=2) |
| Can we trace a slice from user intent to observable outcome? | Command/input → resulting fact or failure → user-visible information; an example acceptance check. | Use when specifying implementation, not as a prerequisite for initial discovery. [Dymitruk](https://eventmodeling.org/posts/what-is-event-modeling/) |

### Smallest useful development-hook proposal

After our domain-analysis or slice-design artifact changes, review **only its changed claims** against the development conversation and attached context. Return a short list of findings with `ruleId`, `claimId`, `evidenceRefs`, `finding`, and `nextQuestion`. Evidence presence and valid references can be checked deterministically; semantic agreement remains a fallible AI judgment. This is a development-time review contract, not an application feature or an installed hook.

Start with three advisory checks: unsupported claims, missing exception, and conflicting vocabulary. Keep “not enough evidence” distinct from “wrong.” Avoid an aggregate quality score or mandatory pattern counts. Report findings in our development workflow. Any later blocking rule should be explicit and testable; observation can remain automatic while enforcement stays configurable. The hook should neither run on learners’ messages nor interrupt the user-facing coaching experience in the current scope.

Before promoting the hook into enforcement, evaluate it on a tiny set of deliberately flawed and acceptable examples: fabricated business fact, missing exception, conflicting term, valid draft with acknowledged unknowns, and a simple workflow requiring no aggregate. Record false alarms and missed problems. These are proposed product evaluation cases, not validated performance results.

## Apply DDD while building this app

Keep two models separate: **the coaching product’s own domain** and **the domain the learner is exploring**. “A learner corrects a proposed event” belongs to the former; a shipment event belongs to the latter. Terms and conclusions must not leak between them.

For our own discovery, explore: learner brings context → coach offers a provisional interpretation → learner supplies/corrects details → workflow, exception, and vocabulary become reviewable. This is a hypothesis to interview about, not an approved implementation model.

For Eazy Freight, begin with the requested source-based briefing, label gaps, then ask about exceptions. Repository behavior can establish what code currently does; it does not alone establish what the business intends. This research did not inspect Eazy Freight or Katacombs, so it makes no claims about their actual rules or hook interfaces.

## Tiny reading set and grounding plan

1. **Builder:** Khononov chapters 1–4, then the relevant implementation chapter when a concrete decision arises.
2. **Coach reference:** Evans’s freely licensed reference, retaining author, source, license, and adaptation attribution. The author identifies the current reference as [CC BY 4.0](https://www.domainlanguage.com/ddd/reference/).
3. **Exercise design:** Brandolini’s official introduction/sample; consult the book when deepening facilitation. Add Dymitruk’s article when the plan needs implementation scenarios.

For our development review, use a short, reviewed set of original concept notes and questions with source URLs and section references. Keep book knowledge separate from user-provided domain evidence. These notes can inform a future coach grounding design, but that integration is deferred. Link paid books for readers; do not scrape or bundle their full text. Only ingest material whose applicable permissions cover the intended use; buying a book alone should not be treated as permission to redistribute its text in the app. Prefer the explicitly licensed reference as the initial source corpus.

For each reference note, keep: concept, short original explanation, applicability, counterexample, source/section, rights basis, and review date. For each business claim, keep its own domain evidence and status. A source can explain what an invariant means without proving a proposed Eazy Freight invariant exists.

Skill improvement: extend source-verification guidance with an explicit “original practitioner / publisher” tier, and distinguish verified bibliographic facts from unverified effectiveness claims. A numeric reputation score should never imply scientific validation.
