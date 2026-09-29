import * as THREE from 'three';
import { createStarterPBRMaterial } from '../engine/GridPBRLibrary';

export type TeamAvatarStyle = 'aurora' | 'link' | 'rey' | 'elder' | 'veyr' | 'nyxen' | 'orin' | 'seraith' | 'vael' | 'kairox' | 'morrow' | 'cipher' | 'solenne' | 'rook' | 'echo' | 'umbra' | 'civitas' | 'axiom' | 'mosaic' | 'sentinel' | 'praxis' | 'atlas' | 'tessera' | 'waypoint';

export interface TeamAvatarDefinition {
  id: string;
  displayName: string;
  role: string;
  style: TeamAvatarStyle;
  spawn: { x: number; y?: number; z: number };
  greeting: string;
  interaction: string;
  topics: string[];
  badge: 'TEAM';
}

const palettes: Record<TeamAvatarStyle, { body: number; visor: number; glow: number }> = {
  aurora: { body: 0x68d9ff, visor: 0x16465a, glow: 0x68d9ff },
  link: { body: 0x7aa7ff, visor: 0x1b2d66, glow: 0x4d7cff },
  rey: { body: 0xffb86b, visor: 0x66351b, glow: 0xffa34d },
  elder: { body: 0xc7b58a, visor: 0x3d3525, glow: 0xffdf9b },
  veyr: { body: 0xd9e3f0, visor: 0x263444, glow: 0xc8e5ff },
  nyxen: { body: 0xff4f8b, visor: 0x52152d, glow: 0xff3d7f },
  orin: { body: 0x8ce1d1, visor: 0x17473f, glow: 0x5ee6d0 },
  seraith: { body: 0xb78cff, visor: 0x38245c, glow: 0xa970ff },
  vael: { body: 0xb5c0cc, visor: 0x2b333d, glow: 0xa9bacb },
  kairox: { body: 0xffd05a, visor: 0x594611, glow: 0xffc233 },
  morrow: { body: 0x9caa82, visor: 0x35402a, glow: 0x93b56b },
  cipher: { body: 0x78a5b5, visor: 0x1c3139, glow: 0x58b8d5 },
  solenne: { body: 0xf0a8c7, visor: 0x57263e, glow: 0xff8fbc },
  rook: { body: 0xd3a46f, visor: 0x543b24, glow: 0xd99a52 },
  echo: { body: 0xff746d, visor: 0x57211e, glow: 0xff6258 },
  umbra: { body: 0x687080, visor: 0x151923, glow: 0x697cff },
  civitas: { body: 0x76a7c9, visor: 0x19364d, glow: 0x66c9ff },
  axiom: { body: 0x8ed8b0, visor: 0x1d4935, glow: 0x67f0a5 },
  mosaic: { body: 0xe1a6ff, visor: 0x4c285e, glow: 0xd18aff },
  sentinel: { body: 0xe7c98d, visor: 0x4b3d1e, glow: 0xffd66d },
  praxis: { body: 0xaeb8ff, visor: 0x2d3264, glow: 0x8d9bff },
  atlas: { body: 0x70c6e8, visor: 0x193b55, glow: 0x58d9ff },
  tessera: { body: 0xf0a56f, visor: 0x57321e, glow: 0xffa05c },
  waypoint: { body: 0x6ed19c, visor: 0x1e4936, glow: 0x70e6ae },
};

export class TeamAvatar {
  readonly group = new THREE.Group();
  private readonly body: THREE.Mesh;
  private readonly visor: THREE.Mesh;
  private readonly glow: THREE.PointLight;
  private readonly labelTexture: THREE.CanvasTexture;
  private readonly labelContext: CanvasRenderingContext2D;
  private phase = Math.random() * Math.PI * 2;

  constructor(readonly definition: TeamAvatarDefinition) {
    const palette = palettes[definition.style];
    this.body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.45, 0.9, 4, 8),
      createStarterPBRMaterial('fabric', { color: '#' + palette.body.toString(16).padStart(6,'0'), roughness: .62, metalness: .25 })
    );
    this.body.position.y = 1.05;
    this.body.castShadow = true;

    this.visor = new THREE.Mesh(
      new THREE.SphereGeometry(0.27, 16, 12),
      createStarterPBRMaterial('glass', { color: '#ffffff', emissive: '#' + palette.visor.toString(16).padStart(6,'0'), emissiveIntensity: .9, roughness: .16 })
    );
    this.visor.position.set(0, 1.55, -0.28);

    this.glow = new THREE.PointLight(palette.glow, 2.2, 5);
    this.glow.position.set(0, 1.7, 0);

    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 768;
    labelCanvas.height = 160;
    this.labelContext = labelCanvas.getContext('2d')!;
    this.labelTexture = new THREE.CanvasTexture(labelCanvas);
    const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.labelTexture, transparent: true, depthWrite: false }));
    label.scale.set(4.6, 0.96, 1);
    label.position.set(0, 2.55, 0);

    this.group.add(this.body, this.visor, this.glow, label);
    this.group.position.set(definition.spawn.x, definition.spawn.y ?? 0, definition.spawn.z);
    this.group.userData.interactable = true;
    this.group.userData.interactionName = definition.displayName;
    this.group.userData.teamAvatarId = definition.id;
    this.drawLabel();
  }

  private drawLabel() {
    const context = this.labelContext;
    context.clearRect(0, 0, 768, 160);
    context.fillStyle = 'rgba(5, 10, 20, 0.84)';
    context.roundRect(8, 16, 752, 128, 22);
    context.fill();
    context.font = 'bold 34px system-ui, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#68d9ff';
    context.fillText('TEAM', 384, 45);
    context.font = 'bold 42px system-ui, sans-serif';
    context.fillStyle = '#eef8ff';
    context.fillText(this.definition.displayName, 384, 88);
    context.font = '24px system-ui, sans-serif';
    context.fillStyle = 'rgba(238,248,255,.72)';
    context.fillText(this.definition.role, 384, 121);
    this.labelTexture.needsUpdate = true;
  }

  update(delta: number) {
    this.phase += delta;
    this.body.position.y = 1.05 + Math.sin(this.phase * 1.6) * 0.025;
    this.glow.intensity = 2.2 + Math.sin(this.phase * 2) * 0.45;
  }

  interact(topic?: string) {
    if (!topic) return this.definition.interaction;
    const normalized = topic.toLowerCase();
    const match = this.definition.topics.find(candidate => normalized.includes(candidate.toLowerCase()));
    return match ? `${this.definition.displayName}: ${this.definition.interaction}` : `${this.definition.displayName}: Ask me about ${this.definition.topics.join(', ')}.`;
  }
}
