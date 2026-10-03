# Grid World — Canon & Experiment Tracking

**Purpose:** Keep user-established direction, engineering requirements, implementation choices, experiments, placeholders, and future ideas visibly separate. This document is a classification and review guide, not a replacement for the work queue, architecture map, or user canon.

**Baseline:** main `c9dfde4b5d0d976883576e16ac8b2b60bd964bb3`  
**Status:** documentation-only; no runtime or database changes.

## 1. Source-of-truth hierarchy

Use the narrowest authoritative source available, in this order:

1. **Paul's explicit current direction** — highest authority for product vision, canon, design calls, and changes to established direction.
2. **Canonical project documents** — explicit project decisions already recorded in documents such as `docs/AURORA_PROFILE.md`, canonical district notes, and other documents that explicitly identify a decision as canonical.
3. **Technical requirements** — constraints needed to implement established direction safely. Requirements describe what the system must do; they do not independently create product canon.
4. **Current implementation** — what the repository actually does today. Implementation is evidence of shipped behavior, not proof that an idea is permanently canonical.
5. **Aurora/engineer implementation decisions** — technical choices made to realize a requirement. These are revisable unless explicitly promoted.
6. **Experiments** — bounded tests or hypotheses used to learn whether an approach works.
7. **Placeholders / concept-only material / future ideas** — intentionally non-final material.

If two sources conflict, do not silently choose a winner. Preserve the conflict in the handoff and ask for or record the explicit decision.

## 2. Classification labels

| Label | Meaning | Can change without a new product decision? |
|---|---|---|
| **CANON** | Explicitly established Grid World direction, identity, lore, or product behavior. | No. Treat changes as a deliberate design decision. |
| **REQUIREMENT** | Technical/product constraint derived from canon or an explicit user request. | Yes, when the underlying direction changes. |
| **IMPLEMENTATION** | Current engineering realization of a requirement. | Yes. Prefer additive, reviewable changes. |
| **AURORA-DECISION** | An engineer-selected implementation detail or creative choice made where the requirement leaves room. | Yes. It must not silently become canon. |
| **EXPERIMENT** | A bounded test, prototype, hypothesis, or temporary implementation intended to produce evidence. | Yes. Record the result before promoting it. |
| **PLACEHOLDER** | Temporary asset, data, visual, text, or behavior used until final material exists. | Yes. Never present it as final. |
| **CONCEPT-ONLY** | Reference/art/world material that is not currently playable or otherwise implemented. | Yes, only after explicit promotion. |
| **FUTURE-IDEA** | A desired possibility or exploration not approved/implemented as current behavior. | Yes. Keep it out of current-state claims. |
| **VERIFIED-L0..L6** | Verification status from `docs/STUDIO_WORKFLOW.md`; describes evidence, not product importance. | Updated when verification changes. |

## 3. Promotion rules

### Idea → experiment
Use **EXPERIMENT** when the team needs evidence before deciding whether an idea belongs in the product.

Record:
- question being tested;
- scope;
- expected signal;
- result;
- next action.

### Experiment → implementation
Promote only when the result supports implementation and the underlying product direction is already established.

Record the implementation decision separately from the experiment result.

### Implementation → canon
Do **not** infer canon from code merely because it exists or merged.

A behavior becomes **CANON** only when Paul explicitly establishes it as such or an existing canonical document is deliberately amended to establish it.

### Concept-only → playable
Do not promote concept-only districts, worlds, characters, assets, or systems merely because an asset exists or a registry can represent it.

Promotion requires an explicit product/world decision and the normal engineering review.

## 4. How to write uncertain notes

Prefer precise language:

- “Paul established …” → CANON.
- “The implementation currently …” → IMPLEMENTATION.
- “Aurora chose … to satisfy …” → AURORA-DECISION.
- “Prototype tested …” → EXPERIMENT.
- “Temporary asset/data …” → PLACEHOLDER.
- “Referenced in concept art; not playable …” → CONCEPT-ONLY.
- “Potential future direction …” → FUTURE-IDEA.
- “Source-reviewed only …” → VERIFIED-L0.

Avoid phrases such as “Grid World will definitely …” when the source is only an idea, experiment, or implementation detail.

## 5. Current examples

These examples are classifications of existing repository material, not new product decisions:

- **CANON:** Aurora's role and identity as **Grid World Staff — AI Engineer / Creative Navigator**, as defined by `docs/AURORA_PROFILE.md`.
- **CANON / documented direction:** Grid World is intended to support an open-ended world network; the current architecture map records no fixed world-count cap.
- **REQUIREMENT:** protected wallet, ledger, marketplace settlement, and combat authority must remain server-authoritative.
- **IMPLEMENTATION:** current world presentation derives geometry/weather behavior from `WorldDNA` tags.
- **AURORA-DECISION:** selecting a particular technical seam or data shape to integrate with an existing system, unless separately established as canon.
- **CONCEPT-ONLY:** districts explicitly identified by the project as concept-only and not yet promoted to gameplay.
- **VERIFIED-L0:** a feature that has been inspected in source but has not received higher-level build, CI, browser, or deployment verification.

The examples above intentionally do not convert implementation details or future aspirations into permanent product canon.

## 6. Verification is a separate axis

Canon status and verification status answer different questions.

For example:
- A **CANON** requirement can be unimplemented.
- An **IMPLEMENTATION** can be merged but unverified.
- An **EXPERIMENT** can be thoroughly verified without becoming canon.
- A **PLACEHOLDER** can be live without being final.

Always report both when relevant.

## 7. Change protocol

When a meaningful direction changes:

1. identify the old classification;
2. identify the source of the new decision;
3. update the canonical document if the decision is canon;
4. update requirements/implementation notes as needed;
5. record the change in the engineering handoff and work queue;
6. verify affected code at the highest level actually reached;
7. avoid leaving contradictory stale language in adjacent documents.

**Rule:** when uncertain, document the uncertainty rather than silently canonizing it.

## 8. Relationship to existing documents

This document does not replace:

- `docs/AURORA_WORK_QUEUE.md` — backlog and active work;
- `docs/AURORA_ENGINEERING_HANDOFF.md` — engineering state and handoff;
- `docs/ENGINEERING_STATE.md` — master engineering state;
- `docs/STUDIO_WORKFLOW.md` — production and verification rules;
- `docs/ARCHITECTURE_MAP.md` — current system architecture;
- `docs/AURORA_PROFILE.md` — Aurora's canonical profile;
- canonical district/art notes — authoritative world/art identities where explicitly designated.

When this classification guide conflicts with an explicit user decision, the explicit user decision controls.

## 9. Review checklist

Before calling a new idea “part of Grid World”:

- [ ] Is the source of the decision known?
- [ ] Is it CANON, REQUIREMENT, IMPLEMENTATION, AURORA-DECISION, EXPERIMENT, PLACEHOLDER, CONCEPT-ONLY, or FUTURE-IDEA?
- [ ] If canon, is the canonical source updated?
- [ ] If experimental, is the experiment bounded and its result recorded?
- [ ] If implemented, is the actual verification level recorded?
- [ ] If concept-only, is it still protected from accidental gameplay promotion?
- [ ] Did we avoid creating a second source of truth?
