import * as THREE from 'three';
import { Input } from './Input';
import { createStarterPBRMaterial } from '../engine/GridPBRLibrary';
import type { AvatarCustomization } from '../ui/GridAvatarCreator';

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
  private readonly hair: THREE.Mesh;
  private readonly eyeL: THREE.Mesh;
  private readonly eyeR: THREE.Mesh;

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

    this.hair = new THREE.Mesh(
      new THREE.SphereGeometry(.36, 16, 10, 0, Math.PI * 2, 0, Math.PI * .58),
      createStarterPBRMaterial('fabric', { color: '#171a24', roughness: .52 })
    );
    this.hair.position.y = 1.98;
    this.hair.castShadow = true;
    this.avatar.add(this.hair);

    const eyeMaterial = createStarterPBRMaterial('metal', { color: '#58d7ff', emissive: '#58d7ff', emissiveIntensity: 1.5, roughness: .28 });
    this.eyeL = new THREE.Mesh(new THREE.SphereGeometry(.035, 10, 8), eyeMaterial);
    this.eyeR = this.eyeL.clone();
    this.eyeL.position.set(-.12, 1.87, .315);
    this.eyeR.position.set(.12, 1.87, .315);
    this.avatar.add(this.eyeL, this.eyeR);
  }

  setAvatarAppearance(style: AvatarStyle, customization?: AvatarCustomization) {
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
    if (customization) {
      const skins=[0xf1d1bd,0xd9aa8a,0xb97858,0x8d583f,0x5f392e];
      const hairs=[0x171a24,0x4a2b22,0x9b6a3b,0xb9d5dc,0x8b4fa5,0xe0e4e8];
      const eyes=[0x58d7ff,0x6d8cff,0x63d88d,0xd4ad63,0xd47fd8,0xe7e7e7];
      (this.head.material as THREE.MeshStandardMaterial).color.setHex(skins[Math.max(0,Math.min(4,customization.skin))]);
      (this.hair.material as THREE.MeshStandardMaterial).color.setHex(hairs[Math.max(0,Math.min(5,customization.hair))]);
      const eyeColor=eyes[Math.max(0,Math.min(5,customization.eyes))];
      (this.eyeL.material as THREE.MeshStandardMaterial).color.setHex(eyeColor);
      (this.eyeL.material as THREE.MeshStandardMaterial).emissive.setHex(eyeColor);
      (this.eyeR.material as THREE.MeshStandardMaterial).color.setHex(eyeColor);
      (this.eyeR.material as THREE.MeshStandardMaterial).emissive.setHex(eyeColor);
      const build=1+Math.max(-3,Math.min(3,customization.build))*.045;
      this.body.scale.set(build,1,build);
    }
  }

  setAvatarStyle(style: AvatarStyle) { this.setAvatarAppearance(style); }

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
  setHeading(yaw: number) { this.yaw = yaw; this.avatar.rotation.y = this.yaw; }

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
