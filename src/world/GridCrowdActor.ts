import * as THREE from 'three';
import { GridNpcBrain, type GridNpcPersonality } from '../npc/GridNpcBrain';

export type GridActorKind = 'npc' | 'animal' | 'user-test';

export interface GridActorDefinition {
  id: string;
  displayName: string;
  kind: GridActorKind;
  role: string;
  color: number;
  accent: number;
  spawn: { x: number; y?: number; z: number };
  speed?: number;
  chatLines?: readonly string[];
  personality?: Partial<GridNpcPersonality>;
}

export class GridCrowdActor {
  readonly group = new THREE.Group();
  private readonly body: THREE.Mesh;
  private readonly head: THREE.Mesh;
  private readonly accent: THREE.Mesh;
  private readonly glow: THREE.PointLight;
  private readonly label: THREE.Sprite;
  private phase = 0;
  private target = new THREE.Vector3();
  private targetTimer = 0;
  readonly brain: GridNpcBrain;

  constructor(readonly definition: GridActorDefinition) {
    this.brain = new GridNpcBrain(definition.id, definition.displayName, definition.personality);
    const { color, accent } = definition;
    const isAnimal = definition.kind === 'animal';

    this.body = new THREE.Mesh(
      isAnimal ? new THREE.CapsuleGeometry(.32, .65, 4, 8) : new THREE.CapsuleGeometry(.38, .78, 4, 8),
      new THREE.MeshStandardMaterial({ color, roughness: .66, metalness: isAnimal ? .05 : .24 }),
    );
    this.body.position.y = isAnimal ? .62 : .92;
    this.body.castShadow = true;

    this.head = new THREE.Mesh(
      isAnimal ? new THREE.SphereGeometry(.34, 12, 8) : new THREE.SphereGeometry(.29, 14, 10),
      new THREE.MeshStandardMaterial({ color: 0xd7c4b2, roughness: .78 }),
    );
    this.head.position.set(0, isAnimal ? 1.16 : 1.48, isAnimal ? -.28 : -.2);
    this.head.castShadow = true;

    this.accent = new THREE.Mesh(
      isAnimal ? new THREE.TorusGeometry(.18, .045, 6, 16) : new THREE.BoxGeometry(.18, .42, .05),
      new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: .65, metalness: .55, roughness: .28 }),
    );
    this.accent.position.set(0, isAnimal ? 1.16 : 1.22, -.42);

    this.glow = new THREE.PointLight(accent, .8, 3.5);
    this.glow.position.set(0, 1.3, 0);

    this.label = this.createLabel();
    this.label.position.set(0, isAnimal ? 2.0 : 2.45, 0);
    this.label.scale.set(2.8, .58, 1);

    this.group.add(this.body, this.head, this.accent, this.glow, this.label);
    this.group.position.set(definition.spawn.x, definition.spawn.y ?? 0, definition.spawn.z);
    this.group.userData.interactable = true;
    this.group.userData.interactionName = definition.displayName;
    this.group.userData.gridActorId = definition.id;
    this.group.userData.gridActorKind = definition.kind;
    this.group.userData.gridNpcBrain = this.brain;
    this.target.copy(this.group.position);
  }

  private createLabel() {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 128;
    const context = canvas.getContext('2d')!;
    context.fillStyle = 'rgba(4,9,16,.82)';
    context.roundRect(5, 5, 630, 118, 16);
    context.fill();
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = 'bold 30px system-ui';
    context.fillStyle = '#72e8ef';
    context.fillText(this.definition.kind === 'animal' ? 'WILDLIFE' : this.definition.kind === 'npc' ? 'NPC' : 'TEST AVATAR', 320, 37);
    context.font = 'bold 34px system-ui';
    context.fillStyle = '#eef8ff';
    context.fillText(this.definition.displayName, 320, 76);
    context.font = '20px system-ui';
    context.fillStyle = 'rgba(238,248,255,.68)';
    context.fillText(this.definition.role, 320, 105);
    return new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(canvas),
      transparent: true,
      depthWrite: false,
    }));
  }

  update(delta: number) {
    this.phase += delta;
    this.targetTimer -= delta;
    if (this.targetTimer <= 0) {
      this.targetTimer = 3 + Math.random() * 5;
      this.target.set(
        this.definition.spawn.x + (Math.random() - .5) * 8,
        this.group.position.y,
        this.definition.spawn.z + (Math.random() - .5) * 8,
      );
    }

    this.brain.update(delta, { isDaytime: true, safe: true, hasWork: this.definition.kind === 'npc', hasFood: true });
    const action = this.brain.state.currentAction;
    const speed = (this.definition.speed ?? .55) * (action === 'rest' ? .15 : action === 'work' ? 1 : action === 'explore' ? 1.2 : .75);
    const dx = this.target.x - this.group.position.x;
    const dz = this.target.z - this.group.position.z;
    const distance = Math.hypot(dx, dz);
    if (distance > .35) {
      const step = Math.min(distance, speed * delta);
      this.group.position.x += dx / distance * step;
      this.group.position.z += dz / distance * step;
      this.group.rotation.y = Math.atan2(dx, dz);
    }

    const bob = Math.sin(this.phase * 2.2 + this.definition.id.length) * .025;
    this.body.position.y = (this.definition.kind === 'animal' ? .62 : .92) + bob;
    this.head.position.y = (this.definition.kind === 'animal' ? 1.16 : 1.48) + bob;
    this.glow.intensity = .75 + Math.sin(this.phase * 2) * .18;
  }
}
