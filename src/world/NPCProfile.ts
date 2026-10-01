export type NPCGender = 'unspecified' | 'female' | 'male' | 'nonbinary';
export type NPCRelationKind = 'family' | 'friend' | 'rival' | 'mentor' | 'faction';

export interface NPCProfileRecord {
  id: string;
  displayName: string;
  role: string;
  archetype: string;
  world: string;
  gender: NPCGender;
  level: number;
  traits: string[];
  skills: Record<string, number>;
  occupation: { title: string; workplaceId?: string; progression: number; };
  home: { world: string; x: number; y: number; z: number; };
  memories: string[];
  relationshipIds: string[];
  factionIds: string[];
  tags: string[];
}

export function createNPCProfile(input: Omit<NPCProfileRecord, 'level' | 'memories' | 'relationshipIds' | 'factionIds' | 'tags'> & Partial<Pick<NPCProfileRecord, 'level' | 'memories' | 'relationshipIds' | 'factionIds' | 'tags'>>): NPCProfileRecord {
  return { level: 1, memories: [], relationshipIds: [], factionIds: [], tags: [], ...input };
}

export function profileSummary(profile: NPCProfileRecord) {
  return { id: profile.id, displayName: profile.displayName, role: profile.role, world: profile.world, occupation: profile.occupation.title, level: profile.level, traits: [...profile.traits], relationshipCount: profile.relationshipIds.length };
}
