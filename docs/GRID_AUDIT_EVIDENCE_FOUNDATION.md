# Grid Audit & Evidence Foundation

**Status:** Technical foundation / implementation work

## Purpose

Establish one general accountability trail for consequential Grid World actions.

## Boundary

grid_audit_events is not the currency ledger, analytics, chat history, NPC memory, an incident table, or a replacement for provenance on individual assets.

It records accountability metadata so later systems can answer:

WHO → HAD WHAT AUTHORITY → DID WHAT → TO WHAT → WHY → WITH WHAT EVIDENCE → WITH WHAT RESULT

## Event contract

Each event carries actor identity/type, authority scope, action, target, outcome, severity, reason/policy reference, source, request/correlation ID, bounded metadata, optional before/after state, provenance, timestamp, and a SHA-256 event hash.

## Trust boundary

The audit table is not exposed for direct client DML.

The trusted writer lives in the private database schema and is callable only by the service role. Authoritative database functions can call it inside their own transaction boundaries.

This deliberately avoids putting a SECURITY DEFINER writer in an API-exposed schema.

## Immutability

Audit rows are append-only. UPDATE and DELETE are rejected by a database trigger.

The event hash is an integrity signal, not a claim that the database itself is physically tamper-proof.

## Important limitation

This foundation does not mean every Grid World action is audited yet.

The next integration pass should attach authoritative audit calls to high-impact boundaries first:

1. identity/account changes;
2. permissions and moderation;
3. economy/commerce;
4. land/world ownership;
5. AI-worker actions;
6. security and safety decisions.

Low-value UI telemetry should not flood this table.

## Failure rule

A consequential operation must not report itself as fully successful if its required audit write failed.

Where a safe transactional boundary exists, the action and audit record should commit together. Where that is impossible, the operation must surface an explicit degraded/audit-failure state and preserve enough correlation data for reconciliation.

## Future read model

Do not expose raw audit history broadly. Build purpose-specific, privacy-aware read paths for user activity history, staff investigations, AI worker review, security incidents, legal/compliance requests, and system recovery.

Every read path gets its own authority and retention rules.