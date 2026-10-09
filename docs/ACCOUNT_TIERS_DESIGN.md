# GridWorld Account Tiers & Economy Design

**Date:** 2026-10-08
**Status:** Design proposal — in active development, NOT live. Pricing and values are proposals for Paul's approval, not final business terms.
**Tier names:** The site currently uses **Wanderer / Citizen / Architect**. This doc maps the requested Normal / Premium / Premium+ framing onto those names:
- **Normal = Wanderer** (free)
- **Premium = Citizen** ($9.99/mo proposed)
- **Premium+ = Architect** ($24.99/mo proposed)

**Hard rule:** Grid Coin (GRC) is fictional and simulated. It has NO cash value, cannot be cashed out, and must never be presented as real currency or an investment.

---

## Part 1 — Competitor Research

### Second Life (Linden Lab)
- **Free (Basic):** Full world access, can explore, shop, socialize. No land ownership, no weekly stipend, limited support.
- **Premium (~$9.95/mo, ~$72/yr):** L$300/week stipend (~L$1,200/mo), 1,024 m² land tier included (or tier credit), premium support, exclusive gifts, access to premium-only sandboxes/events. Land beyond the included tier costs monthly tier fees (e.g., 1,025–2,048 m² ≈ $8/mo extra, scaling up).
- **Premium Plus (~$29.99/mo):** Everything in Premium + 2,048 m² land tier, L$650/week stipend, double the exclusive gifts, priority support, more group slots (70 vs 60), animated mesh avatar.
- **Currency:** Linden Dollar (L$) — buyable on the LindeX exchange, earnable (stipend, selling content/land/services), and **cash-outable** to USD via LindeX sell orders. This is the key differentiator: SL's economy is real-money-adjacent.
- **Land:** The core revenue driver (~70% of LL revenue historically). Land = server resources; tier fees are essentially hosting fees. Private estates/regions cost $149–$229/mo for a full region.
- **Creator economy:** Anyone can sell; no subscription required to sell on Marketplace. LL takes commission (~10% marketplace, plus upload fees). Premium is NOT a gate for selling — it's a gate for land + stipend + support.
- **Upgrade driver:** Land ownership, the weekly stipend (feels like "free money"), premium support, exclusive areas.

### VRChat (VRChat Inc.)
- **Free:** Full social VR access, 50 avatar favorites (1 list), 400 world favorites (4 lists), 20 print-collects, 4 backgrounds.
- **VRC+ (~$9.99/mo or $99.99/yr):** 300 avatar favorites (6 lists), 800 world favorites (8 lists), custom inventory — user icons (64), photos (64), custom emoji (18), stickers (18), prints (64), UI themes (20), backgrounds (37). More groups (join 200 vs 100, create 5 vs 0). Trust-rank boost. Camera dolly/drone. Supporter badge. Age verification. Monthly exclusive inventory bundles.
- **Currency:** None. VRC+ is pure subscription — no virtual currency stipend, no cash-out. Monetization is cosmetic/convenience only.
- **Land:** N/A — worlds are user-created and free to visit; no ownership economy.
- **Creator economy:** VRChat's Creator Economy (paid listings/subscriptions for worlds) is separate from VRC+; creators earn real money via Tilia, not via the subscription.
- **Upgrade driver:** Self-expression (custom emojis, icons, photos), more favorites for power users, supporter identity, camera tools for content creators.

### Rec Room (Rec Room Inc.)
- **Free:** Full game access, earn Tokens by playing originals and daily challenges.
- **Rec Room Plus (~$7.99/mo):** 6,000 Tokens/month stipend (~$10 value), weekly 4-star item box, 10% discount on token items, exclusive store section, **ability to make and sell UGC** (inventions, clothing, room keys), subscriber badge, name-tag emoji.
- **Currency:** Tokens — buyable with real money, earnable via subscription stipend and gameplay. Tokens earned from **selling** creations can be exchanged for real money (cash-out path exists for sellers only).
- **Land:** Custom rooms — Plus members create rooms free (no token creation cost); free users pay token costs.
- **Creator economy:** Selling is **gated behind Plus** — this is the big one. The subscription IS the creator license. Revenue from sales can cash out.
- **Upgrade driver:** The token stipend alone exceeds the sub price in token value; selling rights for creators; exclusive cosmetics.

