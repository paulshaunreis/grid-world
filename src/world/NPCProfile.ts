export type NPCGender = 'unspecified' | 'female' | 'male' | 'nonbinary';
export type NPCRelationKind = 'family' | 'friend' | 'rival' | 'mentor' | 'faction';

export interface NPCInventoryItem {
  id: string;
  name: string;
  category: 'TOOL' | 'MATERIAL' | 'FOOD' | 'CLOTHING' | 'KEY' | 'QUEST' | 'BLUEPRINT';
  quantity: number;
  quality: number;
  equipped?: boolean;
}

export interface NPCProfileStatus {
  label: string;
  mood?: string;
  activity?: string;
  world?: string;
  updatedAt?: string;
}

export interface NPCProfileRecord {
  id: string;
  displayName: string;
  role: string;
  archetype: string;
  world: string;
  gender: NPCGender;
  level: number;
  experience: number;
  traits: string[];
  skills: Record<string, number>;
  occupation: { title: string; workplaceId?: string; progression: number; };
  home: { world: string; x: number; y: number; z: number; };
  memories: string[];
  relationshipIds: string[];
  factionIds: string[];
  inventory: NPCInventoryItem[];
  tags: string[];
  status?: NPCProfileStatus;
}

export function createNPCProfile(input: Omit<NPCProfileRecord, 'level' | 'experience' | 'memories' | 'relationshipIds' | 'factionIds' | 'inventory' | 'tags'> & Partial<Pick<NPCProfileRecord, 'level' | 'experience' | 'memories' | 'relationshipIds' | 'factionIds' | 'inventory' | 'tags'>>): NPCProfileRecord {
  return { level: 1, experience: 0, memories: [], relationshipIds: [], factionIds: [], inventory: [], tags: [], ...input };
}

export function profileSummary(profile: NPCProfileRecord) {
  return {
    id: profile.id,
    displayName: profile.displayName,
    role: profile.role,
    world: profile.world,
    occupation: profile.occupation.title,
    level: profile.level,
    experience: profile.experience,
    traits: [...profile.traits],
    inventoryCount: profile.inventory.reduce((sum, item) => sum + item.quantity, 0),
    relationshipCount: profile.relationshipIds.length,
    factionCount: profile.factionIds.length,
    memoryCount: profile.memories.length,
    status: profile.status?.label ?? 'UNSPECIFIED',
  };
}
