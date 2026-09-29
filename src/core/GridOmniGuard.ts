export type OmniSeverity = 'info' | 'notice' | 'warning' | 'critical';

export type OmniAction =
  | 'observe'
  | 'rate-limit'
  | 'quarantine'
  | 'degrade'
  | 'isolate'
  | 'revoke'
  | 'pause'
  | 'rollback'
  | 'notify'
  | 'audit';

export interface OmniSignal {
  source: string;
  kind: string;
  severity: OmniSeverity;
  subjectId?: string;
  details?: Record<string, unknown>;
}

export interface OmniDecision {
  incidentId: string;
  actions: OmniAction[];
  mode: 'normal' | 'guarded' | 'degraded' | 'isolated';
  userMessage: string;
}

const severityRank: Record<OmniSeverity, number> = {
  info: 0,
  notice: 1,
  warning: 2,
  critical: 3,
};

export class GridOmniGuard {
  private readonly recentSignals = new Map<string, number[]>();

  evaluate(signal: OmniSignal): OmniDecision {
    const now = Date.now();
    const key = signal.source + ':' + signal.kind;
    const times = (this.recentSignals.get(key) ?? []).filter(t => now - t < 60_000);
    times.push(now);
    this.recentSignals.set(key, times);

    const burst = times.length >= 8;
    const critical = severityRank[signal.severity] >= severityRank.critical;

    let actions: OmniAction[] = ['observe'];
    let mode: OmniDecision['mode'] = 'normal';
    let userMessage = 'Grid Omni is monitoring this signal.';

    if (critical || burst) {
      actions = ['rate-limit', 'quarantine', 'notify', 'audit'];
      mode = 'guarded';
      userMessage = 'Grid Omni detected unusual activity and limited the affected surface while it is checked.';
    }

    if (critical && signal.kind.includes('integrity')) {
      actions = ['isolate', 'revoke', 'notify', 'rollback'];
      mode = 'isolated';
      userMessage = 'Grid Omni isolated the affected asset or service to protect the rest of the Grid.';
    }

    return {
      incidentId: crypto.randomUUID(),
      actions,
      mode,
      userMessage,
    };
  }

  clear(source: string, kind: string) {
    this.recentSignals.delete(source + ':' + kind);
  }
}