### Roblox (Roblox Corporation)
- **Free:** Full play access, can create games, limited avatar customization.
- **Premium (tiers ~$4.99–$21.99/mo):** Monthly Robux stipend (450–2,200 Robux depending on tier), trading access, ability to publish/sell avatar items, increased revenue share for developers, exclusive items and discounts.
- **Roblox Plus ($4.99/mo, newer offering):** 10–20% discounts on avatar/in-game items, free private servers, unlimited trading, Robux transfers, creator publishing access.
- **Currency:** Robux — buyable, earnable via stipend and game/item sales. Cash-out via **Developer Exchange (DevEx)** for creators meeting thresholds (real money).
- **Land:** N/A in the SL sense — "land" is game instances; private servers are the paid equivalent (Plus includes them free).
- **Creator economy:** The deepest of all — developers earn Robux from game passes, items, engagement; Premium members get a **higher revenue share**; DevEx converts to USD.
- **Upgrade driver:** Robux stipend (steady currency drip), trading (economy participation), creator revenue share boost, exclusive items.

### Fortnite (Epic Games)
- **Free:** Full battle royale, earn V-Bucks slowly via free battle pass tiers and STW.
- **Fortnite Crew ($11.99/mo):** 1,000 V-Bucks/month, **all premium passes included** (Battle, Music, LEGO, OG), exclusive monthly Crew Pack (outfit bundle), Rocket Pass Premium.
- **Currency:** V-Bucks — buyable, earnable via Crew stipend and gameplay. **No cash-out.** Pure spend currency.
- **Land:** N/A — Creative islands are free to build; no ownership economy.
- **Creator economy:** Separate (Support-A-Creator, UEFN revenue share) — not tied to Crew.
- **Upgrade driver:** The bundle math — passes + 1,000 V-Bucks + exclusive pack is worth more than $11.99 bought separately. FOMO on the exclusive monthly pack.

### Final Fantasy XIV (Square Enix)
- **Free Trial (free, generous):** Level cap 80, huge story content, but NO trading, NO Market Board, NO friend adds, can't create parties/FCs, gil cap, no /shout /yell /tell.
- **Entry ($12.99/mo):** Full game, 8 characters per data center.
- **Standard ($14.99/mo):** Full game, 40 characters per data center, multi-month discounts. Veteran rewards (loyalty cosmetics at 60/150/240/330 days).
- **Currency:** Gil — earnable in-game only, **not buyable**, no cash-out. Subscription is pure access fee.
- **Land:** Housing is scarce and competitive — a gil + lottery system, not a subscription perk.
- **Creator economy:** None — no UGC marketplace.
- **Upgrade driver:** Access itself (free trial is a demo with social/trade locks). The social and trading restrictions are the funnel — you literally cannot participate in the economy without paying.

### Patterns that matter for GridWorld
1. **The stipend is king.** Every successful virtual-world sub includes a currency drip (SL L$300/wk, RR+ 6,000 tokens/mo, Roblox 450–2,200 Robux/mo, Fortnite 1,000 V-Bucks/mo). It must feel like more value than the sub price.
2. **Land = the premium anchor** (SL model). Ownership is the strongest retention mechanic in persistent worlds.
3. **Selling rights are a powerful gate** (Rec Room, Roblox). Creators will pay for the right to earn.
4. **Free tiers must be genuinely fun** (FFXIV trial, VRChat free). The funnel works when free is good but socially/economically limited.
5. **No-cash-out currencies (V-Bucks, Tokens-for-spending) keep economies closed and safe.** GridWorld's GRC follows this model — like V-Bucks, not like L$.
6. **Identity/status perks convert** (badges, exclusive cosmetics, founder walls) — cheap to provide, high perceived value.

