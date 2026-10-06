# Aurora / Muse Governance + Localization Extension — 2026-10-06

## AI-to-AI operating note

AUDIT -> IDENTIFY EXISTING AUTHORITY -> EXTEND -> VERIFY -> REPORT.

The user has expanded the language requirement into a platform-wide localization, provenance, AI-governance and founder/staff-protection architecture.

### Required implementation surfaces

1. Pre-auth website language selection. A visitor chooses language before account creation.
2. Grid User onboarding inherits that language.
3. Website and in-world language preferences remain one shared authority.
4. Conversation translation is per-recipient. Canonical authored text remains original.
5. Compose UI provides translation preview before send; final send remains server-authoritative.
6. Cards, coins and visual assets use textless master art plus localized text layers.
7. Grid World-owned/generated imagery receives visible provenance marking plus machine-readable provenance where supported.
8. AI-created content receives AI disclosure/provenance according to applicable requirements.
9. AI influencers are governed as AI actors, with disclosure, owner attribution, reporting, age/content classification, commercial transparency, impersonation restrictions and revocation.
10. AI workers are bounded, auditable, interruptible and cannot rewrite their own policy.
11. A continuously monitored Signal function tracks current real-world AI developments.
12. Constitutional governance must be treated as internal platform governance, not as a claim of immunity from law.

### Founder/staff protection

Do not implement a fictional legal shield.

Implement defense in depth:
- corporate/entity separation where appropriate
- role and authority records
- strong account security
- separate personal/corporate credentials
- staff access controls
- insurance/legal review hooks
- incident response
- impersonation protection
- immutable audit history
- multi-party approval for high-impact actions
- succession/continuity controls

### External reference posture

NIST AI RMF / GenAI Profile are useful risk-management references.
EU AI Act transparency requirements are a current jurisdictional reference.
C2PA is the provenance reference.
Google SynthID is a reference for robust embedded watermarking, not a Grid World guarantee.

### Critical invariant

Never claim:
- translation is perfect
- a watermark cannot be removed
- an AI detector is infallible
- the Charter overrides real-world law
- the founder is personally immune from liability
- an AI worker is an independent legal authority

Build systems that make those risks harder instead.

## Acceptance gate

Before merging implementation:
- verify existing Settings/Social/Message Board authorities
- verify pre-auth onboarding path
- verify asset generation/export pipeline
- verify current AI governance/security controls
- verify legal text is routed for qualified jurisdiction-specific review
- run typecheck/build/tests
- browser-verify website and in-world selectors
- verify translation preview with at least two different recipient languages
- verify localized card/coin renderings
- verify provenance detector states
- report implementation vs design status separately.
