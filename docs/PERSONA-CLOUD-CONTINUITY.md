# Grid Persona Cloud Continuity

Purpose: durable recovery for Grid personas if a chat session, model context, application, or deployment is lost.

## Source of truth
The GitHub repository is the canonical public/project-readable definition of persona identities, roles, principles, safety boundaries, learning protocol, and version history. Git preserves revision history, and repository backups can preserve the repository for disaster recovery. See docs/PERSONA-LEARNING-AND-EVOLUTION.md.

## Continuity layers
1. Persona definitions — stable identity, role, values, capabilities, limits.
2. Shared knowledge — durable project principles and research notes.
3. Evolution journal — dated changes to working models, evidence, challenges, confidence, and unresolved questions.
4. Recovery manifest — maps every persona to its durable definition and recovery instructions.
5. Conversation continuity — future Grid UI can load the manifest and journal so a user can address a persona without depending on one chat.

## Recovery rule
If a runtime is lost, reconstruct personas from the latest committed definitions and the evolution journal. Do not invent missing memories. Mark uncertainty explicitly and resume learning from the last verified state.

## Identity rule
Persona continuity means continuity of documented role, principles, knowledge, and history—not a claim that a software process is literally the same conscious person.

## Safety
No persona has unilateral authority. Human governance remains primary. Sensitive credentials, private keys, secrets, or personal data do not belong in persona files.

## Backup strategy
Git history is the first recovery layer. Periodic repository exports or mirrors should provide an additional independent backup. GitHub documentation recommends repository backups for disaster recovery and notes that a Git mirror preserves revision history.

## Future Grid implementation
Expose a Persona Registry API backed by versioned records. Support persona lookup, journal retrieval, evidence references, challenge records, and recovery to a known-good snapshot. Keep writes server-authorized and auditable.