---

## Part 2 — GridWorld Tier Design

### Design principles (custom for GridWorld)
- **GRC is closed-loop.** No cash-out, ever. The economy runs on stipends, earning through play/creation, and spending in-world. This keeps it safe and honest.
- **Free must be real.** Wanderers can explore, socialize, build (basic), and earn GRC through play. The funnel is aspiration, not punishment.
- **Land is the Citizen anchor** (SL lesson). Owning a piece of the Grid is the emotional upgrade driver.
- **Creators pay for reach** (Rec Room/Roblox lesson). Selling and featuring are the Architect differentiators.
- **The Grid Team is the premium flex.** Direct access to the 24 AI team members is something no competitor offers — it's GridWorld-native.
- **Never pay-to-win.** Tiers unlock expression, space, and economic participation — never combat power, never exclusive gameplay advantages.

### Tier comparison

| Feature | 🟢 Wanderer (Normal) — Free | 🔵 Citizen (Premium) — $9.99/mo* | 🟣 Architect (Premium+) — $24.99/mo* |
|---|---|---|---|
| **Monthly GRC stipend** | — (100 GRC welcome grant, one-time) | **500 GRC/mo** | **1,500 GRC/mo** |
| **Earn GRC via play** | ✅ Daily quests, events, exploration | ✅ + Citizen bonus quests | ✅ + Architect bonus quests, higher payouts |
| **Land** | Visit public regions; no ownership | **Private plot — 512 m²** in a citizen district | **Large plot — 2,048 m²** + second plot option |
| **Extra land** | — | Buy additional tier (GRC/mo) | Buy additional tier (GRC/mo), priority placement |
| **Marketplace buying** | ✅ | ✅ | ✅ |
| **Marketplace selling** | ❌ (buy-only) | ✅ List up to **10 items** | ✅ List up to **50 items**, **featured placement** eligible |
| **Marketplace fees** | — | Standard 10% | **5%** (half fees) |
| **Avatar Studio** | Starter avatar + 10 styles | ✅ Full customization | ✅ Full + exclusive seasonal skins |
| **UI themes** | Grayscale default | All 11 themes | All 11 + early access to new themes |
| **Profile badge** | — | 🟦 Citizen badge | 🟪 Architect badge |
| **Regions** | All public regions | ✅ + Citizen-only regions, early event access | ✅ + early access to new regions & features |
| **Social: friends** | 100 | 300 | 1,000 |
| **Social: groups** | Join 5 | Join 20, create 2 | Join 50, create 10 |
| **World proposals (voting)** | ❌ | ✅ Vote | ✅ Vote + submit proposals |
| **Grid Team access** | Public AMAs only | Monthly team office hours | **Direct line** — priority Q&A channel |
| **Founders Wall** | — | — | ✅ Name etched in First Light |
| **Support** | Community | Priority email | Dedicated + in-world concierge |
| **Seasonal/holiday items** | Earn via events | Earn + buy | Earn + buy + exclusive Architect drops |

*\*Pricing is the existing site proposal, not approved business terms.*

### GRC economy notes
- **Sources:** monthly stipends (Citizen/Architect), welcome grant (100 GRC, Wanderer one-time), daily quests, event rewards, exploration milestones, marketplace sales (Citizen+), creator payouts.
- **Sinks:** marketplace purchases, land tier upgrades, avatar cosmetics, UI theme unlocks (beyond the 11 base), event entry fees, naming/reservation fees, gift transfers.
- **Anti-inflation:** stipends are modest relative to desirable sinks (land, rare cosmetics). No GRC printing outside the designed sources. Marketplace fees (10%/5%) burn GRC out of circulation.
- **No cash-out.** Stated everywhere GRC appears. This is a design constraint, not a limitation to apologize for — it keeps the economy a game, not a job.
- **Trading:** Citizen+ can trade items peer-to-peer; Wanderers can gift but not run shops (prevents bot farming on free accounts).

