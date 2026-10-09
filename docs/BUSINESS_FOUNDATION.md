# GridWorld Business Foundation

**Date:** 2026-10-08
**Status:** Planning framework — in active development, pre-revenue. Not live.
**Founder:** Paul Shaun Reis, Creative Director

> **Disclaimer — read first.** This document is a planning framework written to help the founder think clearly about building GridWorld as a lawful business. It is **not legal advice, tax advice, or benefits advice**. Nothing here creates an attorney-client relationship. Before GridWorld takes in a single dollar of revenue, Paul needs: (1) a California business attorney, (2) a CPA or tax professional, and (3) a WIPA benefits counselor (Work Incentives Planning and Assistance — free, for the SSI/SSDI transition plan). Decisions with legal, tax, or benefits consequences must go through those professionals.

---

## 1. Why This Document Exists

Paul lives on SSI and SSDI and is in the Assisted Intervention court program. He wants GridWorld to become profitable — for himself and for users — and to transition off benefits lawfully, in a logical timeframe, without legal trouble. That means the business side of GridWorld has to be **audit-ready from day one**: clean books, proper entity structure, documented revenue, and honest user economics. This document lays out that path in phases.

## 2. Business Entity Options (California)

GridWorld is currently a personal project with no formal entity. Before revenue, Paul should form one. The realistic options:

### 2a. LLC (Limited Liability Company) — likely the starting point
- **Why:** Simple to form and run in California, pass-through taxation, liability shield between Paul's personal assets and the business.
- **California cost:** $70 filing fee + **$800/year minimum franchise tax** (due even with zero revenue — budget for this).
- **Tax:** Profits/losses pass through to Paul's personal return (Schedule C if single-member). No corporate double tax.
- **Good for:** Pre-revenue and early-revenue phases, marketplace-fee income, subscription income.

### 2b. S-Corp election (on top of LLC or Corp)
- **Why:** Once GridWorld has real profit, an S-corp election can reduce self-employment tax (owner takes a "reasonable salary" as W-2, rest as distributions).
- **When:** Only worth it when net profit consistently exceeds roughly $40–60k/year — the payroll overhead isn't free.
- **Caution:** "Reasonable salary" is scrutinized by the IRS. Don't use this to dodge taxes; use it when a CPA says the math works.

### 2c. C-Corp (Delaware or California)
- **Why:** If Paul ever wants outside investment (venture capital, etc.), investors strongly prefer C-corps.
- **Trade-off:** Double taxation (corporate tax + tax on dividends/salary). More paperwork, board meetings, formalities.
- **Verdict:** Not needed now. Revisit only if fundraising becomes real.

### Recommendation (framework, not advice)
Start as a **California LLC**, keep it simple, revisit the S-corp question with a CPA when revenue is real. Do not operate as a sole proprietorship once money flows — the liability shield matters, especially with user data and payments involved.

## 3. Revenue Model (Documented, Honest)

All revenue must be traceable to a documented source. Planned streams:

| Stream | Mechanism | Notes |
|---|---|---|
| Subscriptions | Citizen / Architect tiers (see `ACCOUNT_TIERS_DESIGN.md`) | Recurring, predictable. Proposed $9.99 / $24.99 — unapproved. |
| Marketplace fees | % of each GWC-denominated sale (15% Wanderer / 10% Citizen / 5% Architect) | Fee income is real revenue even though GWC itself is fictional — see §5. |
| Land / tier fees | If land ownership carries upkeep costs | Only if implemented; document clearly. |
| Creator payouts (outgoing) | Future real-money payouts to top creators | This is an **expense**, not revenue. See §6. |

**What GridWorld does NOT do:** sell user data, run ads against user behavior without consent, or present GWC as an investment or real currency. GWC is fictional, simulated, no cash value — this must be stated everywhere GWC appears.

## 4. Tax Obligations (Framework — CPA Required)

- **Income tax:** All business income is taxable. LLC pass-through means it lands on Paul's personal return. Track quarterly estimated payments once revenue starts.
- **Sales tax on digital goods:** California generally does **not** tax digital goods the way it taxes physical goods, but rules vary by state and change. If GridWorld sells to users in other states, nexus rules may apply. A CPA must review this before launch of paid tiers.
- **1099s for creator payouts:** If/when GridWorld pays creators real money, US tax law generally requires Form 1099-NEC for any individual paid $600+/year. This means collecting W-9s from payees, tracking payouts per person, and filing on time. Build this into the payout system from the start — retroactive 1099 compliance is painful.
- **Employment tax:** If Paul hires anyone (even contractors), classification (employee vs. contractor) has tax consequences. Get this right early.

