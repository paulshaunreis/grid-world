import type { NPCRelationKind } from './NPCProfile';

export interface NPCRelationship {
  id: string; sourceId: string; targetId: string; kind: NPCRelationKind;
  affinity: number; trust: number; familiarity: number; meetings: number;
  rivalry: number; lastInteractionAt?: string;
}

const clamp = (value: number) => Math.max(-1, Math.min(1, value));

export class NPCRelationshipNetwork {
  private readonly relationships = new Map<string, NPCRelationship>();
  private key(sourceId: string, targetId: string) { return sourceId < targetId ? sourceId + ':' + targetId : targetId + ':' + sourceId; }

  connect(sourceId: string, targetId: string, kind: NPCRelationKind, affinity = .1) {
    if (sourceId === targetId) return null;
    const id = this.key(sourceId, targetId);
    const existing = this.relationships.get(id);
    const relationship = existing ?? { id, sourceId, targetId, kind, affinity: 0, trust: 0, familiarity: 0, meetings: 0, rivalry: 0 };
    relationship.kind = kind;
    relationship.affinity = clamp(relationship.affinity + affinity);
    this.relationships.set(id, relationship);
    return relationship;
  }

  interact(sourceId: string, targetId: string, affinityDelta = .03, trustDelta = .015) {
    const relationship = this.relationships.get(this.key(sourceId, targetId)) ?? this.connect(sourceId, targetId, 'friend')!;
    relationship.affinity = clamp(relationship.affinity + affinityDelta);
    relationship.trust = clamp(relationship.trust + trustDelta);
    relationship.familiarity = Math.min(1, relationship.familiarity + .04);
    relationship.meetings += 1;
    relationship.lastInteractionAt = new Date().toISOString();
    return relationship;
  }

  setRivalry(sourceId: string, targetId: string, intensity = .35) {
    const relationship = this.relationships.get(this.key(sourceId, targetId)) ?? this.connect(sourceId, targetId, 'rival', -.1)!;
    relationship.kind = 'rival';
    relationship.rivalry = Math.max(0, Math.min(1, intensity));
    relationship.affinity = Math.min(relationship.affinity, 0);
    return relationship;
  }

  get(sourceId: string, targetId: string) { return this.relationships.get(this.key(sourceId, targetId)); }
  forNPC(npcId: string) { return [...this.relationships.values()].filter(r => r.sourceId === npcId || r.targetId === npcId); }
  snapshot() { return [...this.relationships.values()].map(r => ({ ...r })); }
}
