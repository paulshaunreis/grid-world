# Grid World — Plugin Capability & Gap Ledger

Date: 2026-10-06
Review mode: measure-ten-times / cut-once
Status: ARCHITECTURE / CAPABILITY AUDIT

## Operating rule

Before starting a substantial Grid World task, inspect the available tool surface and the plugin catalog for capabilities that could materially improve the result.

Use the strongest available tool for the job.

Do not force a plugin into a workflow merely because it exists.

Do not treat an unavailable or unconnected plugin as available.

Do not let a plugin result silently become Grid World canon.

## Current capability families

### Research / truth
Exa, Firecrawl, Talarion/Acumen, Consensus, and web search form the research stack.

Potential future additions found in the plugin catalog:
- Scite — citation context and scientific literature analysis.
- Wolfram — rigorous computation and curated knowledge.
- Context7 — current library/API documentation.
- Parallel Search / Tavily — additional web retrieval layers.

### Visual / spatial
Figma, Canva, Runway, Everygen, HeyGen, InVideo, AI Voice Generator and related media tools support design and media production.

Potential catalog additions:
- Miro — collaborative system maps and architecture boards.
- Webflow — website design/build/CMS workflows.
- Replit / Lovable / Base44 / Floot — rapid application prototyping.
- Remote Desktop Commander — authorized local-machine development workflows.

### Engineering / runtime
GitHub, Supabase, Render, Railway, Vercel, PostHog and related tools cover source control, database, deployment, observability and analytics.

### Commerce
Stripe provides real-world payment infrastructure.

### Collaboration
Notion, Slack, Outlook and related systems support documentation and coordination.

### Safety / privacy
Malwarebytes, McAfee, PrivacyHawk, Soluvery and AJAXX cover several link, scam, privacy and data-exposure concerns.

### Trend/media
vidIQ, Spotify, LinkedIn and external web research can provide specialized cultural/media signals.

## Capability gaps

These are not failures. They are architectural gaps to track.

### Direct game-engine editor integration
No confirmed direct Unity/Unreal editor MCP is currently part of the connected runtime. The architecture therefore remains renderer/engine-agnostic and should preserve portable Grid Engine contracts.

### Dedicated AR spatial-world connector
No confirmed single vendor-neutral AR-world management plugin is currently connected. Build the AR abstraction inside Grid World and use platform adapters.

### Dedicated 3D asset/DCC pipeline
No confirmed full Blender/Maya/3ds Max-style connected production pipeline was found in the current tool surface. Keep asset provenance and portable formats independent of a single DCC.

### Broad social trend firehose
Specialized trend tools can provide signals, but no single source should be treated as a universal measure of culture. Combine multiple signals and timestamp them.

### Legal authority
Research tools are not legal counsel. Legal developments should enter the evidence layer and receive qualified human/legal review when consequential.

### Physical-world safety / mapping authority
AR location data must not become a safety oracle. Physical-world interactions require explicit safety constraints and appropriate mapping/location services.

## Capability escalation rule

When a gap materially blocks a task:

1. Search the plugin catalog.
2. Check whether an existing connected tool can cover it.
3. Check whether a native Grid Engine abstraction can cover it without vendor lock-in.
4. Only then consider a new plugin or external service.
5. Record the gap and decision in the Aurora handoff.

## Timestamped audit record

2026-10-06:
- Connected tool surface inventoried.
- Plugin catalog searched for game development, VR/AR/spatial computing and related production capabilities.
- New candidate capabilities identified: Context7, Wolfram, Scite, Miro, Webflow, Replit, Lovable, Base44, Floot, Remote Desktop Commander and others.
- Databricks Genie was observed as disabled by administrator and unavailable for use.
- Five high-value candidates were surfaced for optional connection: Context7, Wolfram, Scite, Miro, Webflow.
- No candidate is treated as connected until connection is confirmed.

## Scrutiny protocol

For major changes:

CHECK 1 — source-of-truth
CHECK 2 — existing implementation
CHECK 3 — existing authority/security
CHECK 4 — plugin/tool capability
CHECK 5 — dependency impact
CHECK 6 — failure modes
CHECK 7 — rollback/reversibility
CHECK 8 — provenance
CHECK 9 — verification level
CHECK 10 — documentation/handoff

Only after all ten checks should implementation be promoted.

## Status

Capability ledger only. It does not install or connect any service.
