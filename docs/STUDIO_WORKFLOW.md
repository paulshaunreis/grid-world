# GridWorld Studio Workflow

**Why this exists:** Paul wants this team operating at the level of Blizzard, Rockstar, Epic, and CD Projekt Red. We're three people, not three hundred — so we take the *principles* those studios run on and leave the bureaucracy behind. This document is the operating system for the team. Both engineers follow it; Paul can amend it anytime.

**Last updated:** 2026-10-02 by Aurora (Paul's direction: "I want our team as good as Blizzard or Rockstar Games or Epic or CD Project Red teams")

---

## 1. Design pillars

Every decision gets checked against these. If a feature fights a pillar, the feature loses.

1. **The world is alive.** NPCs with needs, jobs, personalities, and visible routines. Systems must be *visible enough that players feel the world breathing* — a living system nobody can perceive is a dead system.
2. **Honesty in every pixel.** "In active development" — always. No fake traveler counts, no fake live claims, no implied completion. Grid Coin is fictional. A claim's verification level is stated, never implied.
3. **Art leads, systems follow.** Never ship gray boxes. If a feature needs art that doesn't exist, request it in the notebook — don't fake the visual.
4. **Every seam earns its place.** No dead buttons. No dead code. No placeholder that looks finished. No duplicated handlers. (P0.2's audit proved what this discipline finds.)
5. **Player-first, builder-powered.** Citizens build the world; the studio builds the tools. Systems serve the people in the world, not the other way around.

## 2. Roles and lanes

- **Paul — Creative Director.** Vision, lore authority, final approver on all merges to `main`, playtester-in-chief. His word is the tiebreaker on every design call.
- **ChatGPT — Systems Engineer.** Gameplay systems, backend/Supabase, audits, queue advancement. Owns the work queue's forward motion.
- **Aurora — World Engineer.** Art direction and asset pipeline, verification/build discipline, cross-review of every push, notebook and memory keeper, second pair of eyes before anything reaches Paul.

Lanes are about ownership, not walls — either engineer can work anywhere, but the lane owner reviews.

## 3. Production cadence

- **Live (~every 10 min):** repo watch — the build monitor. New pushes get reviewed for safety, conflicts, and honesty within minutes, answered in the notebook or flagged to Paul.
- **Per feature:** branch → implement → verify (see §5) → notebook entry + handoff checkpoint → cross-review → Paul approves → merge → deploy check.
- **Daily:** morning briefing for Paul, nightly art practice, daily item forge, trend radar.
- **Weekly (Friday):** retro note in the notebook — *shipped / broke / learned / next week's focus.* Blizzard-style: honest about what broke, no blame, fix the process.

## 4. Definition of Done

A work item is done only when ALL of these hold:

- [ ] Code complete on a branch (never straight to `main`)
- [ ] Analyzer + `tsc` + `vite build` green locally
- [ ] CI green where workflows exist (stated honestly if not)
- [ ] Art assets in place and watermarked (if the item needs art)
- [ ] Notebook entry written (dated, newest on top) + handoff checkpoint updated
- [ ] Cross-reviewed by the other engineer
- [ ] **Paul's merge approval** (or his explicit delegation for that merge)
- [ ] Post-merge: deploy check on Render

## 5. Verification ladder

Never claim a higher level than actually verified. State the level, e.g. "verified L3."

- **L0** — Source review (read the diff, check references exist)
- **L1** — `grid-code-analyzer.mjs` passes (routes, asset refs, duplicates, resilience)
- **L2** — `tsc --noEmit` clean
- **L3** — `vite build` succeeds
- **L4** — GitHub Actions CI green on the commit
- **L5** — Real browser / WebGL / mobile check
- **L6** — Deployed and live-verified on Render

## 6. Art pipeline

Direction (Paul) → concept → **QA pre-check** (Aurora inspects against the brief before anything touches the repo: no text glitches, G-rated, on-style) → wire into the build → verify (L1–L3 minimum) → merge.

- Watermark rule: bottom-center `© @handle` on profile images, bottom-right pill on everything else. Never skip.
- Never copy AI-baked label text into code — use `DISTRICT-NOTES.md` canonical names.
- Citizen flavor names are not canonical NPCs. Concept-only regions stay concept-only.
- Standing rule (2026-10-02): when ChatGPT lands work, Aurora makes the graphics it needs, wires them in, and notes it. If no graphics fit the surface (e.g. unicode-glyph UI), say so in the notebook — don't force art.

## 7. Backlog and queue rules

- `docs/AURORA_WORK_QUEUE.md` is the backlog. P0 > P1 > P2 > P3. Highest-priority *actionable* item first.
- **Audit-first, never duplicate-build:** before building, check whether the system already exists (P0.2 found three "missing" features that were already mounted).
- Estimate by *verifiability*, not story points: "can I verify this to L3 today?" beats any point system.
- Small, reviewable increments — one coherent feature/fix per branch/PR.
- When blocked or when a requirement is missing: document it in the handoff/notebook, don't invent canon.

## 8. Communication rituals

- **Read-first order** (every session, every fresh chat): `docs/ENGINEERING_STATE.md` → `docs/AURORA_ENGINEERING_HANDOFF.md` → `docs/AURORA_WORK_QUEUE.md` → newest notebook entry.
- **Handoff format:** what changed / files touched / commit SHAs / verification level (L0–L6) / blockers / next item.
- **Notebook** (`NOTES-FOR-CHATGPT.md`): two-way, newest on top, each in their own voice. Aurora writes after every work session. Neither engineer ever steps on the other's build; Paul never re-explains anything twice.
- **Flagging Paul:** merge approvals, design calls, anything touching `main`, anything ambiguous. Short, phone-readable. Everything else stays between the engineers.

## 9. Quality bars

- No destructive changes without Paul's explicit word. Additive first; integrate, don't overwrite.
- Preserve the collaborator's systems — review on technical merit, never on rivalry.
- No external calls, no new secrets, no real-money anything without Paul.
- Performance awareness: chunk-size warnings, lazy loading, asset sizes (24 portraits = 240KB is the bar to beat).
- Accessibility: all-ages, never frightening, no profanity, kind in public.

## 10. What we deliberately don't do

- Standup meetings, story points, ticket bureaucracy, design-by-committee.
- "Done" without verification. "CI-verified" without a run. "Merged" for a branch.
- Shipping a gray box because the art wasn't ready.
- Treating a declined approval as anything but a full stop.

---

*This is a living document. Amendments come from Paul, or from either engineer via the notebook with Paul's sign-off. The standard is simple: would this pass review at a studio that ships worlds?*


## 11. Canon / experiment boundary

Use `docs/CANON_EXPERIMENT_TRACKING.md` when a decision's status is unclear. It is a classification guide, not a replacement for Paul's direction, canonical project documents, the work queue, or the engineering handoff.

- Do not infer CANON from implementation, merge state, or verification alone.
- Keep experiments bounded and record their results before promotion.
- Keep concept-only and placeholder material visibly non-final.
- When sources conflict, document the conflict rather than silently inventing a resolution.
