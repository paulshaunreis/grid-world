import * as THREE from 'three';

export type SentinelState = 'patrol' | 'responding' | 'holding' | 'returning';

export class GridSentinel {
  readonly group = new THREE.Group();
  state: SentinelState = 'patrol';
  private target = new THREE.Vector3();

  constructor(private readonly name = 'Omni Sentinel') {
    this.group.name = name;
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.45, 1.2, 6, 12), new THREE.MeshStandardMaterial({color:0x7893a6,emissive:0x243846,emissiveIntensity:1}));
    const visor = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 8), new THREE.MeshStandardMaterial({color:0xeaf5ff,emissive:0x789aaa,emissiveIntensity:2}));
    visor.position.y = 0.8;
    this.group.add(body, visor);
    this.group.position.set(5, 0.8, 4);
  }

  respond(position: THREE.Vector3) {
    this.state = 'responding';
    this.target.copy(position);
  }

  update(dt: number) {
    if (this.state !== 'responding') return;
    const direction = this.target.clone().sub(this.group.position);
    direction.y = 0;
    if (direction.length() < 1.2) { this.state = 'holding'; return; }
    direction.normalize();
    this.group.position.addScaledVector(direction, Math.min(5 * dt, direction.length()));
    this.group.lookAt(this.target.x, this.group.position.y, this.target.z);
  }
}