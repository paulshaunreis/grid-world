import { readVersioned, writeVersioned } from '../core/VersionedStorage';

export type GridNpcAction =
  | 'eat' | 'rest' | 'socialize' | 'work' | 'explore'
  | 'observe' | 'help' | 'play' | 'idle';

export interface GridNpcNeeds {
  hunger: number;
  energy: number;
  social: number;
  fun: number;
  comfort: number;
  safety: number;
  curiosity: number;
  purpose: number;
}

export interface GridNpcPersonality {
  sociability: number;
  curiosity: number;
  diligence: number;
  caution: number;
  playfulness: number;
  empathy: number;
}

export interface GridNpcMemory {
  id: string;
  subjectId?: string;
  eventType: string;
  summary: string;
  valence: number;
  importance: number;
  confidence: number;
  createdAt: string;
  lastRecalledAt?: string;
}

export interface GridNpcRelationship {
  affinity: number;
  trust: number;
  familiarity: number;
  lastInteractionAt?: string;
}

export interface GridNpcState {
  needs: GridNpcNeeds;
  memories: GridNpcMemory[];
  relationships: Record<string, GridNpcRelationship>;
  currentAction: GridNpcAction;
  actionUntil: number;
  lastUpdateAt: number;
}

const STORE_KEY = 'grid-world:npc-state';
const SCHEMA = 1;

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function defaultState(now: number): GridNpcState {
  return {
    needs: { hunger: .82, energy: .9, social: .58, fun: .55, comfort: .72, safety: .92, curiosity: .62, purpose: .7 },
    memories: [],
    relationships: {},
    currentAction: 'idle',
    actionUntil: now,
    lastUpdateAt: now,
  };
}

function loadAll(): Record<string, GridNpcState> {
  return readVersioned(STORE_KEY, SCHEMA, (data, schema) => {
    if (schema !== SCHEMA || !data || typeof data !== 'object') return {};
    return data as Record<string, GridNpcState>;
  }) ?? {};
}

function saveAll(value: Record<string, GridNpcState>) {
  writeVersioned(STORE_KEY, SCHEMA, value);
}

export class GridNpcBrain {
  readonly state: GridNpcState;
  private readonly personality: GridNpcPersonality;

  constructor(
    readonly id: string,
    readonly displayName: string,
    personality: Partial<GridNpcPersonality> = {},
    initial?: Partial<GridNpcState>,
  ) {
    const all = loadAll();
    this.state = {
      ...defaultState(Date.now()),
      ...(all[id] ?? {}),
      ...initial,
      needs: { ...defaultState(Date.now()).needs, ...(all[id]?.needs ?? {}), ...(initial?.needs ?? {}) },
      memories: [...(all[id]?.memories ?? initial?.memories ?? [])],
      relationships: { ...(all[id]?.relationships ?? initial?.relationships ?? {}) },
    };
    this.personality = {
      sociability: .5,
      curiosity: .5,
      diligence: .5,
      caution: .5,
      playfulness: .5,
      empathy: .5,
      ...personality,
    };
  }

  remember(memory: Omit<GridNpcMemory, 'id' | 'createdAt'>) {
    const now = new Date().toISOString();
    const existing = this.state.memories.find(item =>
      item.subjectId === memory.subjectId &&
      item.eventType === memory.eventType &&
      item.summary === memory.summary,
    );
    if (existing) {
      existing.importance = clamp(existing.importance + .08);
      existing.confidence = clamp(existing.confidence + .04);
      existing.lastRecalledAt = now;
    } else {
      this.state.memories.push({
        ...memory,
        id: crypto.randomUUID(),
        createdAt: now,
      });
    }
    this.state.memories.sort((a, b) => (b.importance * b.confidence) - (a.importance * a.confidence));
    this.state.memories = this.state.memories.slice(0, 80);
    this.persist();
  }

  hydrateMemories(memories: readonly GridNpcMemory[]) {
    for (const memory of memories) {
      if (!this.state.memories.some(existing => existing.id === memory.id)) this.state.memories.push({ ...memory });
    }
    this.state.memories.sort((a, b) => (b.importance * b.confidence) - (a.importance * a.confidence));
    this.state.memories = this.state.memories.slice(0, 80);
    this.persist();
  }

  recall(subjectId?: string, limit = 3) {
    const candidates = this.state.memories
      .filter(memory => !subjectId || memory.subjectId === subjectId)
      .sort((a, b) => (b.importance * b.confidence) - (a.importance * a.confidence))
      .slice(0, limit);
    const now = new Date().toISOString();
    for (const memory of candidates) memory.lastRecalledAt = now;
    if (candidates.length) this.persist();
    return candidates;
  }

