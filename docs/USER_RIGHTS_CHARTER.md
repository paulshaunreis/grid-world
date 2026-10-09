# GridWorld User Rights Charter

**Date:** 2026-10-08
**Status:** Founding commitments — in active development. These are promises the platform makes to its users, written before launch so they can be held against us later.

> GridWorld exists for its citizens. These rights are not features to be added later — they are constraints the platform is built inside. If a design decision conflicts with this charter, the charter wins.

---

## 1. Data Ownership

- **Users own what they create.** Worlds, objects, textures, scripts, stories, and profiles built by users belong to the users who made them. GridWorld claims no ownership over user-generated content.
- **License to operate:** By using GridWorld, users grant the platform only the narrow license needed to display, store, and transmit their content within the service (so others can see the world they built). This license ends when the content is deleted.
- **No training without consent:** User creations are never used to train AI models without explicit, opt-in consent. See `AI_GOVERNANCE.md`.
- **IRL identity is private by architecture:** Real names, countries, and birthdates live in `private_profiles` — owner-only, never publicly readable. This is enforced by database policy, not just UI hiding.

## 2. Payout Fairness

- **Clear terms, published:** Fee percentages, payout schedules, and thresholds are published in plain language before anyone earns a cent. No hidden fees, no surprise deductions.
- **Timely payouts:** When real-money creator payouts launch, they follow a published schedule (e.g., monthly, net-30). Delays are communicated, not discovered.
- **No retroactive changes:** Fee structures cannot be changed retroactively on earnings already accrued. New terms apply going forward, with notice.
- **Earnings dashboard:** Users can always see what they've earned, what fees were taken, and when payout happens. No black boxes.
- **GWC honesty:** Grid World Currency is fictional, simulated, with no cash value. It is never presented as an investment, a security, or real money. Any future real-money program is a separate, explicitly opt-in system.

## 3. No Predatory Mechanics

- **No loot-box gambling:** No paid randomized rewards with real-money value. If chance-based mechanics exist, odds are published and nothing of monetary value is at stake.
- **No dark patterns:** No fake countdown timers, no hidden unsubscribe paths, no "confirm-shaming," no interfaces designed to trick users into spending.
- **Honest odds and pricing:** Every price is shown before purchase. Every probability is disclosed where chance is involved.
- **No pay-to-win against the vulnerable:** Competitive systems are never structured so that spending is required to participate meaningfully.
- **Children:** Any user identified as a minor gets additional protections — spending caps, no targeted upsells, and the profanity-masking and safety systems Paul has mandated.

## 4. Privacy Commitments

- **Data minimization:** Collect only what the platform needs to function. If we don't need it, we don't ask for it.
- **Private by default:** Profiles expose the minimum. IRL fields are never public (see §1 and the `private_profiles` migration).
- **No sale of personal data:** User data is never sold to third parties. Period.
- **Breach response:** If user data is ever compromised, affected users are notified promptly with specifics — what happened, what was exposed, what's being done.
- **Location and network privacy:** Per Paul's standing security rule — player IPs and locations are never exposed or easily discoverable, by design.

## 5. Accessibility Commitments

- **Readable by default:** Sufficient color contrast in every UI theme (the 11-style theme system is contrast-checked, not just hue-swapped).
- **Keyboard navigable:** Core flows (join, sign-in, marketplace, settings) work without a mouse.
- **Reduced motion:** The platform respects `prefers-reduced-motion` and never forces animation on users who opt out.
- **Plain language:** Legal and financial terms are explained in plain language alongside the formal text. Nobody should need a lawyer to understand what they're agreeing to.
- **Ongoing work:** Accessibility is a standing commitment, not a launch checklist. Audit regularly.

## 6. Right to Export and Leave

- **Data portability:** Users can export their creations, profile data, and content in usable formats at any time, free of charge.
- **Account deletion:** Users can delete their accounts. Deletion removes personal data per the published retention schedule (some records, like financial transactions, must be retained for legal/tax periods — this is disclosed, not hidden).
- **No hostage mechanics:** Leaving never costs the user their creations. Export comes before or alongside deletion, always.
- **GWC on exit:** Fictional currency has no cash value and is not redeemable — this is stated clearly so no one is surprised.

## 7. Dispute Resolution

- **Clear process, published:** How to report a problem, what happens next, and how long each step takes — all documented before disputes arise.
- **Right to appeal:** Moderation actions (removals, suspensions, bans) can be appealed. Appeals are reviewed by a human, not just the AI that flagged the issue.
- **Proportional response:** Enforcement scales — warning before suspension, suspension before ban — except for severe violations (safety threats, illegal activity), which are acted on immediately.
- **No retaliation:** Users who file good-faith reports or appeals face no penalty for doing so.
- **Records:** Users can request the records of actions taken against their account.

## 8. How This Charter Is Enforced

- This charter is version-controlled in the repo. Changes require founder review and are dated.
- Material reductions in user rights require **advance notice** (minimum 30 days) and cannot apply retroactively.
- Violations of this charter by the platform itself are treated as high-severity incidents — see `AI_GOVERNANCE.md` for the incident process.

---

*GridWorld is in active development. This charter takes full effect at launch and guides all design decisions until then. Last updated: 2026-10-08.*
