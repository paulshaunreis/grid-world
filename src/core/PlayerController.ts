import * as THREE from 'three';
import { Input } from './Input';
import { createStarterPBRMaterial } from '../engine/GridPBRLibrary';

export type AvatarStyle = 'navigator' | 'muse' | 'explorer' | 'builder' | 'scholar' | 'sentinel' | 'wanderer' | 'artist' | 'ranger' | 'architect' | 'guardian' | 'signal';

export interface PlayerTransform {
  x: number;
  y: number;
  z: number;
  yaw: number;
}

export class PlayerController {
  readonly avatar = new THREE.Group();
  private velocityY = 0;
  private grounded = true;
  private yaw = 0;
  private readonly body: THREE.Mesh;
  private readonly head: THREE.Mesh;

  constructor(private readonly input: Input) {
    this.body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.42, 1, 8, 16),
      createStarterPBRMaterial('fabric', { color: '#8ad1ff', roughness: .62 })
    );
    this.body.position.y = 1;
    this.body.castShadow = true;
    this.avatar.add(this.body);

    this.head = new THREE.Mesh(
      new THREE.SphereGeometry(0.34, 16, 12),
      createStarterPBRMaterial('skin', { color: '#e8d0bd', roughness: .72 })
    );
    this.head.position.y = 1.85;
    this.head.castShadow = true;
    this.avatar.add(this.head);
  }

  setAvatarStyle(style: AvatarStyle) {
    const palettes = {
      navigator: { body: 0x5fd8ff, head: 0xe6f7ff },
      muse: { body: 0xd58cff, head: 0xffe8fa },
      explorer: { body: 0xffad62, head: 0xffe0c7 },
      builder: { body: 0xb18a62, head: 0xf1d7bc },
      scholar: { body: 0x9aaee8, head: 0xe4eaff },
      sentinel: { body: 0xd5c47c, head: 0xf4e8ca },
      wanderer: { body: 0x79c98b, head: 0xdff6e6 },
      artist: { body: 0xef76b4, head: 0xffd8ea },
      ranger: { body: 0x719c66, head: 0xe0f0d8 },
      architect: { body: 0x78a5bd, head: 0xe3f2f7 },
      guardian: { body: 0x7182c8, head: 0xe2e7ff },
      signal: { body: 0x65e6c8, head: 0xdffff7 },
    };
    const palette = palettes[style];
    (this.body.material as THREE.MeshStandardMaterial).color.setHex(palette.body);
    (this.head.material as THREE.MeshStandardMaterial).color.setHex(palette.head);
  }

  update(dt: number) {
    const speed = this.input.isDown('ShiftLeft') || this.input.isDown('ShiftRight') ? 8 : 4;
    const forward = Number(this.input.isDown('KeyW')) - Number(this.input.isDown('KeyS'));
    const strafe = Number(this.input.isDown('KeyD')) - Number(this.input.isDown('KeyA'));
    const direction = new THREE.Vector3(strafe, 0, -forward);

    if (direction.lengthSq() > 0) direction.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw), this.avatar.position.addScaledVector(direction, speed * dt);

    if (this.input.isDown('Space') && this.grounded) { this.velocityY = 7; this.grounded = false; }
    this.velocityY -= 18 * dt;
    this.avatar.position.y += this.velocityY * dt;

    if (this.avatar.position.y <= 0) {
      this.avatar.position.y = 0;
      this.velocityY = 0;
      this.grounded = true;
    }

    this.avatar.rotation.y = this.yaw;
  }

  rotate(deltaX: number) { this.yaw -= deltaX * 0.0025; }
  get heading() { return this.yaw; }

  getTransform(): PlayerTransform {
    return { x: this.avatar.position.x, y: this.avatar.position.y, z: this.avatar.position.z, yaw: this.yaw };
  }

  restoreTransform(transform: PlayerTransform) {
    this.avatar.position.set(transform.x, Math.max(0, transform.y), transform.z);
    this.yaw = transform.yaw;
    this.avatar.rotation.y = this.yaw;
    this.velocityY = 0;
    this.grounded = this.avatar.position.y === 0;
  }
}
