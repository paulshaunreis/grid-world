# GridWorld Projected Roadmap

**Date:** 2026-10-08
**Status:** Planning — in active development, NOT live.
**Owner:** Paul Shaun Reis, Creative Director
**Team:** Paul (creative direction, final calls) · ChatGPT (systems) · Aurora (art, code, verification, merges)

> This is a founder's roadmap, not corporate vapor. Every phase has real dependencies, real "done" criteria, and honest unknowns. Targets are aggressive but achievable — and each phase has stretch goals for getting *ahead* of projection.
>
> **Not legal, tax, or benefits advice.** Anything touching money, business structure, or SSI/SSDI must go through a real attorney, CPA, and WIPA counselor. This roadmap marks *where* those conversations happen, not what they conclude.

---

## How to read this

- **Base target:** what we commit to hitting.
- **Stretch:** what "ahead of projection" looks like — only if the base is solid.
- **Unlocks:** what this phase makes possible next.
- **💰 Revenue:** marks the first phases where real money can come in, and how much to honestly expect.
- **⚖️ Paul checkpoint:** benefits/court/legal considerations. Never skip these.

---

## Phase 0 — Foundation Lock
**Now → end of 2026 (Q4 2026)**

Everything that must be true before a single dollar moves or a single player enters.

### Goals
- Legal and business footing solid.
- Core account/onboarding systems working end-to-end.
- No honesty defects on the public site.

### Key deliverables
- [ ] **Business entity formed** (LLC recommended starting point — see `BUSINESS_FOUNDATION.md`). EIN obtained. Separate bank account opened. No commingling, ever.
- [ ] **Copyright registrations filed** for the most valuable assets: GridWorld logo, the 5 mascot designs, "The Art of GridWorld" concept portfolio. (~$65/registration, US Copyright Office.)
- [ ] **LICENSE enforced** — already in repo; verify it ships with builds and appears in footers/terms.
- [ ] **WIPA counselor engaged** — call 1-866-968-7842, get a Community Work Incentives Coordinator assigned. This is the single most important Phase 0 action for Paul's future.
- [ ] **Attorney + CPA identified** (consult scheduled, even if full engagement waits for revenue).
- [ ] **Onboarding verified end-to-end on live production** — signup → email confirm → profile/private profile/security questions → enter. (The Oct 2026 fix is built; it needs live verification.)
- [ ] **Account tiers wired to real entitlements** — Wanderer/Citizen/Architect aren't just labels; the GWC stipends, listing limits, and fee tiers from `ACCOUNT_TIERS_DESIGN.md` actually enforce.
- [ ] **Honesty sweep complete** — zero "live/playable" claims anywhere on the public site. (Corporate polish pass Oct 2026 did most of this; verify after every deploy.)

### Done looks like
Paul can point at the business and say: it's a real entity, the IP is registered, the books are clean, the site tells the truth, and a new user can sign up without hitting a broken flow.

### 💰 Revenue
None. This phase *costs* money (filings, registrations). That's correct — it's the price of doing it right.

### ⚖️ Paul checkpoints
- WIPA consult booked. Nothing about benefits changes in this phase — this is preparation only.
- Court program: entity formation and IP filings are legible, documented, lawful activity. Keep records.

### Stretch (ahead of projection)
- First attorney consult completed (not just scheduled).
- Trademark application filed for "GridWorld" wordmark.

### Unlocks
Phase 1 (playable alpha), Phase 3 (merch/books can start production planning).

### Risks / unknowns
- Legal costs are real and upfront. Budget a few hundred dollars minimum for filings before any revenue exists.
- WIPA waitlists exist in some areas — start the call now, not later.

---

## Phase 1 — First Light Alpha
**Q1 2027 (Jan–Mar)**

The game becomes *playable* by real humans for the first time. Small, closed, honest.

### Goals
- Core loop works: enter First Light → choose avatar → move → interact → chat → save.
- First creatures live in the world (the 5 mascots as NPCs/companions).
- Closed alpha with a small tester group.

