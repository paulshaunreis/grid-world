import { GridEntity, GridEntityMetadata } from './GridEntity';

export type GridObjectKind =
  | 'structure' | 'prop' | 'terrain' | 'avatar' | 'npc' | 'plant'
  | 'creature' | 'vehicle' | 'item' | 'landmark';

export interface GridObjectPermissions {
  ownerId: string | null;
  visibility: 'private' | 'friends' | 'public';
  modify: 'owner' | 'collaborators' | 'public';
  copy: boolean;
  export: boolean;
  remix: boolean;
}

export interface GridObjectProvenance {
  creatorId: string | null;
  createdAt: string;
  sourceAssetId?: string;
  parentObjectId?: string;
  version: string;
  contentHash?: string;
}

export interface GridObjectSnapshot {
  schema: 1;
  entity: ReturnType<GridEntity['entitySnapshot']>;
  kind: GridObjectKind;
  permissions: GridObjectPermissions;
  provenance: GridObjectProvenance;
}

export class GridObject extends GridEntity {
  readonly kind: GridObjectKind;
  permissions: GridObjectPermissions;
  provenance: GridObjectProvenance;

  constructor(
    id: string,
    kind: GridObjectKind,
    metadata: GridEntityMetadata,
    permissions: GridObjectPermissions,
    provenance: GridObjectProvenance,
  ) {
    super(id, metadata);
    this.kind = kind;
    this.permissions = { ...permissions };
    this.provenance = { ...provenance };
  }

  snapshot(): GridObjectSnapshot {
    return {
      schema: 1,
      entity: super.entitySnapshot(),
      kind: this.kind,
      permissions: { ...this.permissions },
      provenance: { ...this.provenance },
    };
  }
}
