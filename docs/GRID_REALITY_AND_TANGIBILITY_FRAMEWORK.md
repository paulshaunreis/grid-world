# Grid World Reality & Tangibility Framework

Date: 2026-10-06
Status: Foundational design proposal — lore canon + technical architecture; legal/scientific claims require appropriate real-world sourcing

## Core premise

Grid World does not treat "digital" as the opposite of "real."

A digital event can produce a real-world consequence. A real-world event can enter Grid World as data, law, culture, evidence, inspiration, danger, or story. A physical object, digital artifact, fictional narrative, simulation, scientific hypothesis, and cultural myth can therefore have different ontological status while still participating in the same chain of consequences.

The governing question is not simply: "Is this real?"

It is: "What kind of thing is this, what evidence supports it, what world does it belong to, and what consequences can it actually produce?"

Grid World should make that distinction part of its identity.

## Reality is layered, not binary

Every important lore object, claim, event, character, place, artifact, document, image, simulation, or anomaly should carry a machine-readable Reality Profile.

### R0 — External Reality
Claims about the physical, social, legal, or scientific world outside Grid World.
Examples: a real scientific discovery, real law, historical event, real person, or real-world security incident.
Requirements: source/date where practical, confidence/evidence status, jurisdiction when relevant, and no fictional embellishment presented as fact.

### R1 — Grid Reality
Things materially real within Grid World's implemented platform: accounts, stored items, owned parcels, server-side events, recorded messages, and generated world state.
An R1 event can have R0 consequences even though its primary medium is digital.

### R2 — Simulated Reality
Rules, physics, ecology, economies, NPC behavior, generated environments, and other systems intentionally simulated by Grid World.
R2 is real as computation and experience while its simulated objects do not automatically become R0 physical objects.

### R3 — Fictional / Narrative Reality
Stories, legends, quests, historical reconstructions, fictional civilizations, characters, and authored lore.
R3 can be emotionally and culturally meaningful without being represented as an R0 fact.

### R4 — Hypothesis / Speculation
Scientific, technological, philosophical, or in-world hypotheses that are not established facts.
R4 must remain visibly distinguishable from established knowledge.

### R5 — Myth / Rumor / Unverified Signal
Claims circulating without sufficient evidence.
Rumors can become gameplay or story content, but the system must not silently upgrade them into facts.

### R6 — Reality-Bending Anomaly
A special Grid World narrative category for phenomena that deliberately blur boundaries between R0/R1/R2/R3.
An anomaly is not permission to falsify reality. It is a controlled narrative/system state whose uncertainty is explicit.

## The Tangibility Principle

A thing can be digital and still be consequentially real.

Example consequence chain:
USER ACTION -> GRID EVENT -> DATA/ECONOMIC/SOCIAL EFFECT -> REAL-WORLD CONSEQUENCE

Possible consequences include money or contractual activity, reputation, employment or creator opportunities, privacy exposure, emotional harm, physical safety decisions, legal/regulatory consequences, and public impact.

Therefore Grid World should classify consequential systems by impact, not by whether their inputs or outputs are "digital."

## The Reality Bridge

When an R1/R2/R3 event materially affects R0, the system records a Reality Bridge containing:
- bridge_id
- originating object/event
- originating reality class
- affected external domain
- evidence
- timestamp
- people/systems affected
- confidence
- legal/safety classification
- human review status
- resulting action
- audit record

The reverse direction is also supported:
R0 EVENT -> EVIDENCE -> GRID IMPORT -> CONTEXT -> WORLD/LORE EFFECT

This creates a deliberate boundary rather than pretending the Web, Grid World, and physical reality are one undifferentiated database.

## Lore presentation rule

Grid World should intentionally make readers question boundaries without deceiving them.

A lore page may place a verified historical fact beside an in-world reconstruction; a scientific principle beside a speculative Grid hypothesis; a fictional artifact beside its real-world inspiration; or an unresolved anomaly beside competing explanations.

The interface should provide subtle but clear provenance and reality-status signals.

Users should be able to "trip" over an idea because the writing is sophisticated, surprising, and interconnected — not because Grid World secretly lies about what is factual.

## AAA+ Knowledge Standard

Important lore and knowledge surfaces should use:
CLAIM -> SOURCE -> CONTEXT -> CONFIDENCE -> INTERPRETATION -> CONSEQUENCE

For externally sourced material:
- preserve source URL and publication date
- identify source type
- record retrieval time
- distinguish quotation from paraphrase
- preserve original-language source where relevant
- localize presentation without changing the underlying claim
- record translation provenance
- never fabricate citations
- never turn a generated summary into the source of truth

For in-world material:
- identify canonical author/system
- version the lore
- preserve revision history
- distinguish canon from speculation, rumor, and player theory

## Reality Profile UI

A knowledge/lore item can expose:

REALITY: R0 / R1 / R2 / R3 / R4 / R5 / R6
EVIDENCE: Verified / Supported / Plausible / Speculative / Unverified / Narrative
ORIGIN: Web / Grid World / User / NPC / AI-generated / Historical archive / Mixed
IMPACT: None / Social / Economic / Privacy / Safety / Legal / Platform / Physical

The labels should be localized like all other Grid World text.

## Prime lore rule

Grid World may blur the experience of reality.
It must not blur the truth status of claims when doing so could materially mislead people.

That distinction is part of the Grid World identity.