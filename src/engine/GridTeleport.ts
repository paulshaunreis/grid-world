import * as THREE from 'three';
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
  destinationIds: string[];
  status?: GridTeleportNodeStatus;
  cooldownSeconds?: number;
  access: 'public' | 'friends' | 'owner';
}

export interface GridTeleportRequest {
  actorId: string;
  nodeId: string;
  nowSeconds: number;
  relationship?: 'owner' | 'friend' | 'public';
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

    const destinationId = node.destinationIds[0];
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

  const frameMaterial = createStarterPBRMaterial('metal', {
    color: '#1a2a3b',
    metalness: .82,
    roughness: .24,
  });
  const energyMaterial = createStarterPBRMaterial('glass', {
    color: '#397f9d',
    roughness: .08,
    emissive: '#42d9ff',
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
    color: 0x163c5a,
    transparent: true,
    opacity: .18,
    side: THREE.DoubleSide,
    depthWrite: false,
  }));
  core.position.set(0, 2.9, 0);
  group.add(left, right, top, portal, core);
  addGlow(group, 0x55ddff, 14, 3);

  group.position.set(definition.position.x, definition.position.y, definition.position.z);
  group.rotation.y = definition.yaw;
  return group;
}

export function createTeleportPylon(definition: GridTeleportNodeDefinition) {
  const group = new THREE.Group();
  group.name = definition.displayName;
  group.userData.interactable = true;
  group.userData.interactionName = 'Teleport Pylon · ' + definition.displayName;
  group.userData.gridTeleportNodeId = definition.id;
  group.userData.gridTeleportKind = definition.kind;

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(.85, 1.15, .55, 12),
    createStarterPBRMaterial('metal', { color: '#172637', metalness: .82, roughness: .28 }),
  );
  base.position.y = .28;

  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(.22, .38, 2.8, 10),
    createStarterPBRMaterial('technical', { color: '#31566b', metalness: .72, roughness: .3 }),
  );
  shaft.position.y = 1.65;

  const crystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(.72, 1),
    createStarterPBRMaterial('glass', {
      color: '#4aa8c7',
      roughness: .08,
      emissive: '#42d9ff',
      emissiveIntensity: 1.9,
    }),
  );
  crystal.position.y = 3.25;

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(.88, .09, 10, 32),
    createStarterPBRMaterial('metal', { color: '#6a8da0', metalness: .86, roughness: .2 }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = .65;

  group.add(base, shaft, crystal, ring);
  addGlow(group, 0x55ddff, 10, 2.8);

  group.position.set(definition.position.x, definition.position.y, definition.position.z);
  group.rotation.y = definition.yaw;
  return group;
}
