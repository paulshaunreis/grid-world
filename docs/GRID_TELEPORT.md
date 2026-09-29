# Grid Teleport Network

Grid World treats teleportation as a world system, not a UI trick.

## Node types

- **Teleportation Gate** — a large, landmark-scale transit structure used for major routes between districts or regions.
- **Teleport Pylon** — a compact destination/return node suitable for neighborhoods, creator parcels, galleries, wilderness areas, and future player-built worlds.

Every node has a stable Grid ID, region ID, position, orientation, destination list, access policy, status, cooldown, and clearance radius.

## Runtime contract

`GridTeleportSystem` owns:

- node registration
- destination resolution
- access checks
- cooldowns
- safe destination snapshots
- future server-authoritative request handling

The renderer only presents the node. A teleport node remains a Grid object with a stable identity.

## Safe travel

A successful teleport:

1. resolves a registered destination
2. checks that the route is online
3. checks access policy
4. checks actor cooldown
5. applies a destination clearance offset
6. restores player transform
7. updates multiplayer presence
8. persists player state
9. records a teleport event when authenticated cloud persistence is available

A client-side check is not the final security boundary. The eventual Grid Server must repeat authorization and destination validation before durable cross-region movement.

## Grid Omni Security

Teleport routes are designed to fail closed:

- unavailable destination -> no teleport
- guarded/offline node -> no teleport
- denied access -> no teleport
- cooldown -> no teleport
- unknown node -> no teleport

Future high-risk routes can add Grid Omni preflight, region health checks, destination capacity checks, quarantine, or emergency isolation.

## Persistent database

`public.grid_teleport_nodes` stores the durable node catalog.

`public.grid_teleport_events` stores the user's own travel history and gives Grid Omni an append-oriented audit trail.

Public nodes are readable through the Data API only while online. Creator-owned nodes can be managed by their authenticated owner.

## First Light network

The starter network currently includes:

- Civic Gate -> Gallery Pylon
- Gallery Pylon -> Civic Gate
- Wilds Gate -> Creator Pylon
- Creator Pylon -> Wilds Gate
- Market Pylon -> Civic Gate
- Wilds Pylon -> Wilds Gate

These are deliberately simple routes. The destination-list contract is already an array so future gates can expose multiple destinations through a secure destination selector without changing the underlying node identity.

## Visual direction

The first visual pass uses Grid PBR starter materials and WebGL-compatible geometry. Three.js also provides a portal example and current WebGPU rendering path, so the renderer can later evolve from a stylized energy surface into a true scene-through-portal effect without changing the teleport contract.

## Creator direction

Grid World Studio can eventually publish teleport nodes as ordinary creator-authored objects with capability declarations.

Teleport capabilities should remain explicitly permissioned. A creator script should never be able to silently bypass destination access, account restrictions, economy rules, or Grid Omni containment.
