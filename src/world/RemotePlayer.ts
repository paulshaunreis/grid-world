import * as THREE from 'three';
import type { RemotePlayerState } from '../network/Presence';

const palettes: Record<RemotePlayerState['avatarStyle'], { body: number; visor: number }> = {
  navigator: { body: 0x5fd8ff, visor: 0x16465a }, muse: { body: 0xd58cff, visor: 0x4c285e },
  explorer: { body: 0xffad62, visor: 0x66351b }, builder: { body: 0xb18a62, visor: 0x543b24 },
  scholar: { body: 0x9aaee8, visor: 0x263444 }, sentinel: { body: 0xd5c47c, visor: 0x4b3d1e },
  wanderer: { body: 0x79c98b, visor: 0x17473f }, artist: { body: 0xef76b4, visor: 0x57263e },
  ranger: { body: 0x719c66, visor: 0x35402a }, architect: { body: 0x78a5bd, visor: 0x1c3139 },
  guardian: { body: 0x7182c8, visor: 0x2d3264 }, signal: { body: 0x65e6c8, visor: 0x1d4935 },
};

export class RemotePlayer {
  readonly id: string;
  readonly group = new THREE.Group();
  private readonly target = new THREE.Vector3();
  private targetYaw = 0;
  private readonly body: THREE.Mesh;
  private readonly visor: THREE.Mesh;
  private readonly labelTexture: THREE.CanvasTexture;
  private readonly labelContext: CanvasRenderingContext2D;

  constructor(state: RemotePlayerState) {
    this.id = state.id;
    this.body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.45, 0.9, 4, 8),
      new THREE.MeshStandardMaterial({ color: palettes.azure.body, roughness: 0.7 })
    );
    this.body.position.y = 1.05;

    this.visor = new THREE.Mesh(
      new THREE.SphereGeometry(0.27, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: palettes.azure.visor, emissiveIntensity: 0.7 })
    );
    this.visor.position.set(0, 1.55, -0.28);

    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 512;
    labelCanvas.height = 128;
    this.labelContext = labelCanvas.getContext('2d')!;
    this.labelTexture = new THREE.CanvasTexture(labelCanvas);

    const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.labelTexture, transparent: true, depthWrite: false }));
    label.scale.set(3.2, 0.8, 1);
    label.position.set(0, 2.45, 0);

    this.group.add(this.body, this.visor, label);
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
    const palette = palettes[state.avatarStyle] ?? palettes.navigator;
    (this.body.material as THREE.MeshStandardMaterial).color.setHex(palette.body);
    (this.visor.material as THREE.MeshStandardMaterial).emissive.setHex(palette.visor);
    this.drawName(state.displayName);
  }

  update(delta: number) {
    const blend = 1 - Math.exp(-12 * delta);
    this.group.position.lerp(this.target, blend);
    this.group.rotation.y = THREE.MathUtils.lerp(this.group.rotation.y, this.targetYaw, blend);
  }
}
