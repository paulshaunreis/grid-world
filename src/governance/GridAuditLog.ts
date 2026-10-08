import type {SupabaseClient} from '@supabase/supabase-js';

// GridWorld governance audit log client (Phase 0 of governance/localization implementation).
// Append-only: the grid_audit_log table has no update/delete RLS policies for
// authenticated users, so events are immutable once written. Service role
// retains full access for incident response and retention.

export type GridAuditActorType = 'user' | 'ai_worker' | 'ai_influencer' | 'system';

export interface GridAuditEvent {
  id?: string;
  actor_id?: string | null;
  actor_type: GridAuditActorType;
  action: string;
  target_type?: string | null;
  target_id?: string | null;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

// Well-known action names. Services should use these constants rather than
// freeform strings so the log stays queryable.
export const GridAuditActions = {
  // Forum / message board
  FORUM_TOPIC_CREATE: 'forum.topic.create',
  FORUM_TOPIC_DELETE: 'forum.topic.delete',
  FORUM_POST_CREATE: 'forum.post.create',
  FORUM_POST_DELETE: 'forum.post.delete',
  FORUM_POST_MODERATE: 'forum.post.moderate',
  // Social / roles
  ROLE_GRANT: 'role.grant',
  ROLE_REVOKE: 'role.revoke',
  FRIEND_REQUEST: 'social.friend.request',
  // Moderation / safety
  CONTENT_MODERATE: 'content.moderate',
  AVATAR_MODERATE: 'avatar.moderate',
  USER_REPORT: 'safety.report',
  USER_BLOCK: 'safety.block',
  // Operator / auth
  OPERATOR_VERIFY: 'operator.verify',
  AUTH_SIGNUP: 'auth.signup',
  // AI governance
  AI_ACTOR_REGISTER: 'ai_actor.register',
  AI_ACTOR_SUSPEND: 'ai_actor.suspend',
  AI_ACTOR_REVOKE: 'ai_actor.revoke',
  AI_WORKER_ACTION: 'ai_worker.action',
  AI_WORKER_SUSPEND: 'ai_worker.suspend',
  // Asset / provenance
  ASSET_PUBLISH: 'asset.publish',
  ASSET_REVOKE: 'asset.revoke',
  // Language / localization (Phase 1+)
  LANGUAGE_SET: 'language.set',
} as const;

export type GridAuditAction = typeof GridAuditActions[keyof typeof GridAuditActions] | (string & {});

export class GridAuditLog {
  // Batched writes: events queue locally and flush on interval or on demand.
  // Keeps audit logging from blocking UI interactions.
  private queue: GridAuditEvent[] = [];
  private flushing = false;
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly client: SupabaseClient,
    private readonly flushIntervalMs: number = 5000,
  ) {}

  /** Start background flushing. Call once at app boot. */
  start() {
    if (this.flushTimer) return;
    this.flushTimer = setInterval(() => { void this.flush(); }, this.flushIntervalMs);
  }

  /** Stop background flushing. Call on app teardown. */
  stop() {
    if (this.flushTimer) { clearInterval(this.flushTimer); this.flushTimer = null; }
  }

  /**
   * Log an audit event. Queued and flushed in the background; resolves
   * immediately. Never throws — audit logging must not break the caller's flow.
   * Use flush() to force pending events to the server (e.g. before navigation).
   */
  log(event: Omit<GridAuditEvent, 'id' | 'created_at'>): void {
    this.queue.push({ ...event, metadata: event.metadata ?? {} });
  }

  /** Convenience: log an event attributed to the current authenticated user. */
  async logAsUser(
    action: GridAuditAction,
    opts: { target_type?: string; target_id?: string; metadata?: Record<string, unknown> } = {},
  ): Promise<void> {
    const uid = (await this.client.auth.getUser()).data.user?.id ?? null;
    this.log({ actor_id: uid, actor_type: 'user', action, ...opts });
  }

  /** Convenience: log a system-attributed event (no user). */
  logSystem(
    action: GridAuditAction,
    opts: { target_type?: string; target_id?: string; metadata?: Record<string, unknown> } = {},
  ): void {
    this.log({ actor_id: null, actor_type: 'system', action, ...opts });
  }

  /** Flush queued events to the server now. */
  async flush(): Promise<void> {
    if (this.flushing || this.queue.length === 0) return;
    this.flushing = true;
    const batch = this.queue.splice(0, this.queue.length);
    try {
      const { error } = await this.client.from('grid_audit_log').insert(
        batch.map(e => ({
          actor_id: e.actor_id ?? null,
          actor_type: e.actor_type,
          action: e.action,
          target_type: e.target_type ?? null,
          target_id: e.target_id ?? null,
          metadata: e.metadata ?? {},
        })),
      );
      if (error) {
        // Re-queue on failure so events aren't silently dropped.
        this.queue.unshift(...batch);
        console.warn('[GridAuditLog] flush failed, re-queued', error.message);
      }
    } catch (err) {
      this.queue.unshift(...batch);
      console.warn('[GridAuditLog] flush threw, re-queued', err);
    } finally {
      this.flushing = false;
    }
  }

  /** Read recent audit events for the current user (RLS-scoped). */
  async recent(limit: number = 50): Promise<GridAuditEvent[]> {
    const { data, error } = await this.client
      .from('grid_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as GridAuditEvent[];
  }
}
