import * as THREE from 'three';
import { Input } from './Input';

export class PlayerController {
  readonly avatar = new THREE.Group();
  private velocityY = 0;
  private grounded = true;
  private yaw = 0;

  constructor(private readonly input: Input) {
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.42, 1, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0x8ad1ff, roughness: 0.55 })
    );
    body.position.y = 1;
    body.castShadow = true;
    this.avatar.add(body);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.34, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0xe8f5ff, roughness: 0.7 })
    );
    head.position.y = 1.85;
    head.castShadow = true;
    this.avatar.add(head);
  }

  update(dt: number) {
    const speed = this.input.isDown('ShiftLeft') ? 8 : 4;
    const forward = Number(this.input.isDown('KeyW')) - Number(this.input.isDown('KeyS'));
    const strafe = Number(this.input.isDown('KeyD')) - Number(this.input.isDown('KeyA'));
    const direction = new THREE.Vector3(strafe, 0, -forward);

    if (direction.lengthSq() > 0) {
      direction.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
      this.avatar.position.addScaledVector(direction, speed * dt);
    }

    if (this.input.isDown('Space') && this.grounded) {
      this.velocityY = 7;
      this.grounded = false;
    }

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
}
