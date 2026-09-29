export type GridOmniNodeKind = 'core' | 'service' | 'subsystem' | 'capability';

export type GridOmniServiceId =
  | 'security'
  | 'identity'
  | 'world'
  | 'social'
  | 'creator'
  | 'market'
  | 'wallet'
  | 'sound'
  | 'events'
  | 'media'
  | 'connect'
  | 'archive';

export interface GridOmniNode {
  readonly id: string;
  readonly name: string;
  readonly kind: GridOmniNodeKind;
  readonly parentId: string | null;
  readonly description: string;
  readonly critical: boolean;
}

export const GRID_OMNI_CORE_ID = 'grid-omni-core';

export const GRID_OMNI_SERVICES: readonly GridOmniNode[] = [
  ['security','Grid Omni Security','security'],
  ['identity','Grid Omni Identity','identity'],
  ['world','Grid Omni World','world'],
  ['social','Grid Omni Social','social'],
  ['creator','Grid Omni Creator','creator'],
  ['market','Grid Omni Market','market'],
  ['wallet','Grid Omni Wallet','wallet'],
  ['sound','Grid Omni Sound','sound'],
  ['events','Grid Omni Events','events'],
  ['media','Grid Omni Media','media'],
  ['connect','Grid Omni Connect','connect'],
  ['archive','Grid Omni Archive','archive'],
].map(([id,name]) => ({
  id: `grid-omni-${id}`,
  name,
  kind: 'service' as const,
  parentId: GRID_OMNI_CORE_ID,
  description: `${name} operates beneath Grid Omni Core.`,
  critical: id === 'security' || id === 'identity' || id === 'archive',
}));

export class GridOmniCore {
  readonly root: GridOmniNode = {
    id: GRID_OMNI_CORE_ID,
    name: 'Grid Omni Core',
    kind: 'core',
    parentId: null,
    description: 'Root organizational and coordination layer for the Grid Omni service family.',
    critical: true,
  };

  private readonly nodes = new Map<string, GridOmniNode>();

  constructor() {
    this.nodes.set(this.root.id, this.root);
    for (const node of GRID_OMNI_SERVICES) this.nodes.set(node.id, node);
  }

  get(id: string) {
    return this.nodes.get(id);
  }

  childrenOf(parentId: string) {
    return [...this.nodes.values()].filter(node => node.parentId === parentId);
  }

  pathTo(id: string): GridOmniNode[] {
    const path: GridOmniNode[] = [];
    let current = this.nodes.get(id);
    while (current) {
      path.unshift(current);
      current = current.parentId ? this.nodes.get(current.parentId) : undefined;
    }
    return path;
  }

  isUnderService(id: string, service: GridOmniServiceId) {
    return this.pathTo(id).some(node => node.id === `grid-omni-${service}`);
  }

  snapshot() {
    return [...this.nodes.values()];
  }
}
