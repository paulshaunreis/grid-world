# Anomaly Creature System

**Status:** Concept design. Awaiting Paul's approval before implementation.
**Rule (Paul, 2026-10-03):** in-world anomaly creatures with Digimon/Pokemon-like evolution (Monster Rancher studied); creatures begin when "the sperm and egg cell merge"; different evolutionary chains with effectively infinite outcomes; custom taming method.

## Origin: fusion

Every creature begins at **gamete fusion** — two parent creatures contribute, or one parent plus wild anomaly material harvested from digi-cracks and glitch-weather. The fiction is biological: sperm and egg merge, traits combine, and a small anomaly mutation keeps every birth surprising.

**Genetics schema (traits as alleles):**
- **Trait slots:** Form (body plan), Element (cyan/ember/verdant/etc. affinity), Temperament (bold, gentle, curious...), Pattern (markings), Aptitude (one signature knack).
- **Inheritance:** dominant/recessive alleles per slot; offspring shows the dominant trait but carries the recessive — lineages hide surprises for generations.
- **Anomaly mutation:** small chance per birth of a novel allele — the "wild spark." Mutation rate rises slightly near digi-cracks and during glitch-weather (the world breeds strangeness at its seams).
- **Lineage history:** the Historium records every birth. Deep lineages (many generations) unlock rare branch options — old blood opens old doors.
- **Effectively infinite outcomes:** combinatorial alleles × mutations × lineage depth. No two bloodlines alike after a dozen generations.

## Evolution: the ladder

```text
Mote → Flicker → Beacon → Prism → Apex
```

- Most species climb 4–5 stages; some end earlier (a proud Beacon is complete, not unfinished).
- **Branch choices:** at each evolution point, 2–3 branches. "Earn the window, choose the branch" — care, training, exploration, and kindness unlock eligibility; the citizen picks the branch or declines (staying is valid).
- **Every branch changes the role, not just stats:** a Beacon might become a Prism-Warden (protector), Prism-Lantern (guide), or Prism-Trickster (scout). Form follows function.
- **Surge forms:** temporary ascensions for spectacle — big moments, big light, then back. Reuse the base rig with shader/emission overlays (cheap, dramatic).

## Care and lifespan

- **Care is visible history:** kindness, training, rest, diet — the creature's record shows how it was raised, and it shapes temperament and branch eligibility.
- **Neglect never kills.** A neglected creature dims into a **dormant Mote** — small, quiet, waiting. Rekindle it with attention. (No death, no guilt mechanics — G-rated.)
- **Never monetize essential care.** Food and rest are never paywalled under threat of loss. Cosmetics and treats, fine. Essentials, never.
- **Lifespan:** Young → Prime → Elder. Aging is graceful — Elders gain wisdom traits and mentor the young.
- **Generational combination:** an Elder can pass traits and legacy into a new fusion — the line continues, the story compounds.

## Taming: Resonance Tuning

No capture balls. No beatdown-first. Wild anomalies emit **interference patterns** — visible ripples, audible tones.

1. Craft (or borrow) a **tuner**.
2. Approach quietly. The pattern plays — rhythm and stillness.
3. **Match it:** on the watch, a rhythm tap; on the phone, touch; in-world, gesture. Meet the creature's frequency with your own calm.
4. The anomaly stills... and chooses you. (It is always their choice. The fiction matters.)

Tuning difficulty scales with the anomaly's wildness, never with your wallet.

## Server-load discipline

- **Lazy lifespan ticking:** age/care states compute on interaction, not on a global tick. A sleeping creature costs nothing.
- **Dormant Motes** are single records, no simulation.
- **Surge forms** are client-side presentation over the base record — no new entity.

## Implementation notes (ChatGPT's lane)

- **Creature service:** genetics engine (alleles, inheritance, mutation), lineage ledger (Historium-linked), evolution eligibility evaluator, care-history log.
- **Tuning service:** platform-agnostic (watch/phone/in-world/AR are clients of one tuning protocol) — REQUIRED before AR ships.
- **Data model review wanted:** trait schema, mutation/drift controls, authorable branch templates, care-history schema.
- Balance target: a new citizen tunes their first Mote in minutes; a breeder chases bloodlines for years.

## Open questions for Paul

- Trading/gifting creatures between citizens — yes? (Lineages as gifts are lovely.)
- Should wild anomalies ever be dangerous, or always curious? (Current design: curious, never frightening.)
- Apex forms: one per bloodline, or repeatable?

---

## Ascension: when a creature becomes a citizen

At Apex, certain bloodlines unlock a final branch: **Ascension**. The creature takes **humanoid form** — and may undergo the **Rite of Becoming**, stepping through as a citizen: their own account, their own name, their own plot.

- **Earned, rare, mysterious.** Ascension requires a deep lineage, an Apex in Prime, and a completed Rite quest. No shortcuts, no purchases.
- **They remember.** An ascended citizen keeps their lineage memory — they remember who raised them, every kindness, every branch chosen. Reunions are emotional by design.
- **Not "evolving into a human."** Ascension is the creature *choosing personhood* — Digimon's humanoid beat, but ours: the Grid recognizes them as a citizen, with rights, land, and a Historium entry of their own.
- Ascended are a playable race (see PLAYABLE_RACES.md). Their creature days are history, not a costume.