## 5. The GWC Question (Important)

Grid World Currency (GWC) is fictional with no cash value and no cash-out. That design choice simplifies the tax picture enormously: **fictional currency with no redemption path is generally not taxable income to users and not a money-transmitter trigger.**

**But** — the moment GridWorld does any of the following, the picture changes completely:
- Lets users convert GWC to USD (cash-out)
- Pays creators real money based on GWC earnings
- Sells GWC for USD in a way structured as a stored-value product

Any of those moves require: money-transmitter licensing analysis (state-by-state), tax counsel, KYC/AML procedures, and a benefits-plan review for Paul (income counts against SSI/SSDI). **Do not add cash-out without a lawyer.**

## 6. Creator Payouts (Future Phase — Real Money)

Paul wants users — including free-tier users — to eventually earn real money. The lawful path:

1. **Phase A (now):** GWC-only economy. Fictional, closed loop. No legal exposure.
2. **Phase B (later):** Real-money creator payouts via a regulated provider (e.g., Stripe Connect or equivalent). GridWorld never touches raw card/bank data; the provider handles KYC, tax forms, and payouts.
3. **Phase C (much later, lawyer required):** Only then consider any GWC↔USD convertibility.

Each phase needs Paul's explicit sign-off plus professional review. Phase B and C are **not** approved — they are roadmap items.

## 7. Record-Keeping Requirements (From Day One)

Even pre-revenue, keep these records. If the court program, SSA, or IRS ever asks, the answer is a folder, not a scramble:

- **Business formation documents** (Articles of Organization, Operating Agreement, EIN letter)
- **All income:** every subscription payment, every marketplace fee — date, amount, source, user
- **All expenses:** hosting (Render), domains, software, contractor payments — receipts for everything
- **Bank records:** separate business bank account from day one of revenue. Never commingle personal and business funds.
- **User payout records:** who was paid, how much, when, tax forms collected
- **Contracts:** any agreement with contractors, partners, service providers
- **Decision log:** major business decisions with dates (this repo's docs serve this purpose — keep them current)

**Tools:** A real accounting system (not spreadsheets) once revenue starts. Until then, dated records in an organized folder.

## 8. Phased Approach (Tied to Paul's Benefits Planning)

| Phase | Business state | Benefits implication | Checkpoint |
|---|---|---|---|
| **0 — Build** (now) | Pre-revenue. Costs only. | No income to report; keep expense records. | Entity formed? EIN obtained? Separate bank account? |
| **1 — First revenue** | Subscriptions/fees trickle in. | Report all earnings to SSA per program rules. Likely still under thresholds — **confirm with WIPA counselor.** | CPA engaged? Quarterly estimates set up? Income tracking clean? |
| **2 — Growing** | Revenue sustains operations. | Earnings may approach SGA (Substantial Gainful Activity) thresholds. Trial Work Period rules may apply for SSDI. **WIPA review required before this phase.** | Benefits counselor reviewed the numbers? Court program obligations still met? |
| **3 — Sustainable** | GridWorld can support Paul. | Planned, lawful transition off SSI/SSDI per counselor's timeline. Safety nets (expedited reinstatement) understood in advance. | Transition plan in writing? 6-month reserve saved? |

**Non-negotiable rule:** Paul does not reduce or stop benefits based on *projected* income — only on *actual, sustained* income reviewed with his benefits counselor. Hope is not a financial plan.

## 9. Court Program Considerations

Paul is in the Assisted Intervention court program. Practical implications for the business:

- All income must be lawful, documented, and reportable. No gray areas.
- Keep the business legible: a judge or caseworker should be able to understand what GridWorld is and where money comes from in five minutes.
- Major business milestones (entity formation, first revenue, hiring) are worth noting in personal records in case the program ever asks about employment/income status.
- Nothing in this document is legal advice about the court program. Paul's attorney (if he has one for the program) should know GridWorld exists as a business endeavor.

## 10. Immediate Action Items

- [ ] Consult a California business attorney about LLC formation (before first revenue)
- [ ] Engage a CPA for tax planning (before first revenue)
- [ ] Find a WIPA benefits counselor in Orange County for the SSI/SSDI transition plan
- [ ] Obtain EIN from the IRS (free, online) when forming the entity
- [ ] Open a separate business bank account when revenue begins
- [ ] Set up real accounting software when revenue begins
- [ ] Review this document quarterly as the business evolves

---

*GridWorld is in active development. This document will be updated as the business takes shape. Last updated: 2026-10-08.*
