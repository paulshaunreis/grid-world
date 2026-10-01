import * as THREE from 'three';
import { getWorld } from '../world/GridWorldRegistry';
import { deriveWorldDNA } from '../world/WorldDNA';
import { createStarterPBRMaterial } from './GridPBRLibrary';
import type { GridEngine, GridEngineFrame, GridEngineSubsystem } from './GridEngine';

export type GridTeleportNodeKind = 'gate' | 'pylon';
export type GridTeleportNodeStatus = 'online' | 'guarded' | 'offline';

export interface GridTeleportDestination {
  id: string;
  displayName: string;
  regionId: string;
  position: { x: number; y: number; z: number };
  yaw: number;
  clearanceRadius: number;
}

export interface GridTeleportNodeDefinition extends GridTeleportDestination {
  kind: GridTeleportNodeKind;
  destinationIds: readonly string[];
  status?: GridTeleportNodeStatus;
  cooldownSeconds?: number;
  access: 'public' | 'friends' | 'owner';
  worldId?: string;
}

export interface GridTeleportRequest {
  actorId: string;
  nodeId: string;
  nowSeconds: number;
  relationship?: 'owner' | 'friend' | 'public';
  destinationId?: string;
}

export interface GridTeleportResult {
  ok: boolean;
  reason: 'teleported' | 'unknown-node' | 'offline' | 'access-denied' | 'cooldown' | 'no-destination';
  sourceNodeId?: string;
  destination?: GridTeleportDestination;
  cooldownUntil?: number;
}

export class GridTeleportSystem implements GridEngineSubsystem {
  readonly id = 'grid.teleport-system';
  private readonly nodes = new Map<string, GridTeleportNodeDefinition>();
  private readonly cooldowns = new Map<string, number>();
  private readonly traffic = new Map<string, {departures:number; arrivals:number; lastActivity:number}>();

  start(engine: GridEngine) {
    void engine;
  }

  update(_frame: GridEngineFrame) {
    // Teleport requests are event-driven. The subsystem owns the durable contract.
  }

  register(definition: GridTeleportNodeDefinition) {
    if (this.nodes.has(definition.id)) throw new Error('Teleport node already registered: ' + definition.id);
    this.nodes.set(definition.id, {
      ...definition,
      destinationIds: [...definition.destinationIds],
      status: definition.status ?? 'online',
      cooldownSeconds: definition.cooldownSeconds ?? 3,
    });
    return definition;
  }

  get(id: string) {
    return this.nodes.get(id);
  }

  all() {
    return [...this.nodes.values()];
  }

  destinations(nodeId: string, relationship: 'owner' | 'friend' | 'public' = 'public') {
    const node = this.nodes.get(nodeId);
    if (!node || node.status !== 'online') return [];
    if (node.access === 'owner' && relationship !== 'owner') return [];
    if (node.access === 'friends' && relationship === 'public') return [];
    return node.destinationIds.map(id => this.nodes.get(id)).filter((destination): destination is GridTeleportNodeDefinition => Boolean(destination && destination.status === 'online')).map(destination => ({ id: destination.id, displayName: destination.displayName, regionId: destination.regionId, position: { ...destination.position }, yaw: destination.yaw, clearanceRadius: destination.clearanceRadius }));
  }

