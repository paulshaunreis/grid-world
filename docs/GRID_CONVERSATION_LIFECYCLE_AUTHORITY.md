# Grid Conversation Lifecycle Authority

The conversation foundation now has authoritative lifecycle transitions for:

- message edit
- message delete
- participant leave
- owner participant removal
- owner moderation state changes

Every transition is executed server-side, with direct table writes revoked, and records an immutable audit event through the existing audit writer.

## Moderation boundary

Moderation changes the message lifecycle state. It does not rewrite the original sender identity or claim that the moderation decision is objectively true.

The audit event records the actor, reason, prior state, and resulting state.

## Ownership boundary

- Send/edit/delete require the message sender.
- Leave is self-service for non-owner participants.
- Participant removal requires an active conversation owner.
- The owner cannot remove another owner because this slice has no ownership-transfer protocol.
- Moderation requires an active conversation owner.

## Recovery boundary

Deletion is represented as a state transition with a visible deleted marker rather than physical row destruction. This preserves evidence and permits future retention/recovery policy without pretending the record never existed.

## Client boundary

The TypeScript wrapper uses lifecycle-specific row contracts and calls only the authoritative RPCs. It is not an authorization boundary and does not perform direct table writes.

## Next boundary

The remaining messaging work is product/UI behavior, notifications, blocking/privacy controls, attachments, read state, and recipient-specific translation. Those should build on this authority layer rather than bypass it.
