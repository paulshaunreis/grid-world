import * as THREE from 'three';
import { GRID_OMNI_TREE_GUARDS, diagnoseGuard, type GridGuardDiagnosis, type GridGuardSignal } from '../core/GridOmniTreeGuard';

const SERVICE_LAYOUT = [
  ['security', -13, -12], ['identity', 13, -12], ['world', 0, -30],
  ['social', -24, -2], ['creator', 24, -2], ['market', -24, -14],
  ['wallet', 24, -14], ['sound', -24, 10], ['events', 24, 10],
  ['media', -13, 24], ['connect', 13, 24], ['archive', 0, 29],
] as const;

export class GridOmniGuardPylon {
  readonly group = new THREE.Group();
  private readonly ring: THREE.Mesh;
  private readonly core: THREE.Mesh;
  private phase = 0;
  private diagnosis: GridGuardDiagnosis;

  constructor(readonly guardId: string, readonly x: number, readonly z: number) {
    const guard = GRID_OMNI_TREE_GUARDS.find(item => item.id === guardId) ?? GRID_OMNI_TREE_GUARDS[0];
    this.diagnosis = diagnoseGuard(guard, []);

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(.7, .95, .35, 12),
      new THREE.MeshStandardMaterial({ color: 0x182636, metalness: .75, roughness: .28 }),
    );
    base.position.y = .18;

    this.core = new THREE.Mesh(
      new THREE.OctahedronGeometry(.34, 1),
      new THREE.MeshStandardMaterial({ color: 0x74e8ef, emissive: 0x2e9eac, emissiveIntensity: 1.6, metalness: .45, roughness: .22 }),
    );
    this.core.position.y = 1.05;

    this.ring = new THREE.Mesh(
      new THREE.TorusGeometry(.75, .035, 8, 32),
      new THREE.MeshStandardMaterial({ color: 0x68d9ff, emissive: 0x3a9aaa, emissiveIntensity: 1.2 }),
    );
    this.ring.rotation.x = Math.PI / 2;
    this.ring.position.y = .65;

    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(.025, .12, 2.4, 8, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x68d9ff, transparent: true, opacity: .18 }),
    );
    beam.position.y = 1.45;

    this.group.add(base, this.core, this.ring, beam);
    this.group.position.set(x, 0, z);
    this.group.userData.interactable = true;
    this.group.userData.interactionName = guard.nodeId === 'grid-omni-core' ? 'Grid Omni Core Sentinel' : 'Grid Omni ' + guard.serviceId + ' Guard';
    this.group.userData.gridGuardId = guardId;
  }

  diagnose(signals: readonly GridGuardSignal[] = []) {
    const guard = GRID_OMNI_TREE_GUARDS.find(item => item.id === this.guardId);
    if (guard) this.diagnosis = diagnoseGuard(guard, signals);
    return this.diagnosis;
  }

  update(delta: number) {
    this.phase += delta;
    this.core.rotation.y += delta * .8;
    this.ring.rotation.z += delta * .5;
    const material = this.core.material as THREE.MeshStandardMaterial;
    material.emissiveIntensity = this.diagnosis.status === 'clear' || this.diagnosis.status === 'watch'
      ? 1.5 + Math.sin(this.phase * 2) * .3
      : 3;
  }
}

export function createGridOmniGuardLayer() {
  const root = new THREE.Group();
  const pylons: GridOmniGuardPylon[] = [];
  const core = new GridOmniGuardPylon('guard.core', 0, -2);
  root.add(core.group);
  pylons.push(core);

  for (const [service, x, z] of SERVICE_LAYOUT) {
    const pylon = new GridOmniGuardPylon('guard.' + service, x, z);
    root.add(pylon.group);
    pylons.push(pylon);
  }
  return { root, pylons };
}