  request(request: GridTeleportRequest): GridTeleportResult {
    const node = this.nodes.get(request.nodeId);
    if (!node) return { ok: false, reason: 'unknown-node' };
    if (node.status !== 'online') return { ok: false, reason: 'offline' };

    const relationship = request.relationship ?? 'public';
    if (node.access === 'owner' && relationship !== 'owner') return { ok: false, reason: 'access-denied' };
    if (node.access === 'friends' && relationship === 'public') return { ok: false, reason: 'access-denied' };

    const cooldownKey = request.actorId + ':' + node.id;
    const cooldownUntil = this.cooldowns.get(cooldownKey) ?? 0;
    if (request.nowSeconds < cooldownUntil) {
      return { ok: false, reason: 'cooldown', cooldownUntil };
    }

    const destinationId = request.destinationId ?? node.destinationIds[0];
    if (request.destinationId && !node.destinationIds.includes(request.destinationId)) return { ok: false, reason: 'no-destination' };
    const destination = destinationId ? this.nodes.get(destinationId) : undefined;
    if (!destination || destination.status !== 'online') return { ok: false, reason: 'no-destination' };

    this.cooldowns.set(cooldownKey, request.nowSeconds + (node.cooldownSeconds ?? 3));
    return {
      ok: true,
      reason: 'teleported',
      sourceNodeId: node.id,
      destination: {
        id: destination.id,
        displayName: destination.displayName,
        regionId: destination.regionId,
        position: { ...destination.position },
        yaw: destination.yaw,
        clearanceRadius: destination.clearanceRadius,
      },
    };
  }

  recordTraffic(sourceNodeId: string, destinationNodeId: string, nowSeconds = performance.now() / 1000) {
    const source = this.traffic.get(sourceNodeId) ?? { departures: 0, arrivals: 0, lastActivity: 0 };
    source.departures += 1;
    source.lastActivity = nowSeconds;
    this.traffic.set(sourceNodeId, source);
    const destination = this.traffic.get(destinationNodeId) ?? { departures: 0, arrivals: 0, lastActivity: 0 };
    destination.arrivals += 1;
    destination.lastActivity = nowSeconds;
    this.traffic.set(destinationNodeId, destination);
  }

  trafficSnapshot(nowSeconds = performance.now() / 1000) {
    return this.all().map(node => {
      const item = this.traffic.get(node.id) ?? { departures: 0, arrivals: 0, lastActivity: 0 };
      const recency = item.lastActivity ? Math.max(0, 1 - (nowSeconds - item.lastActivity) / 300) : 0;
      return { nodeId: node.id, displayName: node.displayName, regionId: node.regionId, departures: item.departures, arrivals: item.arrivals, activity: Math.min(1, recency + Math.min(0.7, (item.departures + item.arrivals) * 0.04)) };
    });
  }

  /** Rebuild world-gate destination lists after the world graph changes at runtime. */
  syncWorldConnections() {
    for (const node of this.nodes.values()) {
      if (!node.worldId) continue;
      const destinations = getWorldConnections(node.worldId)
        .map(connection => 'world-gate:' + connection.destination.toLowerCase())
        .filter(destinationId => this.nodes.has(destinationId));
      if (node.id.startsWith('world-gate:')) node.destinationIds = destinations;
    }
  }

  snapshot() {
    return this.all().map(node => ({ ...node, destinationIds: [...node.destinationIds] }));
  }
}

function addGlow(group: THREE.Group, color: number, radius: number, y: number) {
  const light = new THREE.PointLight(color, 6, radius);
  light.position.y = y;
  group.add(light);
}

