# Grid World — Architecture Map

**Purpose:** onboarding map for engineers. This is a navigation document, not a second architecture implementation.

**Current branch baseline:** `grid/architecture-map` from main `6a43af94b1a19707b8b70277ffefe6eb77c9ca50`  
**Verification:** L0 source/document review for this increment. No CI/browser verification claimed.

## 1. System layers

```
Grid World product
│
├─ Omni Grid Core / platform direction
│  ├─ identity & permissions
│  ├─ world/network registry
│  ├─ economy/value abstractions
│  ├─ security/audit boundaries
│  └─ future multiplayer/network adapters
│
├─ Grid Engine / runtime
│  ├─ Three.js renderer + input
│  ├─ world orchestration
│  ├─ chunk streaming
│  ├─ terrain / matter editing
│  ├─ NPC / creature simulation
│  └─ presentation systems
│
├─ Experience systems
│  ├─ quests / missions
│  ├─ combat / PvE / PvP
│  ├─ teleport / landmarks / party
│  ├─ building / creator tools
│  └─ profiles / social / team
│
├─ Economy
│  ├─ currencies / wallets
│  ├─ ledger / audit trail
│  ├─ marketplace / Bazaar
│  └─ economics reporting
│
├─ UI / web
│  ├─ HUD + WindowManager
│  ├─ World Atlas + minimap
│  ├─ profiles / social
│  ├─ creator studio
│  └─ economy / quest / transit panels
│
└─ Persistence / authority boundary
   ├─ Supabase Auth
   ├─ Supabase Postgres / RLS / RPC
   ├─ Edge Functions (grid-combat)
   └─ future dedicated world/multiplayer servers
```

## 2. World hierarchy

The persistent-world model is:

```
Grid World network
  └─ World
      └─ Region / District
          └─ Chunk
              └─ Object / Entity
                  └─ Component / Script / State
```

Key implementations:

- `src/world/GridWorldRegistry.ts` — open-ended world identity and world-to-world connections. There is no fixed world-count cap.
- `src/world/WorldDefinition.ts`, `WorldRegion.ts` — world/region contracts and spatial boundaries.
- `src/world/WorldChunk*.ts` — streamable chunk state and persistence seams.
- `src/world/WorldDNA.ts` — world traits and presentation DNA.
- `src/world/WorldArchitectureSystem.ts` — generated world-specific architecture.
- `src/world/WorldEnvironmentSystem.ts` — generated environmental/weather presentation.
- `src/world/WorldSkinDirector.ts` — active world presentation selection.
- `src/theme/districts.ts` + `src/theme/districtZones.ts` — canonical built-region/district identities.
- `src/ui/WorldAtlas.ts` — world selection, transit context, history, materials, market context, and concept-only region disclosure.
- `src/ui/Minimap.ts` — local spatial view and district label.

**Invariant:** concept-only regions remain reference/map material until explicitly promoted. They must not become playable through accidental registry or UI wiring.

## 3. Runtime / engine

```
Input + UI
   ↓
main.ts orchestration
   ↓
World / simulation systems
   ↓
local runtime representation
   ↓
Three.js renderer
```

Important modules:

- `src/main.ts` — composition/orchestration boundary; wires existing systems together.
- `src/engine/` — engine/runtime support.
- `src/world/WorldSimulation.ts`, `LivingWorldSimulation.ts` — simulation orchestration.
- `src/world/WorldClock.ts`, `WorldClimate.ts` — time/climate foundations.
- `src/world/WorldChunkStreamer.ts` — chunk streaming.
- `src/world/WorldEvolutionSystem.ts` / ecology/resource systems — living-world changes.

Rendering should consume world state. Rendering objects are not authoritative persistent identity.

## 4. NPC / creature systems

```
NPC profile
  ↕
NPC society / brain
  ↕
needs + routines + relationships
  ↕
jobs / progression / production
  ↕
inventory / market / quests / travel
```

Primary modules include:

- `src/world/NPCProfile.ts`
- `src/world/NPCProfileSystem.ts`
- `src/world/NPCSocietySystem.ts`
- `src/world/NPCJobProgressionSystem.ts`
- `src/world/NPCProductionSystem.ts`
- `src/world/NPCSkillCertificateSystem.ts`
- `src/world/QuestSystem.ts` / `DynamicQuestSystem.ts`
- `src/world/CreatureEcologySystem.ts`
- `src/world/CombatSystem.ts`

Profiles are inspectable gameplay state, not just UI cards. NPC travel uses the same authoritative teleport boundary as players.

## 5. Player identity / social

```
Auth
 ↓
Grid profile authority
 ↓
presence / social / party
 ↓
target profile + world presentation
```

