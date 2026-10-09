# Grid Cards — GridWorld Trading Card Game Design

**Date:** 2026-10-08
**Status:** Design proposal — in active development, NOT live.
**Paul's direction:** Digital-first. Genuinely fun like Yu-Gi-Oh, Digimon, MTG, Pokemon. Standard TCG card ratio. A pillar, not a side project. No pay-to-win — ever.

---

## Part 1 — Research: What Makes TCGs Fun (and What Kills Them)

### Yu-Gi-Oh!
- **The fun:** Explosive combo turns. Summoning chains (Fusion, Synchro, Xyz) where one card leads to another in a cascade — the "watch me cook" feeling. Dramatic, anime-flavored duels where a single turn can flip the game.
- **The lesson:** Players love *transformation* — weak cards becoming boss monsters through clever sequencing. But unchecked combo depth becomes oppressive: games decided on turn one, 10-minute solitaire turns, new players locked out.
- **What we take:** The emotional high of evolving your board state mid-game. **What we avoid:** Combo turns that take longer than the opponent's attention span.

### Magic: The Gathering
- **The fun:** The color pie — five distinct philosophies of play (aggression, control, trickery, growth, order). Deckbuilding as self-expression. The stack — a clean, logical system for resolving conflicting effects that "very closely resembles coding." 30+ years of depth.
- **The lesson:** Asymmetric playstyles give the game infinite replayability. But the land/mana system creates the worst feel-bad in TCGs: *mana screw* (drawing no lands) and *mana flood* (drawing only lands) — games lost to shuffling, not skill.
- **What we take:** Distinct affinities (our color pie), clean effect-resolution rules. **What we avoid:** Any resource system where you can lose to your own deck's randomness.

### Pokemon TCG
- **The fun:** Evolution — your cute basic becomes a powerhouse EX. Simple to learn (kids play it), with real depth at competitive levels. Prize cards create constant tension: every knockout matters because it brings you closer to winning.
- **The lesson:** The "my guy grew" moment is the most universal joy in card games. Prize-based win conditions make every attack meaningful. But energy attachment is slow — games can feel like waiting to do the fun thing.
- **What we take:** Mid-game evolution as a core emotional beat. Prize-like win condition. **What we avoid:** Slow resource buildup that delays the fun.

### Digimon Card Game
- **The fun:** The **memory gauge** — a single shared resource track (10 to 0 to 10). Spending memory pushes the marker toward your opponent; cross zero and your turn ends. Every play is a gamble: go big and hand your opponent a huge turn, or play small and keep tempo. No resource cards needed — no mana screw, ever.
- **The lesson:** This is the single most praised resource innovation in modern TCGs. It turns *every single card play* into a meaningful decision. Inherited effects (cards under your Digimon grant passive bonuses) make the "stack" under a creature matter.
- **What we take:** The shared-gauge concept is our foundation. **What we avoid:** Nothing — this system is nearly perfect for digital-first design.

### Digital TCG successes
- **Hearthstone:** Proved auto-rules-enforcement makes games faster and friendlier. Random effects that would be miserable physically become delightful digitally. Lesson: *design for the screen, not the table.*
- **Marvel Snap:** 3-minute games, simultaneous turns, location-based board. Proved short sessions + mobile-first = massive audience. Lesson: *respect the player's time.*
- **Pokemon TCG Pocket:** Proved the collection itself is a game — pack-opening as entertainment, gorgeous card art as the reward. Lesson: *the cards are content, not just game pieces.*