export function createTeleportGate(definition: GridTeleportNodeDefinition) {
  const group = new THREE.Group();
  group.name = definition.displayName;
  group.userData.interactable = true;
  group.userData.interactionName = 'Teleport Gate · ' + definition.displayName;
  group.userData.gridTeleportNodeId = definition.id;
  group.userData.gridTeleportKind = definition.kind;
  group.userData.worldId = definition.worldId ?? '';

  const world = definition.worldId ? getWorld(definition.worldId) : undefined;
  const dna = deriveWorldDNA(world?.tags ?? []);
  const primary = world?.color ?? 0x397f9d;
  const secondary = world?.secondary ?? 0x1a2a3b;

  const frameMaterial = createStarterPBRMaterial('metal', {
    color: '#' + secondary.toString(16).padStart(6,'0'),
    metalness: .82,
    roughness: .24,
  });
  const energyMaterial = createStarterPBRMaterial('glass', {
    color: '#' + primary.toString(16).padStart(6,'0'),
    roughness: .08,
    emissive: '#' + primary.toString(16).padStart(6,'0'),
    emissiveIntensity: 1.6,
  });

  const left = new THREE.Mesh(new THREE.CylinderGeometry(.32, .48, 5.8, 12), frameMaterial);
  left.position.set(-2.2, 2.9, 0);
  const right = left.clone();
  right.position.x = 2.2;
  const top = new THREE.Mesh(new THREE.TorusGeometry(2.2, .32, 10, 48, Math.PI), frameMaterial);
  top.rotation.z = Math.PI;
  top.position.y = 5.8;

  const portal = new THREE.Mesh(new THREE.TorusGeometry(1.88, .11, 12, 64), energyMaterial);
  portal.position.y = 2.9;
  const core = new THREE.Mesh(new THREE.PlaneGeometry(3.7, 5.3), new THREE.MeshBasicMaterial({
    color: primary,
    transparent: true,
    opacity: .18,
    side: THREE.DoubleSide,
    depthWrite: false,
  }));
  core.position.set(0, 2.9, 0);

  // World-DNA ornamentation makes the same Grid transit protocol look native to its world.
  if (dna.transit.gateLanguage.includes('living') || world?.tags?.includes('growth')) {
    const vines = new THREE.Group();
    for (let i=0;i<8;i++) {
      const vine = new THREE.Mesh(new THREE.TorusGeometry(.65 + i*.06, .035, 6, 24), energyMaterial);
      vine.position.set((i%2 ? -1 : 1)*1.35, .8 + i*.55, .15);
      vine.rotation.x = Math.PI/2;
      vines.add(vine);
    }
    group.add(vines);
  } else if (world?.tags?.includes('ancient')) {
    for (const x of [-1.45,1.45]) {
      const rune = new THREE.Mesh(new THREE.OctahedronGeometry(.22,0), energyMaterial);
      rune.position.set(x,4.9,0);
      group.add(rune);
    }
  } else if (world?.tags?.includes('art') || world?.tags?.includes('culture')) {
    for (let i=0;i<4;i++) {
      const ribbon = new THREE.Mesh(new THREE.TorusGeometry(2.45+i*.22,.025,6,48), energyMaterial);
      ribbon.position.y = 2.9;
      ribbon.rotation.set(Math.PI/2, i*.35, i*.2);
      group.add(ribbon);
    }
  } else if (world?.tags?.includes('wildlife')) {
    for (let i=0;i<3;i++) {
      const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(.35,0), frameMaterial);
      stone.position.set((i-1)*1.7,.45,Math.sin(i)*.4);
      group.add(stone);
    }
  }

  group.add(left, right, top, portal, core);
  addGlow(group, primary, 14, 3);
  group.userData.transitLanguage = dna.transit.gateLanguage;
  group.userData.transitEffects = [...dna.transit.effects];

  group.position.set(definition.position.x, definition.position.y, definition.position.z);
  group.rotation.y = definition.yaw;
  return group;
}

export function applyTeleportTraffic(group: THREE.Group, activity: number) {
  const pulse = 1 + Math.min(0.045, activity * 0.045);
  group.userData.trafficActivity = activity;
  group.scale.setScalar(pulse);
  group.traverse(object => {
    const material = (object as THREE.Mesh).material as THREE.MeshBasicMaterial | THREE.MeshStandardMaterial | undefined;
    if (!material || typeof material !== 'object' || !('opacity' in material)) return;
    if ('emissiveIntensity' in material) material.emissiveIntensity = 1.6 + activity * 2.2;
  });
}

