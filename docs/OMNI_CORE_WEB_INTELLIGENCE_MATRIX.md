# Omni Core Web Intelligence & System Matrix

Date: 2026-10-06
Status: Foundational architecture proposal — implementation requires security review and explicit human governance

## Purpose

The Omni Core should have a controlled connection to the Web so Grid World can remain aware of external developments that may affect its technology, safety, law, security, culture, economy, creators, users, and continuity.

The Web is an evidence source.
It is not the Omni Core's brain, policy authority, or automatic truth oracle.

## System name

Omni Core Signal Matrix (OCSM)

The OCSM is the controlled intelligence boundary between Grid World and external information sources.

Conceptually:
WEB / FEEDS / PRIMARY SOURCES
-> INGESTION
-> SOURCE IDENTITY
-> EVIDENCE STORE
-> CLAIM EXTRACTION
-> CROSS-CHECK
-> RISK / RELEVANCE CLASSIFICATION
-> AFFECTED GRID SYSTEMS
-> HUMAN REVIEW
-> RECOMMENDATION OR CONTROLLED ACTION
-> AUDIT

## Source hierarchy

Prefer, in order:
1. Government and regulator publications
2. Standards organizations
3. Primary vendor/security advisories
4. Peer-reviewed research
5. Established journalism
6. Community reports and social posts as leads only

A source's authority is contextual. A government source can establish what a government published; it does not automatically establish every technical or scientific claim contained in an unrelated page.

## Web Reality Boundary

The Web connector must never directly write arbitrary text into canonical Grid World lore, rules, economy, permissions, or constitutional policy.

External information enters as an Evidence Record first.

URL -> Evidence Record -> Claims -> Confidence -> Review -> Canonical consequence

This prevents search-result poisoning, prompt injection through web pages, malicious lore injection, fake regulatory claims, accidental policy changes, fabricated citations, and model hallucination becoming platform state.

## Evidence Record

Each record should contain:
- evidence_id
- canonical_url
- source_domain
- publisher
- publication_time
- retrieval_time
- content_hash
- source_type
- language
- extracted_claims
- quoted_or_paraphrased flag
- confidence
- corroborating_sources
- affected_subsystems
- risk_class
- human_review_state
- retention_policy

## Claim Graph

The Omni Core should reason over claims rather than raw webpages.

A Claim has:
- claim_id
- statement
- reality_class
- evidence_refs
- confidence
- jurisdiction
- effective_date
- expiration/review_date
- affected_systems
- contradictions
- supersedes
- status

Possible statuses:
UNSEEN -> CANDIDATE -> CORROBORATED -> REVIEWED -> ACCEPTED_FOR_USE -> SUPERSEDED

A claim must never become ACCEPTED_FOR_USE merely because an AI model says it sounds correct.

## Affected Systems Map

The Omni Core should map external signals to Grid World systems.

Examples:
AI provider policy change -> AI Worker Corps -> AI Influencers -> content generation -> provenance -> ToS/AI rules -> legal review
Security vulnerability -> infrastructure -> dependency -> authentication -> secrets -> deployment -> Sentinel
Translation provider change -> localization -> chat translation -> cards/assets -> accessibility -> Translator
Copyright/digital-replica development -> creator tools -> AI Influencers -> avatar systems -> provenance -> legal review

## Reality / Lore bridge

The OCSM feeds the Reality & Tangibility Framework.

External evidence can become current affairs, research reference, world event inspiration, quest context, lore reference, or risk signal.

But these are separate transformations.
FACT -> CONTEXT -> INTERPRETATION -> FICTION
must never silently become:
FACT -> FICTION PRESENTED AS FACT

## AI safety boundary

Web-facing workers must be isolated from privileged Grid credentials.

Required controls:
- least-privilege service accounts
- read-only web retrieval where possible
- URL/domain allowlists for high-impact sources
- content sanitization
- prompt-injection-resistant parsing
- separate evidence storage
- immutable or append-only evidence hashes
- outbound action approval gates
- rate limits
- kill switch
- audit logs
- model/version recording
- policy version recording
- human review for high-impact actions

No Web-facing worker may rewrite its own policy, grant itself permissions, delete evidence, mint currency, transfer land, permanently ban a user, change constitutional rules, deploy production code, or conceal an incident.

## Omni Core Matrix questions

For every material signal, the system should be able to answer:
1. What happened?
2. Where did the information come from?
3. When was it published and retrieved?
4. How strong is the evidence?
5. What contradicts it?
6. What parts of Grid World could it affect?
7. Who could be harmed?
8. What is reversible?
9. What requires human approval?
10. What was ultimately done?
11. What evidence supported that decision?
12. What changed afterward?

This becomes the operational form of:
RULE -> AUTHORITY -> EVIDENCE -> ACTION -> AUDIT -> APPEAL

## Knowledge quality

AAA+ does not mean "the AI always knows."

It means the system is designed to show uncertainty, preserve provenance, cross-check important claims, distinguish fact from interpretation, distinguish reality from fiction, preserve original sources, update stale information, expose contradictions, and make consequential decisions reviewable.

That is how Grid World can feel extraordinarily intelligent without pretending omniscience.