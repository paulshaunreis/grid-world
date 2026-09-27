# Grid World Architecture

## Direction

Grid World is a persistent cyber-fantasy social world built around three principles:

1. The client renders and predicts; it does not own authoritative state.
2. Creator code is easy to write but executes inside a capability-limited sandbox.
3. Money, land, inventory, identity, and ownership are protected server-side systems.

## Runtime boundaries

~~~text
Browser
  |
  +-- Renderer / Input / UI
  +-- Local prediction
  +-- Grid Script editor
  |      +-- Parser
  |      +-- Static security analysis
  |      +-- Capability analysis
  |      +-- Sandboxed runtime
  +-- Network API
         +-- World authority
         +-- Identity / permissions
         +-- Economy ledger
         +-- Ownership
         +-- Marketplace
         +-- Moderation / audit
~~~

The browser must never be treated as a trusted authority for currency, inventory, land ownership, marketplace settlement, or privileged administration.

## Engine strategy

The current prototype uses Three.js so development can continue without a rewrite.

A Babylon.js/WebGPU prototype is planned as a parallel technical evaluation. Migration is only justified if it materially improves physics, large-world rendering, tooling, asset pipelines, or runtime performance.

## World model

Grid World will support nine starter regions. Regions are streamed and independently versioned. Terrain is intended to become editable rather than being permanently authored geometry.

Target terrain capabilities:

- raise
- lower
- smooth
- flatten
- paint
- dig
- fill
- water
- material layers
- resource layers
- caves and underground spaces

## Security model

Security is defense in depth:

1. Authentication and session controls
2. Server-side authorization
3. Capability-based creator APIs
4. Grid Script static analysis
5. Sandboxed execution
6. Runtime quotas
7. Economy/ownership transaction validation
8. Audit logging
9. Abuse detection
10. Automated adversarial testing

No creator script or AI assistant receives unrestricted JavaScript, database credentials, service-role keys, arbitrary network access, or direct ownership mutation.

## AI boundary

AI may propose content or actions. The same policy and permission layer validates AI-generated actions as human-authored actions.

AI does not receive a privileged bypass around Grid World security.