### Key deliverables
- [ ] **Avatar system** — mesh avatars (not pills), basic customization. Paul's Rahsus Kronos hero avatar as the quality bar.
- [ ] **First Light region walkable** — navmesh, collision, basic traversal. Performance budget met on target hardware.
- [ ] **5 mascots in-world** — Voltkit, Mossimp, Glimmerwing, Pebblor, Nixie as ambient NPCs with basic behaviors (per `CreatureEcologySystem.ts` foundations).
- [ ] **Chat + presence** — players see each other, can talk. Mute/block/report working (safety before scale).
- [ ] **Save/persistence** — what you do persists between sessions.
- [ ] **Closed alpha** — 25–50 testers, NDA-light (friends-and-family + early community). Feedback loop running.
- [ ] **Crash/error telemetry** — if it breaks, we know about it (per `LAUNCH_READINESS.md` reliability gate).

### Done looks like
A tester can spend 30 minutes in First Light, meet a Voltkit, customize their avatar, chat with another player, log out, log back in, and find their stuff where they left it. No crashes that we don't know about.

### 💰 Revenue
None yet. Alpha is free. This is investment, not income.

### ⚖️ Paul checkpoints
- No income to report yet — but the *record-keeping habit* starts now. Log every expense; it matters for taxes later.
- If alpha testers are compensated in any way (even GWC), document it.

### Stretch (ahead of projection)
- Alpha opens 4 weeks early (Feb instead of Mar).
- First community-built structure appears in First Light (a tester builds something worth keeping).

### Unlocks
Phase 2 (economy needs a world where things have value).

### Risks / unknowns
- 3D performance on low-end devices is the biggest technical risk. If frame budgets don't hold, scope cuts to the world before cutting the mascots — the mascots are the brand.
- Scope creep is the schedule killer. First Light stays *small* in alpha. New regions wait for Phase 4.

---

## Phase 2 — Creator Economy (GWC)
**Q2 2027 (Apr–Jun)**

