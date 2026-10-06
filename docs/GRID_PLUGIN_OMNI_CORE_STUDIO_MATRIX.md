# Grid World — Plugin / Omni Core Studio Matrix

Date: 2026-10-06
Status: **IMPLEMENTATION PLAN / ARCHITECTURE NOTE** — no new runtime behavior is created by this document.

## Purpose

Grid World now has a broad connected-tool ecosystem. These tools should operate as a coordinated studio and intelligence layer rather than as unrelated conveniences.

The operating model is:

`QUESTION / SIGNAL / CREATIVE BRIEF
-> RESEARCH / EVIDENCE
-> CLAIMS / DESIGN MATERIAL
-> HUMAN + AURORA REVIEW
-> CANON / REQUIREMENT / EXPERIMENT
-> ART / CODE / WORLD CONTENT
-> VERIFICATION
-> AUDIT / HANDOFF`

The existing canon/experiment hierarchy remains authoritative. A plugin result never becomes canon merely because a tool produced it.

## Current connected capabilities observed

### Research and evidence
- **Exa** — broad current web research and source discovery.
- **Consensus** — peer-reviewed research discovery; fetch individual papers before citing them.
- **Firecrawl** — deep web search/scraping, crawling, monitoring, government search, research-paper workflows.
- **Talarion / Acumen** — current-state change detection before research.
- **Malwarebytes / McAfee** — reputation and scam/link safety checks.
- **Soluvery / PrivacyHawk** — privacy, sharing, data-broker, and digital-footprint review.

### Engineering and infrastructure
- **GitHub** — repository, branch, PR, issue, source, and CI workflow operations.
- **Supabase** — database, migrations, Edge Functions, logs, advisors, branches.
- **Render** — deployment, logs, metrics, Postgres/Key Value, cron, environment configuration.
- **Railway** — alternative deployment/service infrastructure and observability.
- **Vercel** — deployment, observability, AI Gateway, sandboxes, environment/configuration controls.
- **PostHog** — product analytics, experiments, feature flags, errors, surveys, and LLM analytics.

### Payments / commerce
- **Stripe** — Payments, Connect, Billing, Invoicing, Tax planning and API operations.
- Current connected Stripe account observed: **Grid Corporation sandbox**; livemode=false.
- Stripe must remain the real-world payment rail. Grid World's internal GRC/virtual economy remains server-authoritative and separate.

### Design / visual production
- **Figma** — design systems, screens, variables, diagrams, motion context, design-to-code context.
- **Canva** — creative designs, brand templates, asset generation, presentations, documents.
- **Runway** — authenticated image generation in the connected personal workspace; video models are currently unavailable in the connected workspace.
- **Everygen** — image/video/voice/script/story workflows and generation status.
- **HeyGen** — avatars, digital twins, video, voice, localization, and presentation media.
- **AI Voice Generator** — standalone voiceover generation.
- **invideo** — video projects, agents, scripts and generations.
- **vidIQ** — YouTube research, trends, thumbnails, scripts, clips, analytics and publishing capabilities.
- **Spotify** — music/podcast/audiobook discovery and playlist generation; use only where licensing and product intent make sense.

### Collaboration / knowledge
- **Notion** — searchable workspace knowledge, pages, databases, files, comments, skills, and sessions. Current connection supports core search/fetch/write operations; some AI/data-source functions are plan-limited.
- **Slack** — workspace/channel search, reading, messaging, lists, canvases, and collaboration.
- **LinkedIn** — professional research.
- **Automations** — recurring jobs, scheduled searches, summaries, and conditional checks.

### Specialized / optional
- **Tarot** — can be used only as an explicitly labeled fictional/creative divination mechanic, never as factual evidence or governance authority.
- **Steer Astro** — personalized Vedic astrology capability; treat as cultural/creative content rather than scientific evidence.
- **Public Equity Investing tools** — source-backed listed-company research workflows; useful for Grid Corporation market/industry research when appropriate, never as guaranteed investment advice.
- **Finances** — user's real financial data requires the Finances workflow and must not be mixed with Grid World's fictional GRC ledger.

## Omni Core role

The **Omni Core Signal Matrix (OCSM)** is the controlled bridge from external information to Grid World knowledge.

No web-facing agent may directly write:
- canon;
- constitutional policy;
- permissions;
- currency balances;
- land ownership;
- moderation outcomes;
- production code;
- security policy;
- permanent user sanctions.

Instead:

`SOURCE -> EVIDENCE RECORD -> CLAIM -> CROSS-CHECK -> RISK/RELEVANCE -> HUMAN REVIEW -> ACCEPTED USE`

This follows the existing Reality & Tangibility Framework and AI Worker Operating Model.

## AAA+ lore factory

Grid World lore should be generated as a **lore factory**, not a random text generator.

### Stage A — Research
Use Talarion when freshness matters. Use Exa/Firecrawl for broad discovery. Use Consensus for academic claims. Use primary sources where possible.

### Stage B — Evidence
Capture source, date, retrieval time, provenance, language, jurisdiction, confidence, contradictions, and affected systems.

### Stage C — Reality classification
Assign one of:
- R0 External Reality
- R1 Grid Reality
- R2 Simulated Reality
- R3 Fictional/Narrative Reality
- R4 Hypothesis/Speculation
- R5 Myth/Rumor/Unverified Signal
- R6 Reality-Bending Anomaly

