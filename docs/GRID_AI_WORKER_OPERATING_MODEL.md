# Grid World AI Worker Operating Model

Date: 2026-10-06

## Mission
Maintain a continuously updated advisory and operational intelligence layer for Grid World.

## Architecture
Authoritative Sources -> Signal Ingestion -> Evidence Store -> Risk Classifier -> Affected Systems Map -> Human Review Queue -> Action/Recommendation -> Audit

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
CUSTODIAN ADVISOR — decision -> rule -> evidence -> risks -> alternatives -> affected people -> reversibility -> recommendation.

## Update cadence
- Security advisories: event-driven
- Major AI provider changes: daily
- Legal/regulatory sources: daily
- General research: weekly
- Translation QA: continuous/on change
- Governance review: monthly
- Model/provider risk review: before material provider changes

## Severity
P0: immediate safety, security, legal or continuity threat
P1: credible material risk requiring same-day review
P2: meaningful degradation or emerging risk
P3: informational trend

## Audit
Every alert stores source URL, publication time, retrieval time, extracted claim, confidence, evidence hash, affected subsystem, recommendation and reviewer disposition.