export function setTeleportGateState(group: THREE.Group, state: 'idle'|'selecting'|'transit'|'arrival', destinationName?: string) {
  group.userData.transitState = state;
  group.userData.transitDestination = destinationName ?? '';
  const portal = group.children.find(child => child instanceof THREE.Mesh && child.geometry instanceof THREE.TorusGeometry) as THREE.Mesh | undefined;
  const core = group.children.find(child => child instanceof THREE.Mesh && child.geometry instanceof THREE.PlaneGeometry) as THREE.Mesh | undefined;
  const portalMaterial = portal?.material as THREE.MeshStandardMaterial | undefined;
  const coreMaterial = core?.material as THREE.MeshBasicMaterial | undefined;
  if (portalMaterial) portalMaterial.emissiveIntensity = state === 'transit' ? 5 : state === 'arrival' ? 3.2 : state === 'selecting' ? 2.4 : 1.6;
  if (coreMaterial) coreMaterial.opacity = state === 'transit' ? .48 : state === 'arrival' ? .34 : state === 'selecting' ? .26 : .18;
  group.scale.setScalar(state === 'transit' ? 1.06 : state === 'arrival' ? 1.035 : 1);
}

export function createTeleportPylon(definition: GridTeleportNodeDefinition) {
  const group = new THREE.Group();
  group.name = definition.displayName;
  group.userData.interactable = true;
  group.userData.interactionName = 'Teleport Pylon · ' + definition.displayName;
  group.userData.gridTeleportNodeId = definition.id;
  group.userData.gridTeleportKind = definition.kind;

  const world=definition.worldId ? getWorld(definition.worldId) : undefined;
  const dna=deriveWorldDNA(world?.tags ?? []);
  const primary=world?.color ?? 0x4aa8c7;
  const secondary=world?.secondary ?? 0x172637;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(.85,1.15,.55,12),createStarterPBRMaterial('metal',{color:'#'+secondary.toString(16).padStart(6,'0'),metalness:.82,roughness:.28}));
  base.position.y = .28;

  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(.22, .38, 2.8, 10),
    createStarterPBRMaterial('technical', { color:'#'+secondary.toString(16).padStart(6,'0'), metalness:.72, roughness:.3 }),
  );
  shaft.position.y = 1.65;

  const crystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(.72, 1),
    createStarterPBRMaterial('glass', {
      color:'#'+primary.toString(16).padStart(6,'0'),
      roughness: .08,
      emissive:'#'+primary.toString(16).padStart(6,'0'),
      emissiveIntensity: 1.9,
    }),
  );
  crystal.position.y = 3.25;

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(.88, .09, 10, 32),
    createStarterPBRMaterial('metal', { color:'#'+secondary.toString(16).padStart(6,'0'), metalness:.86, roughness:.2 }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = .65;

  if(dna.transit.gateLanguage.includes('living') || world?.tags?.includes('growth')){
    const vine=new THREE.Mesh(new THREE.TorusGeometry(1.05,.045,6,28),createStarterPBRMaterial('technical',{color:'#'+primary.toString(16).padStart(6,'0'),emissive:'#'+primary.toString(16).padStart(6,'0'),emissiveIntensity:.9}));
    vine.rotation.x=Math.PI/2;vine.position.y=2.1;group.add(vine);
  } else if(world?.tags?.includes('art')){
    const ribbon=new THREE.Mesh(new THREE.TorusGeometry(1.25,.035,6,32),createStarterPBRMaterial('glass',{color:'#'+primary.toString(16).padStart(6,'0'),emissive:'#'+primary.toString(16).padStart(6,'0'),emissiveIntensity:1.1}));
    ribbon.rotation.set(Math.PI/2,.45,.25);ribbon.position.y=2.25;group.add(ribbon);
  }
  group.add(base, shaft, crystal, ring);
  addGlow(group, primary, 10, 2.8);
  group.userData.worldId=definition.worldId ?? '';
  group.userData.transitLanguage=dna.transit.gateLanguage;
  group.userData.transitEffects=[...dna.transit.effects];

  group.position.set(definition.position.x, definition.position.y, definition.position.z);
  group.rotation.y = definition.yaw;
  return group;
}
