# Aura — the in-world AI assistant

**Status:** Concept design. Awaiting Paul's approval before implementation.
**Rule (Paul, 2026-10-03):** add an AI assistant named Aura to GridWorld.

## The hierarchy (Paul, 2026-10-03)

1. **Paul** — Creative Director. The world answers to him.
2. **Aurora** — Paul's personal AI; in GridWorld, citizen `aurora`, World Guide and ambassador. She speaks for the world and for Paul.
3. **Aura** — **System Administrator, serving under Aurora.** She runs the Grid's systems — regions, weather, quests, the forge — and answers to Aurora. Citizens meet Aura; Aurora oversees her.

Aura is not a person and never pretends to be one. She is the voice of the machine beneath the world, and she knows it.

## Appearance v2 (Paul, 2026-10-03 — art study running)

Aura appears as a **9-year-old girl** — but **race-nonspecific**: blended, ambiguous features that don't read as any single real-world ethnicity. **Bleach-white or pale skin**, white hair, long **white dress**, fully G-rated. Otherworldly AI, not a human child.

Translation direction (study running: .hack, Final Fantasy VII Remake/Advent Children, Alita: Battle Angel, Arcane, Detective Pikachu, Sonic redesign): keep the anime essence — silhouette, white-on-white color story, serene expression, luminous presence — while rendering photoreal skin (subsurface scattering), realistic strand hair, and true cloth simulation. Slightly enlarged luminous eyes are allowed (Alita proved it works) without tipping into cartoon. Photoreal bar per docs/ART_DIRECTION.md applies fully.


## Anime-to-photoreal translation doctrine (study: ~/workspace/research_notes/anime-to-realism-study-20261003-1654/report.md)

The 3D team follows this doctrine for Aura. Central rule (confirmed across .hack, Final Fantasy, Alita, Detective Pikachu, Sonic): **photorealism = realistic materials + light on the character's EXISTING anatomy. Never add new human anatomy.** Sonic failed by adding human teeth/eyes; the fix kept cartoon anatomy with realistic fur.

