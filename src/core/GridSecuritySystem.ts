export type GridSecurityCapability =
  | 'WORLD_CREATE'
  | 'MATTER_EDIT'
  | 'SCRIPT_VALIDATE'
  | 'SCRIPT_EXECUTE'
  | 'MINING_REQUEST'
  | 'TRADE_REQUEST'
  | 'TELEPORT_REQUEST'
  | 'COMBAT_REQUEST'
  | 'CHAT_SEND'
  | 'ASSET_PUBLISH';

export interface GridSecurityAudit {
  id: string;
  capability: GridSecurityCapability;
  subjectId: string;
  allowed: boolean;
  reason: string;
  at: number;
}

export interface GridSecurityLimits {
  maxWorldCreatesPerMinute: number;
  maxScriptValidationsPerMinute: number;
  maxActionRequestsPerSecond: number;
}

const DEFAULT_LIMITS: GridSecurityLimits = {
  maxWorldCreatesPerMinute: 6,
  maxScriptValidationsPerMinute: 30,
  maxActionRequestsPerSecond: 12,
};

/**
 * Client-side Grid Security Gate.
 *
 * This is a UX/abuse-prevention boundary, not an authority boundary.
 * Anything that changes persistent inventory, currency, ownership, combat,
 * or shared-world state must still be validated by the server.
 */
export class GridSecuritySystem {
  private readonly limits: GridSecurityLimits;
  private readonly history = new Map<string, number[]>();
  private readonly audits: GridSecurityAudit[] = [];
  private quarantined = new Set<string>();

  constructor(limits: Partial<GridSecurityLimits> = {}) {
    this.limits = { ...DEFAULT_LIMITS, ...limits };
  }

  quarantine(subjectId: string, reason = 'manual quarantine') {
    this.quarantined.add(subjectId);
    this.audit('ASSET_PUBLISH', subjectId, false, reason);
  }

  release(subjectId: string) {
    this.quarantined.delete(subjectId);
  }

  isQuarantined(subjectId: string) {
    return this.quarantined.has(subjectId);
  }

  allow(capability: GridSecurityCapability, subjectId: string, cost = 1): boolean {
    if (!subjectId || this.isQuarantined(subjectId) || !Number.isFinite(cost) || cost <= 0) {
      this.audit(capability, subjectId, false, 'invalid or quarantined subject');
      return false;
    }

    const now = Date.now();
    const key = subjectId + ':' + capability;
    const windowMs = capability === 'WORLD_CREATE' || capability === 'SCRIPT_VALIDATE' ? 60_000 : 1_000;
    const limit = capability === 'WORLD_CREATE'
      ? this.limits.maxWorldCreatesPerMinute
      : capability === 'SCRIPT_VALIDATE'
        ? this.limits.maxScriptValidationsPerMinute
        : this.limits.maxActionRequestsPerSecond;

    const times = (this.history.get(key) ?? []).filter(at => now - at < windowMs);
    if (times.length + cost > limit) {
      this.history.set(key, times);
      this.audit(capability, subjectId, false, 'rate limit exceeded');
      return false;
    }

    for (let i = 0; i < cost; i++) times.push(now);
    this.history.set(key, times);
    this.audit(capability, subjectId, true, 'allowed');
    return true;
  }

  audit(capability: GridSecurityCapability, subjectId: string, allowed: boolean, reason: string) {
    this.audits.push({
      id: crypto.randomUUID(),
      capability,
      subjectId,
      allowed,
      reason,
      at: Date.now(),
    });
    while (this.audits.length > 200) this.audits.shift();
  }

  getAuditSnapshot() {
    return this.audits.slice();
  }
}
