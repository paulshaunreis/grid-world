# Dream Seed — Idea-to-World Architecture

**Status:** Proposed product/engineering architecture — not production behavior  
**Date:** 2026-10-07  
**Owner:** Grid World product direction; engineering implementation requires review and verification

## 1. Purpose

Grid World should eventually let a person give the system a small creative seed — including a whispered idea, short text, voice note, image, sketch, or other supported input — and later receive a link to a generated world.

The experience should feel simple:

> **Give Grid World an idea. Come back later. Find a world.**

The system may transform an idea into a rich digital world without requiring the person to know how to build worlds.

The objective is not to claim that Grid World has made a dream physically real. The objective is:

> **Grid World gives the dream a world.**

## 2. Core flow

```text
WHISPER / IDEA / DREAM
        |
        v
   DREAM SEED
        |
        v
MEASURE + PROVENANCE
        |
        v
 WORLD BLUEPRINT
        |
        v
WORLD GENERATION
        |
        v
 LIVING WORLD
        |
        v
VERIFICATION / SAFETY GATE
        |
        v
 WORLD LINK
        |
        v
USER RETURNS / EXPLORES
```

A seed is not itself a world. It is an input to a controlled generation pipeline.

## 3. Dream Seed record

A Dream Seed should preserve the origin and transformation history of the input.

Minimum conceptual fields:

- seed_id
- owner/account reference
- creation timestamp
- input modality
- original user-provided content reference
- consent/visibility state
- reality class
- provenance record
- interpretation version
- model/provider/version used for transformation
- generated blueprint version
- generated world ID when one exists
- safety review state
- creator attribution
- transformation history
- world link status
- retention/deletion status

The original seed should not be silently replaced by an AI interpretation.

## 4. Reality and truth boundary

Dream Seed uses the existing Reality & Tangibility framework.

Examples:

- A dream is real as an experience/report by its creator.
- A fictional description is real as a creative work.
- A generated Grid World is real as a digital artifact.
- A hypothesis remains a hypothesis until evidence changes its classification.
- An unverified extraordinary claim remains unverified.

The generation system must never silently convert:

- dream -> external fact;
- imagination -> historical record;
- generated content -> evidence;
- AI interpretation -> user intent;
- compelling output -> verified truth.

Principle:

> **Do not destroy the dream because it is unverified. Do not call the dream reality because it is compelling.**

## 5. Generation pipeline

### Stage A — Capture

Accept supported creative inputs and preserve the original input.

### Stage B — Normalize

Convert the input into a structured creative seed while retaining provenance back to the original.

### Stage C — Measure

Evaluate:

- source/provenance;
- user intent;
- reality class;
- ambiguity;
- safety;
- rights/privacy considerations;
- generation constraints;
- contradictions;
- missing information.

Ambiguous material should remain ambiguous rather than being silently invented as fact.

### Stage D — Blueprint

Produce a machine-readable World Blueprint containing, where appropriate:

- world identity;
- aesthetic direction;
- geography;
- climate/weather;
- terrain;
- architecture;
- materials;
- flora;
- fauna;
- NPC populations;
- cultures/factions;
- economy;
- transportation;
- landmarks;
- quests/mysteries;
- environmental systems;
- world capability contract;
- creator permissions;
- generation constraints.

### Stage E — Generate

Generate the world using existing Grid World world-generation architecture.

The system should reuse established world, district, capability, NPC, ecology, teleportation, profile, economy, and persistence authorities rather than creating parallel systems.

### Stage F — Populate

A successful world seed should produce a world that feels inhabited where the seed calls for life.

Population can include:

- creatures;
- plants;
- NPCs;
- occupations;
- routines;
- relationships;
- resources;
- weather;
- ecological interactions;
- points of interest;
- world history.

Generation should be constrained by the blueprint and world capabilities rather than arbitrary decoration.

### Stage G — Verify

Before a generated world becomes accessible:

- validate required world data;
- validate references;
- validate assets;
- validate permissions;
- validate safety constraints;
- validate persistence;
- validate world capability compatibility;
- validate teleport destination integrity;
- validate that generated content does not silently claim unsupported external facts.

A generated world that fails validation should remain quarantined rather than being presented as complete.

### Stage H — Publish / Link

When verification succeeds, the user receives a durable world link.

Example:

> **Your world is ready.**  
> Generated from your Dream Seed.  
> **Enter World**

The notification should include the world ID/version and creation date.

## 6. Delayed discovery experience