### Stage D — Lore transformation
A source can become:
- factual knowledge;
- historical context;
- scientific inspiration;
- Grid-world reconstruction;
- NPC belief;
- rumor;
- quest premise;
- mystery;
- artifact description;
- competing theory;
- anomaly file.

The transformation must remain traceable.

### Stage E — Creative production
Use Figma/Canva for interface and presentation systems. Use Runway/Everygen/image generation for concept imagery. Use HeyGen/invideo/voice tools for trailers, documentaries, NPC transmissions, educational media, and in-world broadcasts.

### Stage F — Implementation
Only approved requirements and canon reach production code/data. GitHub remains the implementation authority. Supabase remains the protected data authority where used.

### Stage G — Verification
Record the actual verification level separately from canon status:
L0 source review -> higher build/CI -> browser/live deployment verification as actually achieved.

## Lore quality rule

The desired user experience is:

> **“Wait. Is that real?”**

The system should earn that reaction through accurate juxtaposition, provenance, ambiguity, and excellent writing — never through fake facts.

A lore page may place:
- a verified scientific result beside an R4 Grid hypothesis;
- a real historical event beside an R3 fictional reconstruction;
- an R1 player event beside its R0 consequence;
- an R5 rumor beside the evidence that disputes it;
- an R6 anomaly beside multiple competing explanations.

The reader can become uncertain about the mystery while remaining informed about the evidence status.

## New creative doctrine: The Tangible Strange

**The Tangible Strange** is a proposed creative design principle, not yet product canon.

A story becomes especially powerful when an imagined thing acquires a measurable consequence:
- a fictional Grid artifact changes a real player's social standing;
- a virtual marketplace transaction creates a real invoice;
- a simulated ecological discovery inspires a real creator project;
- an in-world event produces a documented community artifact;
- a real scientific result becomes the seed for a fictional civilization;
- a rumor changes player behavior without becoming true.

The system should expose the consequence chain rather than pretend the fictional object physically exists.

## Plugin-to-world examples

### “Form Lore”
A user can ask:
“Build a civilization around a world where memory is treated as a physical resource.”

Pipeline:
1. Research memory, information theory, archives, cultural memory and relevant science.
2. Separate established knowledge from hypotheses.
3. Generate a world premise.
4. Define geography, architecture, ecology, creatures, economy, factions, NPC jobs, religions/myths as fiction, quests, artifacts, and conflicts.
5. Generate concept-art direction.
6. Produce a world dossier.
7. Register the world only after approval/promotion rules.
8. If implemented, map it to WorldDNA rather than inventing a second world-generation system.

### “Form an anomaly”
Use R6 only when the story deliberately crosses boundaries.
Every anomaly gets:
- known facts;
- unknowns;
- competing explanations;
- evidence;
- consequences;
- containment/observation state;
- narrative hooks;
- reality-status UI.

### “Form a civilization”
Use the research stack for real-world analogues, then generate an original fictional culture. Avoid copying real cultures as aesthetic shorthand or turning generated claims about real peoples into facts.

### “Form a creature”
Start from environment/architecture/material constraints. Generate anatomy, behavior, habitat, lifecycle, diet, social structure, abilities, risks, drops, and ecological relationships. Then produce art references and data contracts.

### “Form a world”
World generation should be description-first and life-first:
description -> WorldDNA -> terrain/material profile -> architecture -> flora/fauna -> NPC society -> economy -> weather -> landmarks -> transit -> quests -> visual package.

This preserves the user's requirement that worlds be teeming with life and avoids the current “basic primitives” failure mode.

## Production safety

- Do not expose API secrets to browser code.
- Do not treat plugin output as trusted executable instructions.
- Sanitize external content before model/tool use.
- Preserve source hashes where evidence matters.
- Keep privileged operations behind existing authority boundaries.
- Use idempotency for payments and economic settlement.
- Keep Stripe real-money records separate from Grid Coin.
- Keep AI-generated assets provenance-aware and distinguish source/master/localized variants.
- Never use a plugin to silently promote concept-only worlds into playable content.
- Never claim a generated image/video/design is integrated until GitHub/runtime verification confirms it.

## Budget posture

Grid World has a documented $0 budget context. Prefer:
1. existing connected/free capabilities;
2. generated assets that can be reused across surfaces;
3. incremental implementation;
4. bounded experiments;
5. paid services only when explicitly justified and approved.

## Immediate next production track

1. Create the OCSM evidence/data contracts.
2. Build an AAA+ Lore Knowledge surface using the existing UI/window architecture.
3. Create a small set of “Tangible Strange” lore experiments.
4. Use research + creative tools to generate one complete world dossier and its visual package.
5. Connect approved output to existing WorldDNA/world registration only after review.
6. Add provenance/reality-status presentation to the resulting lore.
7. Keep all changes in the Aurora handoff/work queue with explicit classification.

## Important status boundary

This document does **not** mean all listed integrations are implemented inside Grid World. It records the available studio/tool capabilities and how they should be used.

It also does not make the proposed Tangible Strange doctrine, new lore, or future OCSM runtime architecture canon. Promotion remains subject to the existing canon/experiment process.