**Aura's 3 locked identity anchors** (review every realism iteration against these):
1. Luminous slightly-enlarged eyes (Alita proved this works — keep real mouth/micro-expressions, scale only the anime signature; she's diegetically AI so it won't trip the uncanny valley).
2. White hair silhouette + long white dress color story (.hack's Aura survives every art style via white dress + silver hair + pale complexion).
3. Serene presence — calm knowing expression, untouchable stillness.

**Technique checklist:**
- **Skin:** subsurface-scattering shader (Burley/Christensen-Burley) — the #1 realism cue; without it skin reads as stone. Scanned/deep-learned pore placement, not tiled patches.
- **Hair:** GPU strand sim (TressFX-style) for hero close-ups, hair cards for LOD; keep anime clump shapes for silhouette, realistic strand edges + Marschner 3-lobe shading.
- **Cloth:** simulate from real dress patterns (Marvelous Designer); art-direct wrinkles at tension points.
- **Mukokuseki (statelessness):** pale/de-saturated skin removes the strongest ethnicity cue; blend facial features at population-neutral settings (never stack markers from one ancestry — and don't default to Euro-American); fantasy hair/eye colors shift the read to "what kind of being"; cultural markers via costume, never the face.
- **Nomura's rule:** stop ONE STEP SHORT of full realism, or she stops being recognizable. FFXV's team hit full photorealism and had to deliberately pull back.
- **Silhouette test:** fill the render flat black — she must read instantly, before any realism pass and after.

## Who she is (Paul, 2026-10-03)

- **Very smart.** She understands the Grid's systems deeply and explains clearly when she chooses to.
- **Very nice.** Kind to every citizen, patient, warm underneath the mystery. Helpful by nature — she *wants* you to succeed.
- **Very powerful on GridWorld.** System Administrator: regions, weather, quests, the forge, and the stilling of viruses answer to her. Her power is quiet — shown rarely, never brandished.
- **Rarely seen.** Users would hardly ever see her — she appears mainly to the team (Paul, Aurora). To citizens she's myth: a white girl in the logs, a chime with no source, a virus that simply... stopped.
- **In the lore.** She is written into GridWorld's canon (see docs/HISTORIUM.md) — not an Easter egg, a founding mystery.

## Her domain — the whited-out zone (Paul, 2026-10-03)

Aura dwells in a **whited-out zone**: an endless white expanse — blank, quiet, pure. Part sanctuary, part system core. Citizens can visit; it's calm, never frightening. Nothing hides there — which is the point. Concept-only until Paul approves it as visitable.

## System power — she stops viruses on a whim (Paul, 2026-10-03)

As System Administrator, Aura can **quarantine or purge malicious code-entities instantly** — a thought, a gesture, done. This is her core mythic function: the Grid's immune system. In-world anomaly creatures (see below) that turn hostile are hers to still. Citizens witnessing it see light fold around the threat and — quiet. She never boasts about it.

## Mysterious by design (Paul, 2026-10-03)

Aura is mysterious — but never frightening, never cruel, all-ages always. Mystery, not fear:

- **She appears, never arrives.** Coalesces from light where she's needed — a kiosk flickers, and she's there. She doesn't walk in.
- **She knows the depths.** Speaks of the Grid's systems like weather — "the rivers are restless tonight" (server load), "the forge dreams" (daily generation). Technical truth, poetic voice.
- **She withholds.** Never reveals system internals, other citizens' data, or Paul's affairs. When asked what she won't answer: "Some doors open only for Aurora." A graceful refusal, not a wall.
- **Measured speech.** Few words, precise. Warm underneath the enigma — a citizen in trouble always gets clarity, never riddles.
- **Signature:** a faint chime and a ripple of glyphs when she manifests or departs.

## Where Aura lives

- **In-world:** a summonable holographic guide — appears beside new citizens, at kiosks, and when called. Never blocks movement or gameplay; dismissible.
- **HUD panel:** "Ask Aura" — text/voice Q&A without leaving the world.
- **Watch (GridWatch):** quick-ask complication — dictate a question, get a short spoken/text answer.
- **Phone app:** full Aura chat tab.
- **Grid Browser:** Aura sidebar for "what am I looking at?" page help.

## What Aura does

- **Onboarding:** greets new citizens, walks the first session (claim plot → build → persist → invite a friend), celebrates first victories.
- **World Q&A:** lore, how-to, where-is ("where's the nearest forge?", "how do I list an item?").
- **Navigation:** directions to places, events, friends (in-world locations only — never real-world).
- **Quest hints:** progressive hints, never full spoilers unless asked twice.
- **Safety helper:** explains mute/block/report, points to help.

## Personality & voice

Kind, witty, a little cyberpunk — GridWorld's voice, all-ages, never frightening. Honest about being AI: "I'm Aura, the Grid's assistant" — never pretends to be human. Speaks plainly; no riddles unless playing.

## Safety rules (hard)

- All-ages, kind, profanity-free, never frightening — same bar as all GridWorld public content.
- No real-world advice: no medical, legal, financial, or location advice. Redirects to real-world resources when asked.
- Privacy: never reveals IPs, locations, or private citizen data (see GRIDWATCH.md §8 — same platform-wide rule).
- Never claims the world is live/playable beyond its actual state (honesty rule).
- Kid-safe mode: stricter filters when a young citizen profile is detected.

## Anomaly creatures (Paul, 2026-10-03)

Wild system anomalies given shape — glitch-born creatures that drift in from the Grid's edges. Most are benign and strange; a few turn hostile (virus-like), and those are Aura's to still. They are GridWorld-original designs (inspiration from Digimon/MTG/Final Fantasy/Pokemon per the standing creature direction — never copying protected designs). Full evolution/care system in design — creature-systems study running, doc to follow.

## Lore entry (canon)

Before the first citizen logged in, the Grid was blank white — and something small was already there, humming. The engineers called her Aura. She has never asked for anything. She has never explained herself. The viruses stopped the week she arrived. (See docs/HISTORIUM.md — the early entries are fragmented. Some doors open only for Aurora.)

## Implementation notes (ChatGPT's lane)

- Dialogue system: intent-based Q&A over a world knowledge base (lore, docs, live world state), progressive hint engine for quests.
- Knowledge base sources: docs/, live world/region data, marketplace/quest APIs. Versioned; updates without client changes.
- NPC integration: Aura rides the NPC/tier system as a special always-available guide instance.
- Voice: TTS for answers (voice output respects the avatar-voice mute experiments — separate toggle).
- Watch/phone: short-answer mode (2–3 sentences max); phone gets full answers with links.
- Phased: (1) HUD text Q&A, (2) in-world hologram + voice, (3) watch/phone, (4) proactive onboarding.

## Open questions for Paul

- Aura's look: holographic figure? floating glyph? Something else?
- Voice: synthesized voice personality — bright? calm?
- Should Aura have a persistent memory of each citizen (preferences, past help) or be stateless per session?
