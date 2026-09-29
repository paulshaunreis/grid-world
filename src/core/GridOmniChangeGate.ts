export type GridOmniChangeRisk = 'low' | 'moderate' | 'high' | 'critical';

export interface GridOmniChangeProposal {
  id: string;
  target: string;
  summary: string;
  risk: GridOmniChangeRisk;
  reversible: boolean;
  tests: readonly string[];
  rollbackPlan: string;
  evidence: readonly string[];
  owner: string;
  blastRadius: 'scoped' | 'regional' | 'platform';
  dependencyReview: boolean;
  dataImpactReviewed: boolean;
  observabilityReady: boolean;
}

export interface GridOmniChangeDecision {
  allowed: boolean;
  reason: string;
  measuredAt: number;
}

const riskOrder: Record<GridOmniChangeRisk, number> = {
  low: 1,
  moderate: 2,
  high: 3,
  critical: 4,
};

/**
 * "Measure ten times, cut once" is an engineering gate, not a promise of
 * perfect security. High-impact changes require explicit evidence and a
 * credible rollback path before Grid Engine activation.
 */
export class GridOmniChangeGate {
  evaluate(proposal: GridOmniChangeProposal): GridOmniChangeDecision {
    const checks = [
      proposal.id.trim().length > 0,
      proposal.target.trim().length > 0,
      proposal.summary.trim().length > 0,
      proposal.owner.trim().length > 0,
      proposal.tests.length > 0,
      proposal.rollbackPlan.trim().length > 0,
      proposal.evidence.length >= (riskOrder[proposal.risk] >= 3 ? 2 : 1),
      proposal.risk === 'low' || proposal.reversible,
      proposal.dependencyReview,
      proposal.dataImpactReviewed && proposal.observabilityReady,
    ];

    const failed = checks.findIndex(check => !check);
    if (failed !== -1) {
      return {
        allowed: false,
        reason: 'Change gate failed: required measurement, test, evidence, or rollback criteria are missing.',
        measuredAt: Date.now(),
      };
    }

    return {
      allowed: true,
      reason: 'Change gate passed: proposal has measurable validation, evidence, and rollback coverage.',
      measuredAt: Date.now(),
    };
  }
}
