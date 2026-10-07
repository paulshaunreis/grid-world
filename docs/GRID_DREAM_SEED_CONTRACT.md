# Dream Seed Contract — First Safe Vertical Slice

**Status:** Proposed contract — documentation only
**Parent:** `docs/GRID_DREAM_SEED_ARCHITECTURE.md`
**Date:** 2026-10-07

## Purpose
Define the smallest inspectable contract for the first Dream Seed implementation. This contract deliberately stops before automatic persistent-world generation.

## State machine
CAPTURED → NORMALIZED → MEASURED → BLUEPRINT_READY → VALIDATING → PREVIEW_READY → APPROVED_FOR_GENERATION

Material uncertainty may route to NEEDS_REVIEW. Validation failure routes to QUARANTINED.

## Recovery states
- NEEDS_REVIEW — material ambiguity, rights, safety, provenance, or other uncertainty.
- QUARANTINED — artifact failed validation or dependency checks and is isolated from publication.
- CANCELLED — user or authorized system action stops the seed.
- EXPIRED — retention policy ends active workflow while preserving only what policy permits.
- FAILED — technical failure occurred; original seed and failure record remain available according to retention rules.

A technical failure must never be represented as successful generation.

## Seed contract
| Field | Meaning |
|---|---|
| seed_id | Durable unique identifier |
| owner_id | Authorized owner reference |
| created_at | Capture timestamp |
| input_type | text / voice / image / sketch / future modality |
| source_ref | Reference to original user input |
| source_hash | Integrity identifier for captured source |
| reality_class | Truth-status classification |
| visibility | private / shared / public, subject to policy |
| status | Current workflow state |
| schema_version | Contract version |
| provenance_id | Provenance record |
| interpretation_version | Interpretation revision |
| blueprint_version | Blueprint revision when available |
| review_state | Review requirement/result |
| retention_state | Retention/deletion state |

Unknown optional values must not be invented merely to make a seed appear complete.

## Provenance
Every transformation should be traceable: ORIGINAL INPUT → NORMALIZATION → INTERPRETATION → BLUEPRINT → PREVIEW.
Record input reference, output reference, transformation type, timestamp, model/provider/software version where applicable, constraints/policy version, and verification result.

## World Blueprint minimum
- identity
- creative intent
- reality class
- visual/aesthetic direction
- geography/terrain
- climate/weather
- architecture
- materials
- flora
- fauna
- NPC population intent
- points of interest
- world rules/capabilities
- generation constraints
- provenance
- validation status
- blueprint version

Unknown is preferable to invented certainty.

## Reproducibility
The first safe slice should record enough inputs and configuration to explain preview differences. Exact identical visual output is not required when generation providers are nondeterministic.

## Idempotency
Repeated processing of the same authorized request must not accidentally create duplicate authoritative seeds. A request identifier plus owner, source integrity identifier, and operation should support duplicate detection where implemented.

## Measurement record
Before BLUEPRINT_READY, record: source; identity/authorization; evidence/provenance; context; authority; rights; consequence; proportionality; reversibility; verification; and unresolved material questions.

## Preview rule
PREVIEW_READY means the seed was captured, provenance is available, the blueprint is structurally valid, required capability references resolve, required preview checks pass, and no claim is made that a persistent world exists.

## Generation gate
Automatic persistent-world generation requires separate verification of authoritative world registration, capability compatibility, persistence, recovery, asset integrity, permissions, safety validation, publication authorization, and browser/integration behavior.

## Failure truth table
| Situation | Required behavior |
|---|---|
| AI provider unavailable | Preserve seed; report unavailable/queued |
| Malformed input | Reject/request correction; preserve original where permitted |
| Ambiguous intent | Retain ambiguity or request clarification |
| Validation failure | Quarantine |
| Persistence failure | Do not claim success |
| Duplicate retry | Return existing operation where safely identifiable |
| Safety uncertainty | Review/hold according to policy |
| Provider/model version changes | Record version change |
| User deletes seed | Apply authorized retention/deletion policy |
| Generated preview changes | Preserve relevant version/provenance |

## Security boundary
Dream Seed must not itself become an authority over account ownership, currency, land, constitutional governance, moderation adjudication, legal conclusions, or irreversible world destruction. It consumes authorized interfaces for those functions.

## First implementation test matrix
1. Valid text seed.
2. Empty seed.
3. Duplicate submission.
4. Retry after timeout.
5. Provider failure.
6. Malformed blueprint.
7. Unresolved world capability.
8. Unauthorized owner reference.
9. Deletion request.
10. Concurrent blueprint generation.
11. Version change.
12. Quarantine and recovery.
13. Preview link cannot be mistaken for a persistent world.
14. Provenance survives retry.
15. No false world-ready state.

## Definition of Done
The first slice is complete only when the contract is implemented, provenance survives processing, blueprint output is inspectable, failures produce honest states, duplicate processing is controlled, capability references are validated, the failure matrix is tested, CI passes, browser behavior is verified where applicable, and no production claim exceeds observed verification.

> **The first world is not the first goal. The first trustworthy seed is.**