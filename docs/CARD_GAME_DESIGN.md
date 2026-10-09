# GRID SIGNAL — GridWorld Trading Card Game Design

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

## Part 2 — GRID SIGNAL: Core Design

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

Things GRID SIGNAL does that physical cards **cannot**:
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

*GRID SIGNAL — every move is a gamble, every creature can become a legend.*
*© GridWorld*
