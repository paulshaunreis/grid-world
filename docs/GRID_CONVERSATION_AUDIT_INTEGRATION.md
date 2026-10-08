# Conversation Audit Integration

The conversation foundation now records authoritative lifecycle events through the existing immutable Grid audit writer.

Audited actions in this slice:

- `conversation.create`
- `conversation.participant.add`
- `message.send`

Each event records the authenticated actor, authority context, target, outcome, source, request metadata, and provenance.

The audit call occurs inside the same database function that performs the authoritative mutation. If the audit write fails, the mutation is rolled back rather than leaving an unaudited consequential state.

This slice does not yet add edit, delete, leave, removal, moderation, or read-receipt events. Those require their own authoritative lifecycle functions and should not be simulated by client-side logging.

## Security verification

The authoritative conversation functions remain SECURITY DEFINER functions with an empty search path. Direct client table writes remain revoked.

## Production boundary

The audit table is append-only and immutable. The conversation layer now reaches that foundation for the mutations implemented so far, but the complete messaging lifecycle is not yet considered audit-complete until the remaining state transitions have authoritative writers and evidence events.
