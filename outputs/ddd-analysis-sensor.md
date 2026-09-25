# DDD analysis sensor: proposed contract

Status: design specification. No hook is installed or reported as active. Placement remains alongside the Katacombs integration at slice 5. Confirmed scope: our development process only. No live-session analysis gate is planned.

## Intent

Detect weak domain analysis, explain why it matters, and suggest the next small discovery move. The sensor evaluates reasoning and evidence, not whether the prose uses enough DDD terms.

The existing Katacombs design sensor reviews implementation design. This proposed sensor has a different closed charter: domain language, examples, claims, boundaries, and unresolved business questions. Reuse its detect → coach → trigger pattern and receipt validation; do not expand its existing questions until their meaning becomes ambiguous.

## Two kinds of checks

**Mechanical checks:** validate review structure, required question coverage, referenced artifact existence, claim/source references, and exact revision coverage. Check that claimed quotations or locations exist where feasible. These checks cannot determine that a source is correct or that a quotation supports an inference.

**Reasoned review:** inspect the actual analysis and evidence. Evaluate the questions below. Record up to three consequential findings, each with the observed passage, evidence, impact, and smallest useful correction or next question. A reviewer may honestly report no findings; a blank or stale review is not equivalent to no findings.

## Initial active checks

Start with D02 (conflicting vocabulary), D03 (unsupported claims), and D04 (missing exception). The broader charter below guides manual discovery review; activate additional automated review criteria only when a concrete slice needs them. The [first manual review](ddd-analysis-review.md) demonstrates the full charter without claiming hook execution.

Source mapping: D01/D05 draw on Khononov’s business analysis and boundaries; D02 on Evans’s ubiquitous language; D03/D07 on collaborative knowledge discovery; D04/D08 on concrete scenarios and information flow; D06 on Vernon’s invariant-based aggregate design. The provenance and review-receipt mechanisms are our engineering choices, not prescriptions from those books. See [verified source links](ddd-research.md).

## Closed review charter

| ID | Question | Evidence expected | Useful feedback |
| --- | --- | --- | --- |
| D01 | Is the business goal and modeling scope explicit? | Actor, desired outcome, one scenario, scope boundaries. | Identify the missing actor or outcome; ask one specific question. |
| D02 | Are important terms used consistently within the stated context? | Short glossary and examples; divergent meanings named. | Point to the conflicting usages instead of enforcing a preferred textbook noun. |
| D03 | Are business claims supported and distinguished from hypotheses? | Conversation/source references; uncertainty and provenance. | Name the unsupported claim and propose how to test it. |
| D04 | Does the workflow include a meaningful exception or a named gap? | Trigger, outcome, actor/decision, exception and recovery. | Ask what happens in one concrete rejected, cancelled, delayed, or conflicting case. |
| D05 | Are proposed boundaries motivated by language or rules? | The actual semantic or ownership difference; alternative interpretation. | Mark a module-derived boundary as a hypothesis, not an established context. |
| D06 | Are rules and consistency needs grounded in examples? | A rule with an example and counterexample; a reason consistency must hold. | Challenge a proposed aggregate without inventing one in its place. |
| D07 | Are contradictions, corrections, and unknowns preserved? | Competing sources, unresolved hotspot, proposed resolution. | Identify where a correction was dropped or an uncertainty was silently resolved. |
| D08 | Is the next modeling move proportional to the current slice? | Connection between scenario, decision, implementation, and validation. | Remove an unjustified pattern requirement or suggest the next smallest experiment. |

Each question receives `supported`, `gap`, or `not-applicable`, with evidence or a rationale. For early discovery, a named uncertainty can be an honest answer. For slice 1, no aggregate design may be applicable. Marking every tactical question not-applicable must not hide a later, explicitly complex business rule.

## Trigger and modes

Proposed development trigger: at the end of a turn that changes domain analysis, glossary, domain-oriented acceptance examples, or relevant rules. Skip unchanged content. Run the cheap checks first and request a reasoned review only when that material settles.

Default mode: `advisory`, with findings recorded inline and in a report. An optional `required-review` mode can require a valid current receipt before a selected development milestone. It must distinguish missing/unavailable review from a reviewed artifact with open findings. This mode concerns development artifacts only; it does not introduce a user-facing coaching guardrail.

The hook should not call the user for permission to perform routine review. It should return an actionable brief to the development agent. Cap repeated review requests for an unchanged artifact, prevent recursive invocation, and never allow timeouts or unavailable reviewers to appear as successful review.

## Review receipt

Required fields:

- `charterVersion`: the criteria that were applied.
- `artifactRevisions`: path/source ID and content hash for each reviewed artifact.
- `reviewedAt` and `reviewer`: provenance, not proof of expertise.
- `answers`: D01–D08 with status, evidence references, and rationale.
- `findings`: at most three; criterion, location, observation, consequence, next move.
- `limitations`: unavailable sources, untested claims, or missing expert validation.

Invalid references, uncovered changed artifacts, or hash mismatches make the receipt invalid/stale. Validation of a receipt means the review is traceable; it does not certify its conclusions.

## Small implementation increments

1. **Charter and example review:** manually apply these questions to the initial domain analysis and revise noisy criteria.
2. **Receipt validator:** accept a complete current review; reject missing question coverage, fabricated references, and stale hashes. No model call yet.
3. **Development hook:** create a scoped review request when analysis changes, record findings, and prove it actually fires. Adapt the existing Katacombs trigger/gate infrastructure before adding parallel machinery.
4. **Reviewer integration:** use the chosen review mechanism to supply evidence-backed answers; surface unavailable and incomplete states explicitly.
5. **Exercise the hook:** run one changed-analysis case, one unchanged case, and one stale-receipt case. Record trigger evidence before calling the integration complete. Runtime reuse is outside the current scope.

## Evaluation cases

- A small request/reply slice with no aggregate: acceptable without inventing tactical DDD.
- An analysis equating carrier confirmation with customer confirmation: D02 or D03 finding, grounded in the Eazy Freight evidence.
- A model asserting every rejected booking is cancelled: D03/D04 finding, because the inspected booking code permits resubmission.
- Two conflicting definitions retained as a hotspot: no finding merely for being unresolved.
- A complete receipt tied to an old artifact hash: stale, not reviewed-current.
- A missing source, failing reviewer, or timeout: unavailable/incomplete, never a silent pass.
- A fluent analysis with many DDD terms but no concrete workflow: D01/D04 finding.

Evaluate review usefulness with seeded flawed and acceptable examples plus human review. Report which defects it catches and which acceptable cases it wrongly flags. Do not use a scalar DDD score or claim the sensor guarantees good business analysis.

## Research grounding

Use [the DDD research reading list](ddd-research.md) to anchor the charter in original sources. These questions are a proposed development rubric, not a published standard or a book-author endorsement.

## Skill improvements identified

- Strategic DDD guidance should not make independent deployment a mandatory bounded-context test.
- DDD guidance should require scenario-based justification before prescribing aggregates, value objects, CQRS, or event sourcing.
- The design-sensor workflow could add artifact hashes to make review freshness explicit and reuse the recorder for a separate, versioned domain-analysis charter.