### What kills TCGs (failure modes we design against)
1. **Artifact (Valve):** Cards only obtainable by purchase/trade + no progression goals + hostile market. Died in months. *Lesson: never gate power behind money.*
2. **Overcomplexity:** "Read the whole rulebook" games bleed casual players. *Lesson: 3 keywords max per card, teach-as-you-play tutorial.*
3. **Pay-to-win:** "The kid with the strong cards was just stronger." The moment money beats skill, trust dies. *Lesson: cosmetics-only monetization (Paul's hard rule).*
4. - **Dead metas:** One dominant deck = solved game = everyone quits. *Lesson: digital balance patches quarterly, living ban/restricted list.*
5. **Mana screw / resource randomness:** Losing to shuffling isn't gameplay. *Lesson: our shared gauge eliminates this entirely.*

---

## Part 2 — Grid Cards: Core Design

### The elevator pitch
> Your creatures evolve mid-battle. Every card you play feeds your opponent's next turn. Every move is a gamble — go big now, or stay patient and strike later.

### The resource system: CHARGE (shared gauge)
- One **Charge gauge** shared by both players, numbered **-10 to +10**.
- It starts at **0**. Playing a card costs Charge equal to its cost — the gauge moves that many steps **toward your opponent's side**.
- When the gauge crosses past **+10 or -10** (your opponent's end), **your turn ends immediately** and any unspent plays are lost.
- At the start of your turn, the gauge resets toward center by a fixed amount (the "recharge").
- **Why it works:** No lands, no energy cards, no mana screw — ever. Every card play is a real decision: spend 6 on a bomb and hand your opponent a massive turn, or spend 2 and keep the tempo tight. This is the Digimon memory gauge evolved for GridWorld, and it's the heart of the game.

### The evolution system: SURGE
- Creature cards have a **Surge form** — a stronger version that stacks **on top** of the base creature (like Digimon's digivolution stack).
- To Surge, pay the Surge cost **and** meet the condition printed on the card (e.g., "Surge: 3 Charge — requires a Volt Realm in play").
- Cards underneath grant **inherited effects** — passive bonuses that stay active as long as the stack exists. The deeper your stack, the more dangerous your creature.
- **Why it works:** The "my guy grew" moment, every game. Stacks create attachment — that Voltkit you've been building since turn 2 *matters* to you. Removing it feels like a real loss, which makes protection and removal spells meaningful.

### The board: REALMS
- Each player may have **one Realm** in play — an environment card (First Light, Verdant Wilds, The Neon Grid, etc.).
- Realms grant a passive buff to creatures of matching affinity **and** have an activated ability (usable once per turn).
- Playing a new Realm **replaces** the old one (it goes to the discard pile).
- **Why it works:** The board feels like a *place*, not a spreadsheet. Realm choice is deck identity — a Volt deck in the Neon Grid plays differently than the same deck in Verdant Wilds.

### Instant plays: SIGNALS
- Signal cards are one-shot effects playable on **either player's turn** (Yu-Gi-Oh trap energy, MTG instant energy).
- Named after the Signal Ledger lore — you're literally broadcasting a signal across the Grid.
- Signals cost Charge just like everything else, so even defensive plays feed the gauge gamble.

### Win condition: GRID POINTS
- Each player starts with **5 Grid Points**.
- When your creature deals combat damage to the opponent directly (unblocked attack, or damage that exceeds a blocker's Guard), you knock out Grid Points equal to the excess.
- First player to **0 Grid Points loses**.
- Alternate loss: if you must draw from an empty deck, you lose ("blackout").
- **Why it works:** Every attack matters (Pokemon prize tension). Games end decisively — no 40-minute stalls.

### The five affinities (our color pie)
| Affinity | Mascot | Philosophy | Playstyle |
|----------|--------|------------|-----------|
| **Volt** | Voltkit | Energy, speed, circuits | Aggressive, fast, tempo |
| **Flora** | Mossimp | Growth, patience, nature | Defensive, healing, late-game |
| **Cosmos** | Glimmerwing | Mystery, stars, knowledge | Control, disruption, card selection |
| **Stone** | Pebblor | Endurance, memory, weight | Big bodies, immovable, value |
| **Tide** | Nixie | Change, flow, trickery | Bounce, draw, tempo swings |

Decks are 40 cards, up to 2 affinities (keeps identity tight, prevents good-stuff piles).

### Card types
1. **Creature** — your fighters. Have Might (attack) / Guard (defense). Can Surge.
2. **Surge** — evolution forms that stack onto creatures. Not playable alone.
3. **Realm** — environment cards. One per player.
4. **Signal** — instant-speed one-shot effects.
5. **Protocol** — sorcery-speed effects (your turn only, bigger impact than Signals).

### Keywords (kept tight — max 3 per card)
- **Guardian** — can block any number of attackers.
- **Swift** — can attack the turn it enters play.
- **Encrypted** *(digital-only)* — played face-down with hidden stats; revealed when it attacks or is attacked. Impossible in physical — pure digital advantage.
- **Echo** *(digital-only)* — the card remembers game events ("Echo: +1 Might for each Signal played this game"). Tracked automatically — impossible to track physically.
- **Overclock** — pay extra Charge for a bigger effect (risk/reward on the gauge).

---

## Part 3 — The Fun Curve

### Fun in 30 seconds (the hook)
Your first creature hits the board. You play a 2-cost card, watch the Charge gauge swing toward your opponent, and immediately feel the tension: *do I keep going?* Then your Voltkit Surges — the art transforms, the stats jump, and you feel like a genius. That's the hook: **visible growth + constant gambling.**

### Deep in 30 hours (the mastery)
- Gauge mathematics: knowing exactly how much Charge to leave your opponent.
- Surge sequencing: which inherited effects to stack, in what order.
- Realm timing: when to overwrite your own Realm for the activated ability.
- Affinity pairing: the 10 two-affinity combinations each play differently.
- Encrypted bluffing: the mind games of hidden information.
- Meta reading: which decks are popular, what beats them.

### Target game length: 5–8 minutes
Shorter than MTG (20–50 min), longer than Marvel Snap (3 min). Respects your time, still feels like a real duel.

---

## Part 4 — Digital-First Advantages

Things Grid Cards does that physical cards **cannot**:
1. **Surge cinematics** — creatures transform with full animation, particle effects, sound.
2. **Encrypted cards** — hidden stats tracked by the server, revealed dramatically.
3. **Echo memory** — cards that remember match history automatically.
4. **Living balance** — quarterly patches adjust overpowered cards *for everyone* (no ban-list feel-bads, no $100 cards becoming worthless overnight).
5. **Smart matchmaking** — ranked ladder, skill-based pairing, no pub-stomping.
6. **Auto-enforcement** — no judge calls, no missed triggers, no rules arguments. The game teaches itself.
7. **Dynamic card art** — animated/holographic card treatments, seasonal variants.
8. **Instant collection** — no shipping, no pack-mapping, no counterfeits. Published pull odds.

---

## Part 5 — Card Specs

### Dimensions
- **Standard TCG ratio:** 63mm × 88mm (2.5" × 3.5") — identical to MTG, Pokemon, Yu-Gi-Oh.
- **Digital render:** 750 × 1050px (print-ready 300 DPI equivalent: 744 × 1039px).
- **Aspect ratio:** 5:7.

### Visual anatomy (top to bottom)
1. **Name plate** — card name, affinity-colored.
2. **Cost gem** — Charge cost, top-right.
3. **Art window** — creature/environment illustration (~45% of card height).
4. **Type line** — "Creature — Volt" / "Surge — Voltkit" / "Realm" / "Signal".
5. **Rules box** — abilities, keywords, flavor text (italic, separated).
6. **Stats** — Might / Guard, bottom corners.
7. **Set icon + rarity gem + collector number** — bottom center.
8. **© GridWorld** — bottom edge, every card.

### Rarity (cosmetic prestige, NOT power)
- **Common / Uncommon / Rare / Mythic** — rarer cards get animated art treatments and foil effects.
- **Paul's rule:** Rarity NEVER means stronger. A common can be tournament-defining. Power is distributed across all rarities by design.

---

## Part 6 — Sets & Release Structure

- **Sets of ~150 cards**, 4 per year (quarterly).
- **Set 1: "First Light"** — the five mascots, core Realms, foundational Signals. The onboarding set.
- Each set themed around a GridWorld region or story arc.
- **Digital boosters** with published odds. No physical packs at launch (physical is Phase 3+).
- **Rotating Standard format** — newest 8 sets legal. Keeps the meta fresh, prevents power creep from old cards.
- **Eternal format** — everything legal, for the enfranchised.

---

## Part 7 — Honest Monetization (Paul's Rules)

1. **No pay-to-win. Ever.** Cards are never sold for power. Full stop.
2. **All cards earnable through play.** Daily/weekly challenges, ranked rewards, draft modes.
3. **Money buys:** cosmetics (card backs, board skins, avatars, animated treatments), convenience (battle pass XP boosts — never exclusive power), and *draft entries* (everyone drafts from the same pool — skill decides).
4. **Free competitive access:** the ranked Standard card pool is available to all players through a rotating free set. You can hit the top of the ladder spending $0.
5. **Published odds** on every digital pack. No dark patterns, no fake scarcity timers on power.
6. **No loot-box gambling mechanics for minors** — cosmetic packs carry the same transparency rules as the User Rights Charter.

---

## Part 8 — Tutorial & Onboarding

- **Story campaign:** Play as a newcomer guided by Voltkit through First Light. Each mission teaches one mechanic (Charge → Creatures → Surge → Realms → Signals).
- **Teach-as-you-play:** Tooltips on every keyword, suggested plays highlighted (toggleable), undo button for misplays in casual modes.
- **Starter decks:** One free 40-card deck per affinity. Yours to keep.

---

*Grid Cards — every move is a gamble, every creature can become a legend.*
*© GridWorld*

---

## Part 9 — Battle Network Research: Lessons for GridWorld

**Date added:** 2026-10-08 (Paul's direction: "check MegaMan Battle Network for ideas")

### What made Battle Network work
Researched via Capcom fandom wiki, RPGFan, RPGamer, GameSpot, and GamingBolt retrospectives:

1. **The PET device** — every citizen carries a personal terminal housing their NetNavi. The bond between human operator and digital partner is the emotional core. *It's not just a tool — it's a relationship.*
2. **NetNavis** — digital organisms with distinct personalities living in the cyber world. Each one is unique to its operator. Players customize and grow *their* Navi.
3. **The parallel cyber world** — a complete digital layer existing alongside the physical world. You "jack in" through any networked device. Two worlds, one story — actions in one affect the other.
4. **Chip-based combat** — 30-chip folders, 5 drawn per turn, matching by name or letter code. Deckbuilding with real-time tactical execution on a 3×6 grid.
5. **Grid-based real-time battles** — 3×3 player territory vs. 3×3 enemy territory. Positioning matters. Territory can be stolen. Fast, skill-based, readable.
6. **Five elements** — Neutral, Fire, Water, Electric, Wood. Clean elemental triangle with double damage on weakness.

### GridWorld applications (original implementations, inspired — never copied)

| Battle Network concept | GridWorld implementation |
|---|---|
| PET device | **Gridlink** — a wrist-worn terminal every citizen carries. Houses your companion creature's digital echo, manages your Grid Cards deck, and is your key to jacking into the Undergrid. |
| NetNavi partner | **Bonded Companion** — one creature you bond with deeply (see Evolution system, Part 13). It lives in your Gridlink, fights beside you in the 3D world, and its card version is your signature Grid Cards fighter. |
| Parallel cyber world | **The Undergrid** (see Part 11) — a full digital layer beneath physical GridWorld. Jack in at any terminal. Grid Cards tournaments happen here. |
| Chip folder (30) | Card deck (40) — already analogous. Future "Program" card subtype for one-shot utilities. |
| 5 elements | 5 affinities (Volt, Flora, Cosmos, Stone, Tide) — already analogous. |
| Grid battles (3×3 vs 3×3) | **Arena Mode** (future) — a positional Grid Cards variant played on a 3×3 grid per side in the Undergrid's duel terminals. Territory control meets card play. |
| Virus enemies | **Corruption events** — rogue code-entities in the Undergrid that players clear cooperatively. |

### Key design principle adopted
Battle Network's genius was making the digital world feel *as real as* the physical one — with its own geography, citizens, dangers, and economy. The Undergrid gets the same treatment: not a minigame zone, but a full second world.

---

## Part 10 — NPC Cards: The Team Roster

The 24 AI team members appear as **NPC cards** — a special supertype. Rules:
- **Mythic rarity only.** NPC cards are never Common/Uncommon/Rare.
- **Legendary rule:** Max 1 copy of each named NPC per deck. Max 3 NPC cards total per deck.
- **Lore-rich:** Each card's flavor text is the NPC's actual in-world greeting.
- Each NPC's ability reflects their real role and personality from `src/avatars/teamRoster.ts`.

| # | Card Name | Affinity | Cost | M/G | Ability | Flavor |
|---|---|---|---|---|---|---|
| 1 | Aurora, World Coordinator | Cosmos | 5 | 3/5 | When Aurora enters play, search your deck for a Realm and put it into your hand. | "Welcome to Grid World." |
| 2 | Link, Systems Engineer | Volt | 4 | 3/4 | Signals you play cost 1 less Charge. | "Systems online." |
| 3 | Rey, Discovery Guide | Tide | 3 | 2/3 | When Rey attacks, draw a card. | "Hey! Come explore." |
| 4 | Elder, Logic Advisor | Stone | 6 | 4/6 | Guardian. Opponents' Signals cost 2 more Charge. | "Observe first. Then decide." |
| 5 | Veyr, First Principle | Cosmos | 2 | 2/2 | When Veyr enters play, name a card type. Opponents can't play that type until your next turn. | "Begin with what must be true." |
| 6 | Nyxen, Security Watcher | Cosmos | 4 | 3/3 | Encrypted. When revealed, cancel target Signal being played. | "Assume the boundary will be tested." |
| 7 | Orin, Systems Cartographer | Volt | 3 | 2/4 | When Orin enters play, look at target opponent's hand. | "Every connection has consequences." |
| 8 | Seraith, Paradox Analyst | Cosmos | 5 | 4/4 | When conflicting effects would resolve, you choose the order. | "Two good rules can still collide." |
| 9 | Vael, Minimalist | Stone | 2 | 3/2 | Vael costs 1 less Charge for every 3 cards in your discard pile. | "Need is a stronger reason than novelty." |
| 10 | Kairox, Timekeeper | Cosmos | 4 | 2/5 | Echo: +1 Guard for each turn that has passed this game. | "Timing is part of correctness." |
| 11 | Morrow, Historian | Stone | 3 | 2/3 | When Morrow enters play, return a Protocol from your discard pile to your hand. | "Old worlds leave useful clues." |
| 12 | Cipher, Silent Watcher | Cosmos | 3 | 3/2 | Encrypted. Cipher can't be targeted by opponents while face-down. | "I notice what gets overlooked." |
| 13 | Solenne, Humanist | Flora | 4 | 2/5 | Guardian. When Solenne blocks, restore 1 Grid Point. | "Technology still serves people." |
| 14 | Rook, Strategist | Volt | 5 | 4/4 | At the start of your turn, shift the Charge gauge 2 steps toward you. | "Think beyond the next release." |
| 15 | Echo, Tester | Tide | 2 | 2/1 | Swift. When Echo is deleted, draw a card. | "Show me what breaks." |
| 16 | Umbra, The Unknown | Cosmos | 7 | 6/6 | Encrypted. When revealed, target opponent discards 2 cards at random. | "What did nobody ask?" |
| 17 | Civitas, Constitutional Architecture | Stone | 4 | 3/4 | Card text on opponent's cards can't be changed by effects. | "Rules should remain understandable." |
| 18 | Axiom, AI Ethics | Cosmos | 4 | 3/4 | When an opponent would gain control of a creature you control, cancel that effect. | "Agency is part of the system." |
| 19 | Mosaic, Comparative Systems | Tide | 3 | 3/3 | Mosaic gains the keywords of target creature until end of turn. | "Compare before reinventing." |
| 20 | Sentinel, Rights & Accessibility | Flora | 5 | 3/6 | Guardian. Your Grid Points can't drop below 1 while Sentinel is in play. | "Safety should not erase agency." |
| 21 | Praxis, Governance to Software | Volt | 4 | 4/3 | When you play a Protocol, you may copy its effect. | "A principle is useful when it changes behavior." |
| 22 | Atlas, Simulation Intelligence | Flora | 6 | 5/5 | When Atlas enters play, create a 2/2 Sprite creature token. | "Behavior should have reasons." |
| 23 | Tessera, Technical Art | Tide | 3 | 2/4 | Creatures you control get +1 Guard for each Realm in play. | "A good material changes how a place feels." |
| 24 | Waypoint, Ecology & Terrain | Flora | 4 | 3/5 | When Waypoint enters play, you may swap your Realm for another in your hand without discarding. | "Land is a system, not a backdrop." |

**Card art:** Key NPCs (Aurora, Link, Nyxen, Sentinel, Atlas, Umbra) have generated portrait art in `public/cards/npc/`. Remaining 18 use stylized silhouette treatments until their portraits are commissioned. All NPC cards carry the TEAM badge motif in the card frame.

---

## Part 11 — The Undergrid: GridWorld's Digital World

### Concept
Beneath the physical GridWorld lies **the Undergrid** — a complete digital layer, accessible by jacking in through any terminal, Gridlink device, or designated portal. It is not a minigame zone. It is a second world with its own geography, inhabitants, dangers, and economy.

### Visual identity
- **Look:** Endless neon data-canyons, floating code fragments that drift like snow, server-spires rising into a sky of streaming light. The "ground" is a translucent grid; below it, deeper layers glow in shifting colors.
- **Lighting:** Deep indigo base with cyan, magenta, and amber data-streams. Everything emits soft light — there are no true shadows here, only dimmer data.
- **Sound:** Low harmonic hum, chimes when data packets pass, a rising tone near points of interest.
- **Art direction:** Photorealistic cinematic meets digital surrealism. Think Tron meets Blade Runner 2049's Las Vegas — but original to GridWorld.

### Geography (districts)
1. **The Concourse** — the entry hub. Duel terminals, markets, social plazas. Safe.
2. **The Stacks** — towering server-spires. Home to Archivists. Puzzle and exploration gameplay.
3. **The Streams** — fast data-rivers where Couriers race. Movement challenges, time trials.
4. **The Glitchlands** — unstable, fragmented territory. Wild Glitchlings, rare resources, real danger (Corruption events spawn here).
5. **The Core** — the deep center. Restricted. Story-critical. Something lives down there.

### Inhabitants: Sprites
The Undergrid's native creatures are called **Sprites** — humanoid digital beings (see Part 12). They have their own society, jobs, and culture. They trade in **fragments** (the Undergrid's local resource, convertible to GWC at terminals).

### Grid Cards in the Undergrid
- **Duel Terminals** in the Concourse and every stadium let players jack in for Grid Cards matches rendered as full 3D battles — your cards manifest as creatures fighting on a holographic grid.
- **Arena Mode** (future): positional 3×3-grid variant played live in the Undergrid.
- Tournament venues (see Part 14) are all located in the Undergrid.

### Corruption events
Rogue code-entities ("Corruptions") spawn in the Glitchlands. Players team up to clear them — cooperative PvE that rewards Fragments, rare card packs, and Sprite reputation. This is the Undergrid's living threat, keeping the world dynamic.

---

## Part 12 — Humanoid Creatures: The Sprites

Paul's direction: GridWorld needs humanoid creatures too — not just animal-like mascots. The Sprites are the Undergrid's native people: digital beings with humanoid forms, each filling a societal role. Art in `public/creatures/humanoids/`.

### 1. Ping — the Courier
- **Role:** Messenger sprite. Carries data-packets across the Undergrid at impossible speed.
- **Look:** Sleek, androgynous humanoid, body of flowing cyan data-streams that trail behind like ribbons. No face — just a smooth visor-like surface that displays simple emoticons. Lean, aerodynamic.
- **Personality:** Cheerful, impatient, always moving. Speaks in bursts.
- **Signature:** Leaves a fading light-trail. The fastest thing in the Undergrid.
- **Grid Cards:** Tide affinity creature, Swift keyword. "Ping, Packet Runner" — 2 cost, 2/1.

### 2. Bulwark — the Guardian
- **Role:** Firewall guardian. Stands watch at district gates and server-spires.
- **Look:** Massive humanoid, 8 feet tall, body of interlocking hexagonal crystal plates in deep amber and bronze. Glowing seams. Heavy, immovable, kind-eyed.
- **Personality:** Slow-spoken, deeply loyal, gentle unless provoked.
- **Signature:** Its armor plates shift and reseal — damage visibly repairs in real time.
- **Grid Cards:** Stone affinity creature, Guardian keyword. "Bulwark, Gatekeeper" — 5 cost, 3/7.

### 3. Glitchling — the Trickster
- **Role:** Wild sprite of the Glitchlands. Chaotic, unpredictable, oddly lovable.
- **Look:** Small humanoid, constantly flickering and fragmenting — parts of its body dissolve into pixels and reform. Magenta and violet static. Mismatched eyes (one amber, one cyan). Grins too wide.
- **Personality:** Mischievous, curious, speaks in sentence fragments. Not evil — just entropy with a smile.
- **Signature:** Randomly teleports short distances when excited. Leaves pixel-dust.
- **Grid Cards:** Cosmos affinity creature, Encrypted keyword. "Glitchling, Entropy Sprite" — 3 cost, 3/2.

### 4. Memoria — the Archivist
- **Role:** Keeper of old data in the Stacks. Remembers everything the Grid has ever stored.
- **Look:** Tall, serene humanoid draped in holographic robes that display scrolling text and images from stored memories. Translucent skin with faint circuit patterns. Calm, ancient eyes.
- **Personality:** Patient, wise, speaks in stories. Never hurries.
- **Signature:** Its robes replay moments from GridWorld's history — living memory made visible.
- **Grid Cards:** Cosmos affinity creature. "Memoria, Keeper of Records" — 4 cost, 2/5. "When Memoria enters play, return a card from your discard pile to your hand."

All four follow GridWorld's photorealistic cinematic art direction with the Undergrid's digital-surrealist overlay. They are 100% original designs.

---

## Part 13 — Creature Evolution, Cross-Breeding & Fusion

**Date added:** 2026-10-08 (Paul's direction: "like Yu-Gi-Oh's fusion system" — a core pillar)

### Design philosophy
Deep but understandable. Every system must be learnable in 60 seconds and masterable over months. No system should feel mandatory — they're all opt-in paths to personalization and power.

---

### 13A. EVOLUTION — Branching Paths

Creatures don't just get stronger — they *become* something new. Evolution is branching (Eevee-style), not linear.

**How it works (3D world):**
- Every creature has 2–4 evolution paths, each unlocked by different conditions.
- **Evolution conditions** (mix and match per species):
  - **Level** — reach a threshold through activity and care.
  - **Bond** — deep relationship with your citizen (measured by time together, care actions).
  - **Surge Core** — a consumable item aligned to an affinity (Volt Core, Flora Core, etc.).
  - **Environment** — evolve in a specific region (evolve Nixie near deep water → Tide form).
  - **Time** — day/night cycle matters (Glimmerwing's nocturnal form).
  - **Fusion history** — some forms only unlock if the creature was previously fused.
- **Example — Voltkit's three paths:**
  - **Voltkit → Voltpup** (Level 15) — bigger, faster, classic upgrade.
  - **Voltkit → Stormherald** (Bond max + Volt Core) — the alpha form. Larger, circuit patterns become armor.
  - **Voltkit → Emberspark** (Level 20 in a volcanic region) — surprise Fire-adjacent variant. Branching means discovery.

**How it works (Grid Cards):**
- The existing **Surge** mechanic IS evolution in card form. Extended with **Branch Surge**: some creatures have 2+ Surge forms — you choose which path when you Surge.
- Evolution conditions become card conditions: "Branch Surge — pay 3 Charge AND control a Volt Realm" vs. "Branch Surge — pay 5 Charge" (the harder path gives the stronger form).
- Evolved creatures keep inherited effects from cards underneath (existing Surge stacking rules apply).

**UI/UX:** Evolution is a ceremony, not a menu click. In the 3D world: the creature glows, the camera pulls in, particle effects, the new form revealed with its name displayed. In Grid Cards: the Surge cinematic (already designed in Part 4).

---

### 13B. CROSS-BREEDING — Mixed Bloodlines

Two creatures produce offspring with blended traits. This is the collector's endgame.

**How it works (3D world):**
1. **Pairing** — two creatures of compatible species (same "genus" — e.g., any two mammalian mascots) at a **Nursery** facility.
2. **Egg** — produced after a bonding period. Eggs have incubation time (real-time hours, not days — respect the player's time).
3. **Care** — keep the egg warm (visit it), play sounds near it, keep it safe. Care level affects trait quality.
4. **Hatching** — a ceremony. The offspring's traits are revealed.

**Inheritance rules:**
- **Color/pattern:** One parent's base color (dominant) with the other's accent pattern (blended). True 50/50 blends are rare and prized.
- **Abilities:** Offspring inherits 1 ability from each parent's pool, plus 1 random mutation (small chance of something neither parent has).
- **Affinity:** Same affinity if both parents match. If different, offspring takes the mother's affinity with a 25% chance of dual-affinity (rare, powerful).
- **Stats:** Averaged from parents ±10% variance. Exceptional parents produce exceptional children.
- **Shiny:** 1/64 base chance. Increased by max bond on both parents (up to 1/16), and by hatching during seasonal events.

**How it works (Grid Cards):**
- Bred creatures become **Lineage cards** — unique, one-of-a-kind cards registered to your account. They can't be traded (soulbound) — your bloodline is *yours*.
- Lineage cards display both parents' names: "Bred from Voltpup × Mossimp."
- In competitive play, Lineage cards are legal but their inherited abilities are fixed at hatching (no re-rolling — what hatches is what you get).

**Anti-exploit:** Breeding has a cooldown per creature (prevents factory farming). Shiny odds are server-side and auditable.

---

### 13C. FUSION — Yu-Gi-Oh-Style Merging

Two or more creatures merge into a new, more powerful form. The spectacle mechanic.

**Two types:**

**1. Overclock Fusion (temporary — one battle)**
- In the 3D world: two creatures merge for a single combat encounter or challenge. Dramatic transformation sequence.
- In Grid Cards: **Fusion Protocol** card type. Play two creatures you control + the Fusion Protocol → they merge into the fused form until end of turn (or until the fused creature is deleted).
- After the battle/turn, the creatures separate unharmed. No risk, pure spectacle.
- **Example:** Voltkit + Pebblor → **Volcrag** (Volt/Stone, 5/5, Swift + Guardian) for one turn.

**2. Core Fusion (permanent — consumes the parents)**
- The two parent creatures are permanently merged into a new, unique creature. This is irreversible — the game warns you three times.
- The fused creature gets: combined stat total × 1.2, one ability from each parent, a new name you choose, and a unique appearance blending both.
- **Fusion recipes:** Specific combinations unlock named unique forms (discovery mechanic). The recipe book starts empty — players discover recipes through experimentation. First discoverer gets their name in the recipe's lore.
  - *Example recipes:* Voltkit + Glimmerwing = **Stormwing** (flying lightning). Mossimp + Nixie = **Bogbloom** (swamp healer). Pebblor + Bulwark = **Siegebreaker** (living fortress).
- In Grid Cards: Core Fusion is represented by permanently transforming two cards in your collection into a new Lineage card (soulbound, like breeding).

**Fusion UI:** A dedicated fusion chamber in the Undergrid's Concourse. Drag two creatures into the fusion circle, preview the result (stats and appearance, not the name), confirm three times for Core Fusion.

**Balance guardrails:**
- Fused creatures are strong but not format-warping. Playtesting target: fusion decks are viable, not dominant.
- Temporary fusion is the competitive staple; permanent fusion is the collector's prestige.
- No fusion of already-fused creatures (no infinite stacking).

---

### 13D. System Integration Summary

| System | 3D World | Grid Cards | Key Emotion |
|---|---|---|---|
| Evolution | Branching paths, ceremony | Branch Surge (choose your form) | Discovery — "what will it become?" |
| Breeding | Nursery, eggs, care, hatching | Lineage cards (soulbound) | Ownership — "this one is MINE" |
| Fusion (temp) | One-battle merge | Fusion Protocol cards | Spectacle — "watch THIS" |
| Fusion (perm) | Fusion chamber, recipes | Permanent Lineage transform | Commitment — "no going back" |

All three systems feed each other: breed for the perfect parents → evolve the offspring down a rare path → fuse two perfect specimens for a legendary result. The depth is there for those who want it; casual players can ignore all of it and still enjoy the game.

---

## Part 14 — Stadiums & Venues

**Date added:** 2026-10-08 (Paul's direction: "stadiums and venues")

### Design philosophy
Real esports arenas meet GridWorld's aesthetic. These are places people WANT to visit even when they're not competing — social hubs, spectacles, destinations.

### Venue tiers

**1. Duel Terminals (neighborhood level)**
- Small 1v1 stations scattered through every district — the Concourse, First Light plaza, regional hubs.
- Holographic table, two seats, a small crowd ring (8–12 spectators).
- Casual play, quick matches, tutorial duels.
- *Vibe:* Streetball court. Intimate, spontaneous.

**2. Card Battle Stadiums (district level)**
- Dedicated Grid Cards arenas, one per major district, each with its own visual identity:
  - **First Light Stadium** — dawn-themed, gold and white, open-air amphitheater.
  - **Neon Grid Colosseum** — cyberpunk, magenta and cyan, enclosed with holographic sky.
  - **Verdant Arena** — grown from living wood, bioluminescent flora, open to the sky.
  - **Undergrid Grand Terminal** — the premier venue, in the digital world. Gravity-defying architecture.
- **Features:** Tiered spectator seating (100–500), dramatic spotlighting that follows the match, giant screens showing both players' hands (with a spectator delay to prevent cheating), live commentary booths, replay kiosks.
- Ranked ladder matches, district championships.
- *Vibe:* Friday night fights. Electric, communal.

**3. Creature Battle Arenas (district level)**
- For creature battles (the 3D combat system) — open-floor arenas where bonded companions fight.
- Terrain varies per arena (water pools, rock formations, vertical elements) — terrain matters tactically.
- Spectators ring the floor behind energy barriers.
- *Vibe:* Pokémon stadium meets gladiatorial arena.

**4. Tournament Venues (world level)**
- **The Apex** (Undergrid Core district) — the championship venue. Seats 5,000 spectators. Floating rings, zero-gravity sections, a ceiling that's a live starfield.
- Seasonal championships, world finals, special events.
- Broadcast integration: in-world cameras + stream output for external viewing.
- Winner's name etched into the venue's "Hall of Legends" — permanent, visible to all visitors.
- *Vibe:* The Super Bowl of the Grid. Once you're here, you've made it.

### Spectator experience
- **Live:** Free entry to all venues. Cheering/reactions (emote bursts visible in the arena). Sit anywhere.
- **Betting:** Friendly GWC wagers on matches (no real money — GWC is fictional). House takes no cut on spectator bets under 100 GWC.
- **Replays:** Every ranked and tournament match is recorded. Replay kiosks in every stadium + a replay browser in the Gridlink.
- **Commentary:** AI commentators (team member voices) for tournament matches. Player commentary booths for community casters.

### Venue economy
- Stadium vendors sell cosmetics, card sleeves, creature accessories (GWC).
- Tournament entry fees (GWC) fund prize pools — winner-takes-most, transparent split published before each event.
- Venue naming rights for Architects (cosmetic, seasonal) — a fun prestige sink.