The system should support asynchronous creation.

Example:

**Day 0**

User whispers:

> "A city beneath an endless ocean where the buildings grow like coral."

Grid World records the seed.

**Day 3**

The user receives:

> **Your world is ready.**  
> **Coral Below**  
> *A world grown from your Dream Seed.*  
> **Enter World →**

The delayed link is part of the experience, not an incidental implementation detail.

## 7. Creator provenance

The world should preserve that the originating creative seed came from the user.

This does not mean every generated element is automatically authored entirely by the user. The provenance record should distinguish:

- user-originated material;
- AI interpretation;
- generated content;
- third-party assets where permitted;
- system-generated simulation;
- later creator edits.

This supports attribution, creator rights, debugging, and future world history.

## 8. No fixed world limit

Dream Seed must not assume a fixed number of worlds.

World identity should use durable identifiers and scalable registration rather than hard-coded world slots.

The architecture should support:

```text
1 seed -> 1 world
1 seed -> multiple world versions
1 seed -> branching worlds
many seeds -> one collaborative world
world -> later creator expansion
```

Any actual infrastructure limits remain engineering capacity limits, not product language claiming a literal infinite physical resource.

## 9. Versioning and evolution

A Dream World should be versioned.

Example:

```text
Dream Seed
  -> Blueprint v1
      -> World v1
          -> Creator edits
              -> World v2
                  -> Expansion
                      -> World v3
```

The original seed remains preserved.

A later generation should not silently overwrite the historical world state.

## 10. Safety and rights

Dream Seed inherits the existing Trust & Safety, AI Governance, Protected Core, and Grid Law architecture.

The system should measure before generating or publishing consequential content.

Special attention:

- real-person likenesses;
- private information;
- copyrighted/trademarked material;
- minors and vulnerable people;
- dangerous instructions;
- impersonation;
- political content;
- real-world claims;
- generated misinformation;
- user consent and visibility.

A creative seed can be transformed without granting the generator unlimited authority over people or information.

## 11. Protected Habitat integration

Dream-generated worlds become part of the protected Grid ecosystem only after they pass the appropriate boundaries.

Protection should include:

- authoritative world state;
- provenance;
- creator history;
- persistence;
- recovery;
- version history;
- dependency isolation;
- controlled deletion;
- privacy and retention rules.

A generated world should be quarantinable without destroying the original Dream Seed or its provenance.

## 12. Failure handling

Dream Seed must fail honestly.

Examples:

- generation unavailable -> preserve seed and report queued/unavailable state;
- AI provider unavailable -> do not fabricate completion;
- asset generation failure -> retry or quarantine;
- validation failure -> preserve evidence and show incomplete state;
- persistence failure -> do not issue a false durable-world claim;
- safety uncertainty -> hold for review rather than guessing.

No fake "Your world is ready" message.

## 13. Measurement and causal trace

For every generated world, maintain enough provenance to answer:

- What did the user originally provide?
- What did the system infer?
- What did the system generate?
- Which model/provider/version performed the transformation?
- What constraints were applied?
- What changed between blueprint and world?
- What verification ran?
- What failed?
- What was manually changed?
- What version is currently being shown?

This makes the generated world explainable without exposing unnecessary private internal reasoning.

## 14. Product principle

The experience should preserve the emotional magic while maintaining technical honesty:

> **Someone can whisper an idea today and discover that Grid World has given that idea a place to exist tomorrow.**

The system should not promise that every idea becomes a perfect world.

It should promise only what it can verify.

## 15. Implementation boundary

This document is an architecture proposal only.

It does not authorize:

- a new production generation service;
- new AI-provider contracts;
- new data collection;
- new user-facing claims;
- automatic world publication;
- new economic commitments;
- changes to constitutional authority.

Implementation should begin with a small, reversible vertical slice after the existing stability/security work is reviewed.

## 16. Definition of the first safe slice

The first implementation should be deliberately small:

1. Create a Dream Seed data contract.
2. Accept one simple text seed.
3. Generate a deterministic/inspectable World Blueprint.
4. Do not yet generate an entire persistent world automatically.
5. Display the blueprint as a preview.
6. Preserve provenance and versioning.
7. Validate the blueprint against existing World Capability Contracts.
8. Only after that succeeds, connect the blueprint to world generation.
9. Verify at the repository and browser levels before expanding.

This keeps the first cut measurable and reversible.

> **Measure the seed. Measure the interpretation. Measure the world. Then let the world grow.**
