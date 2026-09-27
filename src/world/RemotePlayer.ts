import * as THREE from 'three';
import type { RemotePlayerState } from '../network/Presence';

export class RemotePlayer {
  readonly id: string;
  readonly group = new THREE.Group();
  private readonly target = new THREE.Vector3();
  private targetYaw = 0;
  private readonly labelTexture: THREE.CanvasTexture;
  private readonly labelContext: CanvasRenderingContext2D;

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

    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 512;
    labelCanvas.height = 128;
    this.labelContext = labelCanvas.getContext('2d')!;
    this.labelTexture = new THREE.CanvasTexture(labelCanvas);

    const label = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: this.labelTexture, transparent: true, depthWrite: false })
    );
    label.scale.set(3.2, 0.8, 1);
    label.position.set(0, 2.45, 0);

    this.group.add(body, visor, label);
    this.setState(state);
  }

  private drawName(displayName: string) {
    const context = this.labelContext;
    context.clearRect(0, 0, 512, 128);
    context.fillStyle = 'rgba(7, 17, 31, 0.78)';
    context.roundRect(8, 24, 496, 76, 18);
    context.fill();
    context.font = 'bold 42px system-ui, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#eef8ff';
    context.fillText(displayName, 256, 62);
    this.labelTexture.needsUpdate = true;
  }

  setState(state: RemotePlayerState) {
    this.target.set(state.x, state.y, state.z);
    this.targetYaw = state.yaw;
    this.drawName(state.displayName);
  }

  update(delta: number) {
    const blend = 1 - Math.exp(-12 * delta);
    this.group.position.lerp(this.target, blend);
    this.group.rotation.y = THREE.MathUtils.lerp(this.group.rotation.y, this.targetYaw, blend);
  }
}