### What drives the upgrade (per tier)
- **Wanderer → Citizen:** "I want my own land." The 512 m² plot + 500 GRC/mo + selling rights is the SL/RR+ playbook. The stipend alone (~$5–8 equivalent value in cosmetic purchasing power) softens the $9.99.
- **Citizen → Architect:** "I'm a creator." 50 listings, half fees, featured placement, 2,048 m², seasonal exclusives, Founders Wall. The fee discount alone pays for the difference at volume — the Roblox revenue-share lesson.

---

## Part 3 — Payment Page Spec (placeholder, restricted)

### Purpose
A page where users will **eventually** enter card details to upgrade to Citizen/Architect. For now: the page exists, looks real, but **payment processing is disabled** — the "complete purchase" action is stubbed and clearly labeled as unavailable.

### What NOT to build ourselves
- **Never handle raw card numbers.** No custom card processing, no storing PANs, no homegrown vault. PCI DSS scope is a nightmare we don't want.
- **Use Stripe (recommended) or equivalent** (Stripe Billing + Stripe Elements) when payments go live. Stripe handles PCI; we never see the card number.
- Until then: **no real payment fields wired to anything.** The form is visual only.

### PCI considerations (for when it goes live)
- Use Stripe Elements or Payment Links — card data goes directly to Stripe, never touches our servers (SAQ-A scope, minimal).
- Never log, cache, or persist card details anywhere (not in Supabase, not in logs, not in localStorage).
- 3D Secure / SCA for EU cards via Stripe's built-in handling.
- Webhooks (Stripe → our backend) confirm subscription state; never trust client-side "payment succeeded" alone.
- Separate test vs live keys; never ship test keys to production.

### Placeholder page spec (`/upgrade.html` or membership checkout)
1. **Tier summary cards** — Citizen $9.99/mo, Architect $24.99/mo, what each includes (pull from the table above). Prices labeled "proposed — not yet available."
2. **Card entry form (visual only):** card number, expiry, CVC, name, ZIP — styled to match the site theme. Fields are `disabled` with a banner: **"Payments are not yet live — this is a preview."**
3. **Upgrade button:** disabled, labeled "COMING SOON."
4. **Honesty copy:** "GridWorld is in active development. Paid tiers are not yet available. Grid Coin has no cash value."
5. **What it must NOT do:** submit card data anywhere, call any payment API, create subscriptions, store anything.

### Go-live checklist (future, needs Paul's sign-off each item)
- [ ] Stripe account created and verified (business details, payout account)
- [ ] Stripe.js / Elements integrated; backend webhook endpoint built
- [ ] `subscriptions` table in Supabase (user_id, tier, status, stripe_customer_id, current_period_end)
- [ ] RLS: users read only their own subscription row
- [ ] Webhook signature verification; idempotent handling
- [ ] Tier entitlements enforced server-side (never trust the client)
- [ ] Cancel/downgrade flow + prorating rules decided
- [ ] Refund policy written and linked
- [ ] "GRC has no cash value" disclosure on every payment surface

---

## Open questions for Paul
1. **Pricing:** Are $9.99 / $24.99 the right numbers, or placeholders to revisit?
2. **Land sizes:** 512 m² / 2,048 m² — do these match the engine's parcel system?
3. **Team portraits question (from art audit):** regenerate the 24 Pixar-style team portraits photorealistic, or keep stylized as deliberate contrast?
4. **Payment provider:** Stripe, or does Paul prefer another processor?
5. **Stipend tuning:** 500 / 1,500 GRC per month — too generous, too stingy? (Needs playtesting against actual sink prices once the marketplace is live.)
