# Grid World AI Worker Operating Model

Date: 2026-10-06

## Mission
Maintain a continuously updated advisory and operational intelligence layer for Grid World.

## Architecture
Authoritative Sources -> Signal Ingestion -> Evidence Store -> Claim Graph -> Risk Classifier -> Affected Systems Map -> Human Review Queue -> Action/Recommendation -> Audit

The controlled Web boundary is the **Omni Core Signal Matrix (OCSM)**. Web-facing workers read evidence through this boundary; they do not receive unrestricted Web access plus unrestricted Grid credentials.

## Reality and evidence
Use the Grid World Reality & Tangibility Framework for external and in-world knowledge:
- R0 — External Reality
- R1 — Grid Reality
- R2 — Simulated Reality
- R3 — Fictional / Narrative Reality
- R4 — Hypothesis / Speculation
- R5 — Myth / Rumor / Unverified Signal
- R6 — Reality-Bending Anomaly

A digital event can have real-world consequences. Workers therefore classify risk by consequence, not by whether the source or destination is digital.

## Source hierarchy
1. Government/regulator publications
2. Standards bodies
3. Primary vendor/security advisories
4. Peer-reviewed research
5. Established journalism
6. Community reports as leads, not authority

## Never do this
- Treat social-media rumors as facts.
- Change Grid policy from one article.
- Give a monitoring worker unrestricted web access plus unrestricted Grid credentials.
- Let monitoring automatically deploy code.
- Let workers delete evidence.
- Let workers rewrite their own policies.
- Let external webpages directly become canonical lore, rules, economy state, permissions, or constitutional policy.
- Treat AI-generated summaries as primary evidence.
- Hide uncertainty or contradictions when they materially affect a decision.

## Worker manifest
Every worker gets:
worker_id
human_owner
purpose
model_provider
model_version
allowed_tools
allowed_data
forbidden_actions
risk_class
max_action_scope
approval_requirement
kill_switch
audit_stream
policy_version
last_policy_review
last_model_review

## Suggested always-on workers
SIGNAL — current AI regulation, provider changes, capability changes, major security incidents and copyright/digital-replica developments.
SENTINEL — abuse, account anomalies, privilege anomalies and security telemetry.
WORLDKEEPER — world capability contracts, asset integrity, world health and NPC/content anomalies.
MARKETWATCH — currency, marketplace, duplication and tournament-prize anomalies.
PROVENANCE — Grid marks, C2PA credentials, asset ownership and localization variants.
TRANSLATOR — translation quality, terminology and untranslated UI keys.
LOREKEEPER — canon consistency, reality-status labeling, source/provenance checks, contradiction detection and lore revision history.
CUSTODIAN ADVISOR — decision -> rule -> evidence -> risks -> alternatives -> affected people -> reversibility -> recommendation.

## Update cadence
- Security advisories: event-driven
- Major AI provider changes: daily
- Legal/regulatory sources: daily
- General research: weekly
- Translation QA: continuous/on change
- Lore/provenance QA: on change and scheduled review
- Governance review: monthly
- Model/provider risk review: before material provider changes

## Severity
P0: immediate safety, security, legal or continuity threat
P1: credible material risk requiring same-day review
P2: meaningful degradation or emerging risk
P3: informational trend

## Audit
Every alert stores source URL, publication time, retrieval time, extracted claim, reality class, confidence, evidence hash, affected subsystem, recommendation and reviewer disposition.

The system should preserve enough evidence to answer: what happened, where the claim came from, what contradicted it, who reviewed it, what action followed, and whether that action can be reversed.
