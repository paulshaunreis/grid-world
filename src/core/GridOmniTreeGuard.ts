import type { GridOmniServiceId } from './GridOmniCore';

export type GridGuardStatus = 'clear' | 'watch' | 'diagnosing' | 'prevented' | 'contained' | 'degraded';

export interface GridGuardSignal {
  source: string;
  severity: 'info' | 'notice' | 'warning' | 'critical';
  metric: string;
  value: number;
  threshold: number;
}

export interface GridGuardDiagnosis {
  guardId: string;
  nodeId: string;
  status: GridGuardStatus;
  riskScore: number;
  signals: GridGuardSignal[];
  recommendedAction: 'observe' | 'rate-limit' | 'quarantine' | 'degrade' | 'isolate' | 'rollback';
  summary: string;
}

export interface GridOmniTreeGuard {
  id: string;
  nodeId: string;
  serviceId?: GridOmniServiceId;
  mission: string;
  diagnosticProfile: readonly string[];
  preventionProfile: readonly string[];
}

const SERVICES: GridOmniServiceId[] = [
  'security','identity','world','social','creator','market','wallet',
  'sound','events','media','connect','archive',
];

export const GRID_OMNI_TREE_GUARDS: readonly GridOmniTreeGuard[] = [
  {
    id: 'guard.core',
    nodeId: 'grid-omni-core',
    mission: 'Cross-layer diagnosis and dependency preflight before changes propagate.',
    diagnosticProfile: ['dependency drift','schema mismatch','health regression','blast radius','recovery readiness'],
    preventionProfile: ['change gate','circuit breaker','rollback check','evidence preservation'],
  },
  ...SERVICES.map(service => ({
    id: `guard.${service}`,
    nodeId: service,
    serviceId: service,
    mission: `Pre-event diagnosis and containment for Grid Omni ${service}.`,
    diagnosticProfile: ['health','permissions','dependencies','anomaly signals','capacity'],
    preventionProfile: ['rate-limit','quarantine','degrade','isolate','rollback','notify'],
  })),
];

export function diagnoseGuard(
  guard: GridOmniTreeGuard,
  signals: readonly GridGuardSignal[],
): GridGuardDiagnosis {
  const riskScore = Math.min(
    100,
    signals.reduce((sum, signal) => {
      const ratio = signal.threshold <= 0 ? 1 : signal.value / signal.threshold;
      const severityWeight = signal.severity === 'critical' ? 50 : signal.severity === 'warning' ? 25 : signal.severity === 'notice' ? 10 : 2;
      return sum + Math.min(50, Math.max(0, ratio) * severityWeight);
    }, 0),
  );

  const critical = signals.some(signal => signal.severity === 'critical' && signal.value >= signal.threshold);
  const warning = signals.some(signal => signal.severity === 'warning' && signal.value >= signal.threshold);

  if (critical) {
    return {
      guardId: guard.id,
      nodeId: guard.nodeId,
      status: 'prevented',
      riskScore,
      signals: [...signals],
      recommendedAction: 'isolate',
      summary: 'Critical threshold reached; isolate the affected scope before the event can spread.',
    };
  }

  if (warning || riskScore >= 35) {
    return {
      guardId: guard.id,
      nodeId: guard.nodeId,
      status: 'diagnosing',
      riskScore,
      signals: [...signals],
      recommendedAction: 'quarantine',
      summary: 'Elevated signal detected; quarantine the affected path while diagnosis completes.',
    };
  }

  return {
    guardId: guard.id,
    nodeId: guard.nodeId,
    status: signals.length ? 'watch' : 'clear',
    riskScore,
    signals: [...signals],
    recommendedAction: 'observe',
    summary: signals.length ? 'Non-critical signal observed; continue active monitoring.' : 'No anomaly detected in the current preflight.',
  };
}
