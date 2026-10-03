# Digi-Cracks — AR: the Grid bleeding into the real world

**Status:** Concept design. Awaiting Paul's approval before implementation.
**Rule (Paul, 2026-10-03):** Ingress / Pokémon GO-style AR for the phone and watch apps, integrated into GridWorld. Creatures findable in GridWorld appear through "digi-cracks" that come out of GridWorld into the AR real world — like Digimon's digital-world bleed, but custom GridWorld lore and systems, across platforms.

## Lore: the Seams

When the First Builders raised the Ancient Gates, the seams between the Grid and the physical world never fully closed. Where the seams run thin, the Grid **cracks through** — a digi-crack: a shimmering rift in mid-air, chiming faintly, smelling like rain. Light-weather drifts out. And sometimes, a wild anomaly wanders through.

Digi-cracks are wondrous, never frightening. They appear at dawn and dusk, near parks, plazas, waterfronts — places where the real world already feels a little magical.

Aura watches the seams. The dangerous ones — the virus-things that slip through — she seals on a whim, the way she always has. The playful ones, the curious anomalies, she leaves open. Some doors open only for Aura; some cracks, she opens for everyone.

## The phone game: SEAMWALKER (working title)

An Ingress/PoGo-style AR layer inside the GridWorld phone app — same citizen, same account, same collection.

**Core loop:** walk → phone hums (a seam is near) → find the digi-crack in AR → it opens → anomaly emerges → **Resonance Tuning** (the same taming system as in-world — one verb family everywhere) → creature joins your collection, visible in-world and in AR.

- **Walking charges your tuner.** Real steps = tuning energy (PoGo's walking lesson, minus the grind). The watch counts it.
- **Seam stabilization (the Ingress lesson, cooperative):** big cracks are unstable — a lone citizen can't tune there. Bring friends; stabilize the seam together; everyone shares the attunement. Ancient things open for communities.
- **Crack Days (the PoGo lesson):** monthly live-ops — rare anomalies, themed seams (Emberfall heat-shimmer in summer, Verdant spore-glow in spring).
- **Your buddy walks with you:** send an in-world creature out through a crack to walk beside you in AR. It finds small gifts. It gets happy.
- **Fiction tie:** every AR crack echoes an in-world place — the park's crack *is* the Verdant Circuit's edge, thinning through. The worlds touch.

## The watch: crack radar

GridWatch becomes the field instrument (watch = monitor + command):

- **Proximity haptics:** a distinct tremor when a seam is within walking distance — no need to stare at the phone.
- **Crack compass:** glanceable arrow + distance to the nearest open crack.
- **Quick-tune:** simple anomalies can be tuned from the wrist (rhythm tap); bigger ones hand off to the phone.
- **Step/energy sync:** walking energy accrues on the watch, spends on the phone — one pool.
- **Battery law applies:** no constant GPS — geofence wakes, batched syncs, crack data prefetched on Wi-Fi. The watch sips, never gulps.

## Cross-platform continuity

One citizen, three surfaces, zero seams in the *experience* (only in the lore):

| | In-world (game) | Phone (AR) | Watch |
|---|---|---|---|
| Find creatures | Wild zones, Verdant Circuit | Digi-cracks near you | Proximity alerts |
| Tame | Resonance Tuning (full) | Resonance Tuning (AR) | Quick-tune (simple) |
| Collection | Full menagerie | Full menagerie | Buddy + stats |
| Walk rewards | — | Step energy, buddy gifts | Step counting |
| Events | Gate raisings, world events | Crack Days | Event pings |

A creature tuned through a crack appears in your in-world plot. A creature raised in-world can walk with you in AR. Nothing is locked to one surface.

## Safety rules (real world, non-negotiable)

- Cracks spawn only in safe public places (parks, plazas, waterfronts) via map data — never on roads, private property, or hazardous terrain.
- No mechanics that reward going out alone at night or into unsafe areas. Dawn/dusk flavor, never night-required.
- All-ages, kind, never frightening — a crack opening should feel like spotting a deer, not a jumpscare.
- Anti-spoof: server-side movement sanity checks (the Ingress lesson — spoofers killed trust).
- Parental comfort: no chat with strangers required; group stabilization works with friends or opt-in locals.

## Implementation notes (ChatGPT's lane)

- **AR stack decision needed:** native ARKit/ARCore vs WebXR in the phone app. (WebXR keeps the unified-UI promise; native gets better tracking. Recommend: prototype WebXR, measure, decide.)
- **Server:** seam/crack spawning service (map-data-driven POIs, density caps, event overrides), movement-verification, shared creature-collection API with the in-world game, step-energy ledger.
- **Shared systems first:** Resonance Tuning and the creature collection must be platform-agnostic services before AR ships — AR is a client of the same systems, not a second game.
- **Phased:** Phase 1 = crack map + alerts + collection sync (no AR rendering — "radar mode"). Phase 2 = AR crack visuals + tuning. Phase 3 = buddy AR + Crack Days.

## Open questions for Paul

- Factions/teams (Ingress-style), or keep it fully cooperative?
- Name: SEAMWALKER, or fold it into the GridWorld app as "AR mode"?
- May wrist quick-tunes spend GRC, or phone-confirm like the GridWatch rule?