  meet(otherId: string, affinityDelta = .03) {
    const relationship = this.state.relationships[otherId] ?? {
      affinity: 0,
      trust: 0,
      familiarity: 0,
    };
    relationship.familiarity = clamp(relationship.familiarity + .04);
    relationship.affinity = clamp(relationship.affinity + affinityDelta, -1, 1);
    relationship.trust = clamp(relationship.trust + affinityDelta * .5, -1, 1);
    relationship.lastInteractionAt = new Date().toISOString();
    this.state.relationships[otherId] = relationship;
    this.remember({
      subjectId: otherId,
      eventType: 'social',
      summary: 'Spent time with ' + otherId + '.',
      valence: affinityDelta,
      importance: .28,
      confidence: .8,
    });
  }

  chooseAction(context: {
    nearbyNpcIds?: readonly string[];
    isDaytime?: boolean;
    safe?: boolean;
    hasWork?: boolean;
    hasFood?: boolean;
  } = {}): GridNpcAction {
    const n = this.state.needs;
    const p = this.personality;
    const scores: Record<GridNpcAction, number> = {
      eat: (1 - n.hunger) * 1.7,
      rest: (1 - n.energy) * 1.8,
      socialize: (1 - n.social) * (0.8 + p.sociability) + (context.nearbyNpcIds?.length ?? 0) * .08,
      work: (1 - n.purpose) * (0.7 + p.diligence) + (context.hasWork ? .35 : 0),
      explore: n.curiosity * (.7 + p.curiosity) + (context.isDaytime ? .15 : -.1),
      observe: n.curiosity * .45 + p.caution * .25,
      help: n.purpose * p.empathy * .55,
      play: (1 - n.fun) * (.6 + p.playfulness),
      idle: .12,
    };
    if (!context.hasFood) scores.eat = 0;
    if (context.safe === false) {
      scores.explore *= .15;
      scores.play *= .2;
      scores.observe += .45 * p.caution;
    }
    const memoryBias = this.recall(undefined, 2).reduce((sum, memory) => sum + memory.valence * memory.importance, 0);
    scores.socialize += Math.max(0, memoryBias) * .12;

    return (Object.keys(scores) as GridNpcAction[])
      .sort((a, b) => scores[b] - scores[a])[0];
  }

  update(deltaSeconds: number, context: {
    nearbyNpcIds?: readonly string[];
    isDaytime?: boolean;
    safe?: boolean;
    hasWork?: boolean;
    hasFood?: boolean;
  } = {}) {
    const delta = Math.min(deltaSeconds, 5);
    const n = this.state.needs;
    n.hunger = clamp(n.hunger - delta * .004);
    n.energy = clamp(n.energy - delta * .0025);
    n.social = clamp(n.social - delta * .0018);
    n.fun = clamp(n.fun - delta * .0015);
    n.comfort = clamp(n.comfort - delta * .0008);
    n.curiosity = clamp(n.curiosity + delta * .0004);
    n.purpose = clamp(n.purpose - delta * .0007);

    if (this.state.currentAction === 'eat') n.hunger = clamp(n.hunger + delta * .12);
    if (this.state.currentAction === 'rest') n.energy = clamp(n.energy + delta * .10);
    if (this.state.currentAction === 'socialize') n.social = clamp(n.social + delta * .10);
    if (this.state.currentAction === 'play') n.fun = clamp(n.fun + delta * .09);
    if (this.state.currentAction === 'work') n.purpose = clamp(n.purpose + delta * .07);
    if (this.state.currentAction === 'explore') n.curiosity = clamp(n.curiosity - delta * .05);

    this.state.lastUpdateAt = Date.now();
    if (Date.now() >= this.state.actionUntil) {
      this.state.currentAction = this.chooseAction(context);
      this.state.actionUntil = Date.now() + 3000 + Math.random() * 5000;
    }
    if (this.state.memories.length) {
      for (const memory of this.state.memories) {
        const ageDays = (Date.now() - Date.parse(memory.createdAt)) / 86400000;
        memory.confidence = clamp(memory.confidence - Math.max(0, ageDays) * .00015);
      }
      this.state.memories = this.state.memories.filter(memory => memory.confidence > .08);
    }
    this.persist();
  }

  thought(): string {
    const memory = this.recall(undefined, 1)[0];
    switch (this.state.currentAction) {
      case 'eat': return 'I should find something to eat.';
      case 'rest': return 'I need a quiet place to recharge.';
      case 'socialize': return memory ? 'I remember ' + memory.summary : 'I could use some company.';
      case 'work': return 'There is useful work to finish.';
      case 'explore': return 'Something nearby has my attention.';
      case 'observe': return 'Let me watch before I act.';
      case 'help': return 'Someone may need a hand.';
      case 'play': return 'I could use a little fun.';
      default: return 'Everything is calm.';
    }
  }

  persist() {
    const all = loadAll();
    all[this.id] = this.state;
    saveAll(all);
  }

  snapshot() {
    return {
      id: this.id,
      displayName: this.displayName,
      needs: { ...this.state.needs },
      action: this.state.currentAction,
      memories: this.state.memories.slice(0, 8),
      relationships: { ...this.state.relationships },
      thought: this.thought(),
    };
  }
}