Key modules:

- `src/social/GridProfileAuthority.ts`
- `src/social/GridProfileService.ts`
- `src/profile.ts`
- `src/ui/GridTargetProfile.ts`
- `src/ui/GridCommunityPanel.ts`
- `src/ui/TeamArea.ts`
- party/presence modules under `src/`.

Player and NPC profile contracts share presentation ideas but must not collapse private/player-only data into NPC state.

## 6. Creator / matter systems

```
Creator Studio
 ├─ Build library / primitives
 ├─ Advanced transforms / grouping
 ├─ Crafted builder tools
 └─ Grid Matter terrain brushes
```

Relevant modules:

- `src/world/GridBuildLibrary.ts`
- `src/world/GridEasyBuildSystem.ts`
- `src/world/GridMatterTerrainSystem.ts`
- Creator Studio UI under `src/ui/` and `src/grid-world-studio*.ts`.

The current terrain model supports CARVE, BUILD, RAISE, LOWER, SMOOTH, and FLATTEN with persistence. Keep future voxel/clay sculpting additive to this model.

## 7. Combat / missions

Combat authority is shared rather than duplicated:

```
Player / creature request
        ↓
GridCombatAuthority
        ↓
Supabase grid-combat authority
        ↓
authoritative result
        ↓
local CombatSystem + quest/world consequences + HUD
```

PvE and PvP are state/zone/permission boundaries over the same combat architecture. PvP requires the target to be in the authoritative PVP state and protected zones remain outside the combat boundary.

Quest cadence, prerequisites, completion history, dynamic objectives, NPC givers, combat hooks, and persistence live in the existing quest stack.

## 8. Economy

```
UI / world request
      ↓
GridCombatAuthority
      ↓
Supabase RPC / Edge Function
      ↓
authoritative wallet + ledger
      ↓
market / economics reporting
```

Key modules:

- `src/economy/GridCurrencySystem.ts`
- `src/economy/GridMarketplaceItem.ts`
- `src/network/GridCombatAuthority.ts`
- `src/ui/GridEconomyPanel.ts`
- Supabase `grid-combat` Edge Function
- Bazaar tables/RPCs and ledger tables.

Client code must never become the authority for balances, settlement, inventory ownership, or marketplace transactions.

## 9. Persistence and Supabase boundary

Supabase is currently the authoritative backend boundary for identity-sensitive and economic operations.

Use the server boundary for:

- auth/session identity
- protected profile/presence data
- combat authority
- wallet/ledger reads and settlement
- marketplace settlement
- future ownership/land authority.

Do not place service-role credentials, unrestricted database access, or privileged ownership mutations in the browser.

Existing security findings, including the `grid_operator_policy_rules` RLS finding, remain a separate audit item; architecture work must not silently change policy semantics.

## 10. UI / presentation

The UI is a shared, movable visual system rather than isolated panels.

- `WindowManager` persists panel layout.
- `src/ui/grid-themes.css` supplies shared visual chrome and state treatment.
- Major panels are registered from `src/main.ts`.
- `WorldAtlas` is the world/network navigation surface.
- `Minimap` is the local navigation surface.
- Teleport presentation, party health, profiles, inventory, quests, economy, social, and creator surfaces should reuse the existing window/theme infrastructure.

Avoid creating a second theme, window, Atlas, minimap, or profile architecture when extending these surfaces.

## 11. Multiplayer / future network boundary

The intended future boundary is:

```
authoritative world state
        ↕
persistence adapter
        ↕
network replication adapter
        ↕
clients / regions / dedicated world servers
```

Realtime presence/chat/replication should synchronize authoritative state rather than define its meaning. Chunk streaming and world simulation should remain usable independently of a particular transport.

## 12. Onboarding path for a new engineer

Read in this order:

1. `docs/STUDIO_WORKFLOW.md`
2. `docs/AURORA_WORK_QUEUE.md`
3. `docs/AURORA_ENGINEERING_HANDOFF.md`
4. `docs/ENGINEERING_STATE.md`
5. `docs/ARCHITECTURE.md`
6. `docs/WORLD-ARCHITECTURE.md`
7. This map: `docs/ARCHITECTURE_MAP.md`
8. Then inspect `src/main.ts` and the module named by the active queue item.

**Rule:** audit the existing seam first, then make the smallest additive change that preserves the long-term boundary.

## Current architectural status

The prototype has a strong separation between world/simulation, presentation, creator tools, social/profile, combat, and economy concerns. The major future work is hardening authority, persistence, networking, streaming, and verification rather than multiplying parallel subsystems.

This map describes the current repository; it does not imply that the long-term Omni Grid Core or dedicated Grid Engine are fully implemented.
