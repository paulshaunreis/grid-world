import * as THREE from 'three';

/** Grid World is an open-ended network: there is no hard-coded maximum number of worlds. */
export type GridWorldId = string;
export const GRID_WORLD_CAPACITY = Infinity;
export const GRID_WORLD_NETWORK_PRINCIPLE = 'UNLIMITED WORLDS — register, connect, and grow without a fixed world-count limit.';
export type GridWorldEvent = 'quiet' | 'tide' | 'migration' | 'market' | 'bloom' | 'aurora' | 'storm';

export interface GridWorldDefinition {
  id: GridWorldId;
  label: string;
  description: string;
  center: THREE.Vector3;
  color: number;
  secondary: number;
  resourceKind?: string;
  tags?: readonly string[];
  gateId?: string;
  enabled?: boolean;
  event?: GridWorldEvent;
}

export interface GridWorldConnection {
  source: GridWorldId;
  destination: GridWorldId;
  mode?: 'GATE' | 'PORTAL' | 'WALK' | 'DISCOVERY';
  access?: 'PUBLIC' | 'FRIENDS' | 'OWNER' | 'TEAM';
}

const worlds = new Map<GridWorldId, GridWorldDefinition>();
const connections = new Map<GridWorldId, GridWorldConnection[]>();

export function registerWorld(definition: GridWorldDefinition) {
  if (worlds.has(definition.id)) throw new Error('Grid world already registered: ' + definition.id);
  worlds.set(definition.id, { ...definition, center: definition.center.clone(), enabled: definition.enabled ?? true, tags: [...(definition.tags ?? [])] });
  connections.set(definition.id, []);
  return worlds.get(definition.id)!;
}

export function upsertWorld(definition: GridWorldDefinition) {
  const existing = worlds.get(definition.id);
  if (!existing) return registerWorld(definition);
  Object.assign(existing, { ...definition, center: definition.center.clone(), tags: [...(definition.tags ?? existing.tags ?? [])] });
  return existing;
}

export function connectWorld(source: GridWorldId, destination: GridWorldId, options: Omit<GridWorldConnection, 'source'|'destination'> = {}) {
  if (!worlds.has(source) || !worlds.has(destination)) throw new Error('Both worlds must be registered before connecting them.');
  const list = connections.get(source)!;
  if (!list.some(c => c.destination === destination)) list.push({ source, destination, mode: 'GATE', access: 'PUBLIC', ...options });
  return list;
}

export function getWorld(id: GridWorldId) { return worlds.get(id); }
export function getWorlds() { return [...worlds.values()].filter(w => w.enabled !== false); }
export function getWorldConnections(id: GridWorldId) { return [...(connections.get(id) ?? [])]; }

export function getWorldCenter(id: GridWorldId) {
  return worlds.get(id)?.center.clone() ?? new THREE.Vector3();
}

/** Register a new world and connect it without modifying existing world code.
 * The registry intentionally has no numeric world-count cap; new worlds are data, not engine branches.
 */
export function registerNetworkWorld(definition: GridWorldDefinition, destinations: readonly GridWorldId[] = []) {
  const world = upsertWorld(definition);
  for (const destination of destinations) {
    if (!worlds.has(destination)) continue;
    connectWorld(world.id, destination);
    connectWorld(destination, world.id);
  }
  return world;
}

// Current built-in worlds are registered once here. New worlds should use registerNetworkWorld.
registerWorld({ id:'HARBOR', label:'TIDELINE', description:'tidal glass + industrial ribs', center:new THREE.Vector3(25,0,-4), color:0x3bc7df, secondary:0x174b6b, resourceKind:'TIDE_SALT', tags:['water','commerce','navigation'], event:'tide', gateId:'gate-harbor' });
registerWorld({ id:'GARDENS', label:'VERDANT', description:'biomorphic terraces + canopy', center:new THREE.Vector3(8,0,10), color:0x8fe388, secondary:0x285c3b, resourceKind:'BLOOM_RESIN', tags:['ecology','growth','canopy'], event:'bloom', gateId:'gate-gardens' });
registerWorld({ id:'CITADEL', label:'CROWN', description:'monolithic stone + luminous seams', center:new THREE.Vector3(0,0,16), color:0xd7b46a, secondary:0x5c4425, resourceKind:'CROWN_RELIC', tags:['ancient','systems','keeper'], event:'aurora', gateId:'gate-citadel' });
registerWorld({ id:'ARTS', label:'MUSE', description:'kinetic frames + suspended galleries', center:new THREE.Vector3(-20,0,-24), color:0xd28cff, secondary:0x4d285e, resourceKind:'MUSE_INK', tags:['art','market','culture'], event:'market', gateId:'gate-arts' });
registerWorld({ id:'WILDS', label:'FRONTIER', description:'ancient trunks + stone paths', center:new THREE.Vector3(20,0,-25), color:0xc9a36a, secondary:0x3d3021, resourceKind:'FRONTIER_ORE', tags:['wildlife','migration','frontier'], event:'migration', gateId:'gate-wilds' });

registerNetworkWorld({
  id:'SKYROOT',
  label:'SKYROOT',
  description:'A colossal living canopy-city suspended above a cloud sea; homes, bridges, gardens and transit are grown through the branches of a world-tree.',
  center:new THREE.Vector3(-38,18,22),
  color:0x74d99b,
  secondary:0x173d32,
  resourceKind:'SKYROOT_SAP',
  tags:['growth','wildlife','canopy','living','aerial','cloud'],
  event:'bloom',
  gateId:'gate-skyroot',
}, ['GARDENS','WILDS']);

const BUILTIN = ['HARBOR','GARDENS','CITADEL','ARTS','WILDS'];
for (const source of BUILTIN) for (const destination of BUILTIN) if (source !== destination) connectWorld(source, destination);
