# Grid World Security Baseline

Security is a product feature, not a launch checklist.

## Assets requiring server authority

The following must never be client-authoritative:

- account identity
- sessions
- Grid Coin
- Grid Gold
- Grid Silver
- Grid Copper
- Crystals
- inventory
- land ownership
- object ownership
- marketplace settlement
- digital-asset ownership
- administrative permissions

## Grid Guardian

Grid Guardian is the planned security layer around creator code and automated content.

### Pre-execution

- syntax validation
- static analysis
- capability validation
- dependency validation
- resource estimation
- malicious-pattern detection

### Runtime

- CPU quotas
- memory quotas
- event-rate limits
- API rate limits
- object-spawn limits
- network restrictions
- database restrictions
- execution timeout
- automatic termination

### Post-execution

- audit events
- anomaly detection
- abuse scoring
- incident correlation
- creator notification
- appeal/review workflow

## AI-assisted attacks

Grid World assumes attackers may use AI to generate attack variants, discover bugs, automate abuse, or attempt prompt injection against AI-powered features.

AI systems must therefore be treated as untrusted actors.

AI-generated actions pass through the same authorization and policy layers as human-generated actions.

AI must not receive:

- service-role credentials
- direct database administration
- unrestricted network access
- unrestricted code execution
- direct wallet mutation
- direct land transfer
- security-policy bypasses

## Economy integrity

Every important transaction should have a durable audit record containing enough information to investigate disputes and anomalies.

Transactions should be atomic and validated server-side.

Client requests are treated as requests, not facts.

## Incident response

The platform should support:

- script disablement
- object quarantine
- marketplace freeze
- account/session revocation
- suspicious transaction holds
- rollback/recovery procedures
- security incident logging

## Creator trust model

Creators are allowed to be powerful inside their own permitted boundaries. They are never allowed to cross those boundaries simply because they wrote code.

The goal is not to make creation weak. The goal is to make unsafe authority impossible.