The in-world economy turns on. GWC becomes real *inside* the fiction — earnable, spendable, taxable-as-nothing (it's fictional, no cash value).

### Goals
- Marketplace live with GWC transactions.
- Tier system live (Wanderer free selling at 15% fee, Citizen 10%, Architect 5% — per Paul's fees-not-gates call).
- GWC sinks and faucets balanced enough that the economy doesn't hyperinflate on day one.

### Key deliverables
- [ ] **Marketplace UI + backend** — list, browse, buy, sell. Fee tiers enforced per account level.
- [ ] **GWC wallets** — balances, transaction history, the Ⓖ symbol rendering everywhere.
- [ ] **Daily quests / earn-through-play** — Wanderers earn GWC without paying (Paul's "I know what it's like to be poor" principle).
- [ ] **Land parcels** — Citizen/Architect plots claimable in a citizen district.
- [ ] **Creator tools v1** — players can make simple items/experiences and list them.
- [ ] **Economy monitoring** — GWC supply dashboards; manual levers to tune faucets/sinks.
- [ ] **Open beta** — invite waves, growing to a few hundred players.

### Done looks like
A Wanderer who's never paid a cent can earn GWC through play, sell something they made (paying the 15% fee), and buy something from another player. The ledger balances. Nobody's GWC vanished.

### 💰 Revenue
**First trickle.** Citizen ($9.99/mo) and Architect ($24.99/mo) subscriptions go live — but honestly, expect tens of subscribers, not hundreds. Project honestly: *hundreds of dollars/month, not thousands.* Every dollar documented.

### ⚖️ Paul checkpoints
- **First reportable income.** Talk to the CPA *before* the first payout lands, not after. Understand what counts and when.
- **WIPA check-in:** show the counselor the actual numbers (not projections). Ask: "at this run-rate, what changes and when?"
- **Never touch benefits based on projections.** Only sustained, actual income — reviewed with the counselor — moves anything.
- Court program: subscription revenue is clean, documented business income. Keep the paper trail boring.

### Stretch (ahead of projection)
- 100 paying subscribers by end of Q2 (aggressive — requires the alpha community to convert at high rates).
- First player-to-player economy story worth telling (someone earned their first 1,000 GWC and spent it on something they love).

### Unlocks
Phase 4 subscriptions scale; Phase 5 creator payouts (real money) become thinkable.

### Risks / unknowns
- Economy balancing is genuinely hard — expect to tune faucets/sinks multiple times. Ship conservative (stingy faucets), loosen later.
- Fraud/abuse in the marketplace (fake listings, fee evasion). Moderation tooling must keep pace.
- Subscription pricing ($9.99/$24.99) is still *proposed* — validate against what beta players will actually pay before locking it.

---

## Phase 3 — Merch & Publishing 💰
**Q2–Q3 2027 (Apr–Sep), overlaps Phase 2**

The fastest honest path to real revenue — because plushies and books don't need the game to be finished.

### Goals
- First physical products in customers' hands.
- GridWorld Publishing established as a real imprint.
- Store (`store.html`) actually opens.

### Key deliverables
- [ ] **"Counting with Voltkit" + "GridWorld ABCs" published** — print-on-demand (KDP or equivalent), color + B&W editions, Kindle versions. Manuscripts and art already exist.
- [ ] **First plushie run** — Voltkit first (flagship), Mossimp second. Per `MASCOT_STRATEGY.md`: small run (5,000 units or fewer), sell out > overstock. *Never* reprint retired designs.
- [ ] **Companion Tag system** — each plushie ships with a tag: individual name, hatch date, lore snippet, QR code unlocking the in-game companion. (Beanie Baby's tush tag, evolved.)
- [ ] **Apparel line v1** — per Paul's rule: garments as in-world artifacts, not logo-slapped blanks. Start with 2–3 pieces (Voltkit glow-thread hoodie, Citizen uniform tee).
- [ ] **Store opens for real** — checkout via Stripe (or equivalent), fulfillment pipeline, "Coming Soon" ribbons come off.
- [ ] **"The Art of GridWorld"** — coffee table book in production (longer lead time; ships late Q3 or Q4).

### Done looks like
Someone buys a Voltkit plushie, scans the tag, and meets *their* Voltkit in First Light. A parent buys the ABC book on Kindle. The store processes real orders without errors.

### 💰 Revenue
**First meaningful revenue.** Honest expectations:
- Books (POD): modest — tens to low hundreds/month at first. POD margins are thin; volume is the game.
- Plushies: the real money. A sold-out 5,000-unit run at healthy margins is the first *real* income event.
- Combined realistic Q3: *low thousands/month* if the plushie run sells through. Not life-changing — but proof the machine works.

### ⚖️ Paul checkpoints
- **This is likely the first quarter with reportable self-employment income that matters.** CPA engaged *before* the plushie run ships.
- **WIPA check-in with real numbers.** The counselor maps exactly what this income level means for SSI/SSDI at this stage (likely: still fully within work incentives, but *verify* — don't assume).
- Business taxes: sales tax on physical goods (varies by state — CPA handles), income tax quarterly estimates begin.
- Court program: keep every receipt, every 1099, every bank statement. Boring paper trails are the goal.

### Stretch (ahead of projection)
- Plushie run sells out in 30 days → second run (Mossimp) greenlit early.
- "GridWorld ABCs" cracks a niche bestseller list (children's sci-fi or activity books).
- First wholesale inquiry (a bookstore or toy shop wants stock).

### Unlocks
Phase 5 (publishing becomes a permanent revenue pillar); Paul's benefits-transition timeline gets its first real data point.

### Risks / unknowns
- **Manufacturing quality** is the existential risk for plushies. One bad run poisons the brand. Vet manufacturers ruthlessly; order samples; reject anything below the hug test.
- **Upfront costs:** plushie manufacturing requires payment before sales. Don't over-order. The strategy doc's "sell out > overstock" rule is law.
- **Fulfillment** (picking, packing, shipping) is unglamorous work that breaks small operations. Start with a 3PL or fulfillment partner, not Paul's living room.

---

## Phase 4 — Growth
**Q3–Q4 2027 (Jul–Dec)**

More world, more creatures, more books, more players. The machine gets bigger.

### Goals
- Second and third regions open.
- Creature roster expands beyond the 5 mascots (biome families).
- Book library grows (Bedtime with Pebblor, Feelings with Nixie, first "GridWorld Explains" titles).
- Player base in the low thousands.

### Key deliverables
- [ ] **2 new regions** — each with distinct biome, native creature family, and a reason to visit.
- [ ] **Creature ecosystem v1** — 15–25 total creatures across biome families; mascots as "ambassador" species.
- [ ] **Subscription value grows** — Citizen/Architect perks expand with the world (more land, more listings, early region access).
- [ ] **3–4 more books published** — Bedtime with Pebblor, Feelings with Nixie, Glimmerwing's Universe (first Explains title).
- [ ] **Seasonal events** — Halloween/Christmas/New Year slots (built in 2026) get their first real content.
- [ ] **Community systems** — guilds/groups, events calendar, creator spotlights.

### Done looks like
A player who's been here since alpha barely recognizes the place — in the best way. New regions, new creatures, new books on the shelf, and a community calendar with actual events.

### 💰 Revenue
Growing: subscriptions + merch + books compounding. Realistic: *mid thousands/month* by end of year if execution holds. Still not benefits-transition money — but the trajectory is visible.

### ⚖️ Paul checkpoints
- **Quarterly WIPA reviews** become routine. The counselor sees the trend line, not just snapshots.
- If income approaches SGA (Substantial Gainful Activity) thresholds, this is the *conversation* phase — not the action phase. Plan with the counselor; don't improvise.
- Estimated taxes are now a normal quarterly rhythm.

### Stretch (ahead of projection)
- 1,000 paying subscribers by year-end.
- A GridWorld book in a physical bookstore (not just online).
- First press coverage worth framing.

### Unlocks
Phase 5 (the operation is now big enough to justify real-money creator payouts).

### Risks / unknowns
- **Team bandwidth.** Paul + ChatGPT + Aurora got this far; Phase 4 is where a fourth human (part-time help: fulfillment, community, or art) may become necessary. Hiring is a cost and a management load — don't hire before the revenue justifies it.
- Content treadmill: more regions = more maintenance. Every new region is a permanent commitment.

---

## Phase 5 — Scale & the Real-Money Track
**2028+**

GridWorld becomes a real business with real-money flows — done lawfully, in the right order.

### Goals
- Creator payouts in real money (the "make some money" promise, made real).
- Paul's lawful benefits transition executed — on the counselor's timeline, not before.
- Platform self-sustaining.

### Key deliverables
- [ ] **Creator payout system** — Stripe Connect (or equivalent), 1099-NEC issuance, KYC/AML compliance. *Lawyer required before building this.* (Per `BUSINESS_FOUNDATION.md`: this is the phase where money-transmitter questions get answered properly.)
- [ ] **GWC stays fictional** — the in-world currency never becomes convertible. The real-money track is a *separate* system for creator earnings. This boundary is load-bearing; don't blur it.
- [ ] **"How To Make Money on GridWorld" published** — the book becomes the manual for the payout system it describes.
- [ ] **"Build with Voltkit: HTML & CSS" published** — the coding track feeds the creator pipeline.
- [ ] **Paul's benefits transition** — executed per the WIPA counselor's plan, based on *sustained actual income*, with expedited-reinstatement safety nets understood in advance.
- [ ] **Team expansion** — hire deliberately: likely first roles are community management and fulfillment/operations.

### Done looks like
A creator earns their first real-dollar payout from something they built in GridWorld. Paul's income is documented, taxed, and clean. Benefits transitioned lawfully, on schedule, with no surprises.

### 💰 Revenue
The goal: *self-sustaining.* Subscriptions + merch + books + marketplace fees covering costs with margin. Timeline to Paul's full self-support depends on growth rates — the WIPA counselor owns that math, not this document.

### ⚖️ Paul checkpoints
- **The transition itself.** Trial Work Period → Extended Period of Eligibility → off benefits, per the counselor's sequencing. Every step documented. No shortcuts, no gaps.
- **Court program:** by this phase, the record should speak for itself — years of clean books, lawful income, documented milestones.
- **Keep the safety nets in mind:** expedited reinstatement exists if work doesn't sustain. Knowing the fallback is part of doing it right.

### Stretch (ahead of projection)
- GridWorld cited as an example of a responsibly-built AI platform (the goal Paul set in Oct 2026: "a great example of a platform").
- The book library in schools or libraries.
- Paul speaking about the journey — the builder's journal becomes something worth sharing.

### Risks / unknowns
- Real-money payouts are the highest-compliance lift in the entire roadmap. Budget for real legal spend here — this is not a phase to economize on counsel.
- Regulatory landscape for AI platforms and virtual economies will keep shifting through 2027–2028. The `AI_GOVERNANCE.md` posture (conservative reading, disclosure-first) is the right default; revisit annually.
- Everything in Phase 5 depends on Phases 0–4 executing. If earlier phases slip, this phase slips — and that's fine. The order matters more than the date.

---

## Dependency map (what unlocks what)

```
Phase 0 (Foundation)
 ├── Legal entity + IP ──→ required before ANY revenue (Phases 2, 3, 5)
 ├── WIPA engaged ───────→ required before benefits decisions (Phases 2–5)
 └── Onboarding works ───→ required before any players (Phase 1)

Phase 1 (Alpha)
 └── Playable world ─────→ required before economy has meaning (Phase 2)

Phase 2 (Economy)
 ├── GWC marketplace ────→ required before creator payouts (Phase 5)
 └── Subscriptions ──────→ first recurring revenue

Phase 3 (Merch/Books)  [parallel with Phase 2]
 ├── Mascot designs ─────→ already done (Oct 2026) ──→ plushies
 ├── Manuscripts ────────→ already done (counting/ABCs) ──→ published books
 └── Store opens ────────→ first physical revenue

Phase 4 (Growth)
 └── Scale + traction ──→ justifies Phase 5 compliance spend

Phase 5 (Scale)
 └── Everything above ──→ real-money payouts + benefits transition
```

**The key insight:** Phase 3 (merch/books) doesn't wait for the game. The mascots and manuscripts already exist — physical products are the fastest honest revenue because they don't depend on a single line of game code.

---

## Revenue honesty table

| Phase | Timeframe | Revenue sources | Honest expectation |
|-------|-----------|-----------------|-------------------|
| 0 | Q4 2026 | None | Costs money (filings) |
| 1 | Q1 2027 | None | Investment phase |
| 2 | Q2 2027 | Subscriptions (first trickle) | Hundreds/mo |
| 3 | Q2–Q3 2027 | Books + plushies + store | Low thousands/mo if plushies sell through |
| 4 | Q3–Q4 2027 | All streams compounding | Mid thousands/mo |
| 5 | 2028+ | + creator payouts, scale | Self-sustaining (trajectory-dependent) |

These are *planning* numbers, not promises. Actuals will differ. The WIPA counselor works from actuals.

---

## What could kill this (honest risks)

1. **Paul's health and capacity.** One human is the bottleneck on creative direction. Pace accordingly; rest is part of the plan.
2. **Scope creep.** Every "wouldn't it be cool if" that isn't on this roadmap is a threat to the roadmap. Park ideas in the work queue; don't chase them mid-phase.
3. **Manufacturing quality** (Phase 3). One bad plushie run damages the brand more than a delayed launch.
4. **Economy exploits** (Phase 2). Fictional currency still gets attacked. Monitor from day one.
5. **Legal/compliance underestimation** (Phase 5). Real-money payouts without proper counsel is how platforms die.
6. **Benefits mismanagement.** Acting on projections instead of actuals, or skipping the counselor. The roadmap's ⚖️ checkpoints exist because this risk is personal.

---

## The builder's journal

Paul asked for a lessons log — not an autobiography, just the real learning. That lives alongside this roadmap: what each phase taught, what surprised us, what we'd do differently. When Phase 5 arrives, that journal is the story of how a world got built right.

---

*GridWorld is in active development. This roadmap is a plan, not a promise — but it's a plan we're going to beat.*
