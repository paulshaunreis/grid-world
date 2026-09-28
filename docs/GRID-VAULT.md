# GRID VAULT — Preservation & Recovery Charter

**Purpose:** Protect the work created for Grid World so that the project, its architecture, personas, principles, and history can be recovered even if a conversation, deployment, or working session is lost.

## Preservation principle

> **Build boldly. Preserve deliberately. Change carefully.**

Grid World is treated as a long-lived body of work. No single conversation, model session, deployment, or persona is the sole source of truth.

## Current foundation snapshot

- Repository: `paulshaunreis/grid-world`
- Primary branch: `main`
- Foundation snapshot branch: `archive/2026-09-27-foundation`
- Foundation commit: `719dff7846f8d56e82ceda46181f6f648ed1772d`
- Snapshot purpose: preserve the state containing the persona cloud-continuity and recovery-index work.

The archive branch is intentionally separate from active development. It is a recovery point, not a place for ongoing feature work.

## What is being protected

### 1. Source
Application code, engine foundations, world systems, UI, creator systems, social systems, media architecture, scripting, persistence, and supporting infrastructure.

### 2. Design
Product architecture, economic design, Grid Identity, Grid Media, Grid Gallery, Grid Builder, Grid Work, Grid Share, Circular Credits, Omni, and governance/security principles.

### 3. Personas
The documented identities, roles, boundaries, study areas, learning protocol, evolution history, and recovery instructions for Grid personas.

### 4. Reasoning
Strategic principles, architectural decisions, research notes, and the rationale behind important constraints.

### 5. History
Git commits provide an auditable sequence of changes. Important milestones should receive their own named recovery point.

## Recovery hierarchy

When something goes wrong, recover in this order:

1. **Known-good Git snapshot**
2. **Latest committed main branch**
3. **Persona recovery index and continuity documents**
4. **Project architecture and decision records**
5. **External infrastructure state**
6. **Conversation context, if still available**

Never reconstruct missing project facts from imagination. If a fact cannot be verified, mark it unknown.

## Change discipline

Major changes should follow:

`OBSERVE → MEASURE → REVIEW → CHANGE → TEST → RECORD`

For high-impact systems, preserve the previous working state before changing it.

Examples of high-impact systems:
- authentication
- authorization
- financial ledger
- economy
- ownership
- persona identity
- moderation
- creator scripting
- persistent world state
- data migrations
- deployment infrastructure

## Branch philosophy

- `main` = active canonical project
- `archive/*` = preserved recovery snapshots
- feature branches = experimental or bounded changes

Do not delete an archive snapshot merely because newer work exists.

## Protection layers

The long-term protection model is:

`WORK → GIT HISTORY → RECOVERY BRANCH → VERIFIED SNAPSHOT → INDEPENDENT BACKUP`

GitHub branch/ruleset protections should be enabled where available. Important release/tag snapshots should be protected from accidental deletion or force-updates.

A single cloud provider is not considered true redundancy. As resources permit, maintain an independent backup outside the primary Git hosting account.

## Secrets

Never place passwords, private keys, service-role credentials, recovery codes, payment credentials, or other secrets in this repository.

Configuration may be documented; secret values belong in secret-management systems.

## Persona continuity rule

A persona can be recovered from its documented identity, principles, knowledge, and evolution history.

This means continuity of documented state—not a claim that a software process is literally the same conscious person.

## Human authority

No persona, automation, model, service, or subsystem receives authority merely because it has accumulated knowledge.

Important decisions remain subject to human governance, explicit authorization, auditability, and reversal where practical.

## The promise of the Vault

If Grid World grows into something much larger, this record should still answer four questions:

1. **What did we build?**
2. **Why did we build it this way?**
3. **What state was known to work?**
4. **How do we get back there?**

> **Nothing important should depend on memory alone.**
