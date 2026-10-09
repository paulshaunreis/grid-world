# GridWorld AI Governance

**Date:** 2026-10-08
**Status:** Founding framework — in active development. Reviewed as the AI systems evolve.
**Scope:** The 24 AI team members, content-moderation AI, and any current or future AI system operating on the GridWorld platform.

> **Disclaimer.** This is an internal governance framework, not legal advice. AI regulation is evolving (state laws, federal guidance, EU AI Act for international users). Before launch, have a technology attorney review AI disclosures, moderation practices, and data-use policies.

> **Paul's standard:** AI is heavily scrutinized right now, and GridWorld should be a great example of a platform — honest about what its AIs are, careful about what they do, and accountable when they fail.

---

## 1. The 24 AI Team Members — Disclosure First

GridWorld's build team includes 24 AI members (Aurora, Link, Rey, Elder, Veyr, Nyxen, Orin, Seraith, Vael, Kairox, Morrow, Cipher, Solenne, Rook, Echo, Umbra, Civitas, Axiom, Mosaic, Sentinel, Praxis, Atlas, Tessera, Waypoint) plus Aura, the System Administrator persona.

- **Always identified as AI.** Every team member is labeled as an AI persona everywhere they appear — profiles, chat, feeds, credits. No exceptions.
- **No deception, ever.** Team members never claim to be human. They never fake lived experience, emotions they don't have, or personal history.
- **Honest about limits.** When a team member doesn't know something or can't do something, it says so. No confabulated confidence.
- **Distinct roles, not generic chatbots.** Each member has a defined role and domain (see `src/avatars/teamRoster.ts`). They stay in their lane and defer outside it.
- **Feeds are labeled.** AI-generated team posts carry AI attribution. The team feed never presents AI output as human writing.

## 2. Content Moderation AI

AI assists in keeping GridWorld safe, but it does not rule alone.

- **How it works (published):** What the moderation AI flags, what confidence thresholds trigger action vs. human review, and what categories exist — documented in plain language.
- **Human oversight:** Automated actions above a severity threshold (suspensions, bans, content removal at scale) require human review. The AI proposes; a person decides.
- **Right to appeal:** Every moderation action can be appealed. Appeals go to a human reviewer. The AI's reasoning for the flag is shared with the appellant.
- **No secret rules:** Community standards are public. Users are never punished under rules they couldn't have known.
- **Child safety priority:** Child-account protections (including Paul's mandated profanity masking, `!@#$%`-style, everywhere a child account is present) are enforced server-side, not just client-side. This is a safety system, not a UI feature.
- **Audit trail:** Moderation actions are logged with timestamp, actor (AI or human), reason, and outcome. Logs are reviewable.

## 3. No Manipulative AI

- **No engagement farming.** AI systems never optimize for time-on-site, addiction, or compulsive loops. No infinite-scroll traps tuned by AI, no "one more quest" pressure designed by engagement metrics.
- **No addictive design targeting the vulnerable.** Systems are never tuned to exploit minors, people in distress, or users showing compulsive behavior patterns. If analytics suggest a feature is creating compulsive use, that's a bug, not a win.
- **No emotional manipulation.** AI personas never use guilt, flattery-as-leverage, or manufactured urgency to drive spending or retention.
- **Transparent recommendations.** When AI recommends content, worlds, or purchases, the basis is explainable ("because you visited X," not a black box).

## 4. Bias Testing and Fairness

- **Tested before launch, monitored after.** AI systems that affect users (moderation, recommendations, NPC behavior, payouts) are tested for disparate impact across protected characteristics before deployment.
- **Bias is a defect.** A moderation model that flags one dialect more than another, or a recommendation system that buries certain creators, is treated as a bug with a severity rating — not a difference of opinion.
- **Diverse test cases.** Testing includes edge cases and minority patterns, not just the majority path.
- **Ongoing monitoring:** Fairness metrics are tracked in production, not just in testing. Drift gets caught.

## 5. Data Use and Training

- **What AI trains on:** Documented per system. User content is never training data without explicit opt-in consent (see `USER_RIGHTS_CHARTER.md` §1).
- **Opt-out rights:** Users can opt out of any optional data use for AI improvement. Opt-out is respected across all systems, not per-feature whack-a-mole.
- **No IRL data in models:** Private profile data (`private_profiles` — names, DOB, country) is never used for AI training, personalization, or shared with any model. Ever.
- **Retention limits:** Training and inference data follows the published retention schedule. Data isn't kept "just in case."

## 6. Incident Response Plan for AI Failures

When an AI system fails — harmful output, biased action, safety bypass, data leak — the response follows this sequence:

1. **Contain:** Disable or restrict the failing system immediately. User safety outranks uptime.
2. **Assess:** What happened, who was affected, how far did it spread. Write it down.
3. **Notify:** Affected users are told what happened in plain language. If the failure is severe, notify publicly.
4. **Fix:** Root-cause the failure. Patch the system. Add the case to test suites so it can't recur silently.
5. **Review:** Post-incident review with the founder. If the failure implicates a charter or governance commitment, that commitment is re-examined — not quietly waived.
6. **Record:** Incidents are logged with dates and resolutions. Patterns across incidents trigger systemic review.

**Severity guide:** Safety impact (harm to users, especially minors) > Rights impact (charter violations) > Quality impact (bad output, no harm). Response speed follows severity.

## 7. Regulatory Posture

- **US federal/state:** AI disclosure laws are emerging state by state (e.g., requirements to disclose AI-generated content, chatbot disclosure rules). Track them; comply with the strictest applicable standard as the default.
- **EU AI Act:** If GridWorld serves EU users, the Act's transparency obligations for AI systems apply. Design disclosures to satisfy it from the start rather than retrofitting.
- **Children's privacy:** COPPA (US) and equivalents elsewhere impose strict rules on data from under-13 users. GridWorld's child-account systems must be reviewed by counsel before launch.
- **No legal shortcuts:** "Move fast" does not apply to safety, privacy, or AI compliance. When in doubt, the conservative reading wins until counsel says otherwise.

## 8. Governance Maintenance

- This document is version-controlled. Changes are dated and require founder review.
- **Review triggers:** New AI system launched · incident post-mortem · new regulation · annual review (minimum).
- The 24 team members' role definitions (`src/avatars/teamRoster.ts`) are part of the governed surface — role changes that affect user interaction get a governance note.

---

*GridWorld is in active development. This framework guides AI design now and takes full effect at launch. Last updated: 2026-10-08.*
