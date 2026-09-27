import * as THREE from 'three';
import type { RemotePlayerState } from '../network/Presence';

export class RemotePlayer {
  readonly id: string;
  readonly group = new THREE.Group();
  private readonly target = new THREE.Vector3();
  private targetYaw = 0;

  constructor(state: RemotePlayerState) {
    this.id = state.id;

    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.45, 0.9, 4, 8),
      new THREE.MeshStandardMaterial({ color: 0x66ccff, roughness: 0.7 })
    );
    body.position.y = 1.05;

    const visor = new THREE.Mesh(
      new THREE.SphereGeometry(0.27, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x224466, emissiveIntensity: 0.7 })
    );
    visor.position.set(0, 1.55, -0.28);

    this.group.add(body, visor);
    this.setState(state);
  }

  setState(state: RemotePlayerState) {
    this.target.set(state.x, state.y, state.z);
    this.targetYaw = state.yaw;
  }

  update(delta: number) {
    const blend = 1 - Math.exp(-12 * delta);
    this.group.position.lerp(this.target, blend);
    const angle = THREE.MathUtils.lerp(this.group.rotation.y, this.targetYaw, blend);
    this.group.rotation.y = angle;
  }
}
