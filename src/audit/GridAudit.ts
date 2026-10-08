import type { SupabaseClient } from '@supabase/supabase-js';

export type GridAuditActorType = 'user' | 'ai_worker' | 'service' | 'system' | 'anonymous';
export type GridAuditOutcome = 'success' | 'denied' | 'failed' | 'degraded' | 'observed';
export type GridAuditSeverity = 'info' | 'notice' | 'warning' | 'critical';

export interface GridAuditEventInput {
  actorType: GridAuditActorType;
  authority: string;
  action: string;
  targetType?: string;
  targetId?: string;
  outcome?: GridAuditOutcome;
  severity?: GridAuditSeverity;
  reason?: string;
  policyRef?: string;
  source?: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
  provenance?: Record<string, unknown>;
}

/**
 * Adapter for the authoritative audit RPC.
 * The database remains the write authority; this helper never writes the
 * audit table directly.
 */
export async function recordGridAuditEvent(
  client: SupabaseClient,
  input: GridAuditEventInput,
): Promise<string> {
  const { data, error } = await client.rpc('grid_record_audit_event', {
    p_actor_type: input.actorType,
    p_authority: input.authority,
    p_action: input.action,
    p_target_type: input.targetType ?? null,
    p_target_id: input.targetId ?? null,
    p_outcome: input.outcome ?? 'observed',
    p_severity: input.severity ?? 'info',
    p_reason: input.reason ?? '',
    p_policy_ref: input.policyRef ?? null,
    p_source: input.source ?? 'client',
    p_request_id: input.requestId ?? null,
    p_metadata: input.metadata ?? {},
    p_before_state: input.beforeState ?? null,
    p_after_state: input.afterState ?? null,
    p_provenance: input.provenance ?? {},
  });

  if (error) throw error;
  if (typeof data !== 'string') throw new Error('audit_event_id_missing');
  return data;
}