import * as THREE from 'three';

export interface StarterZoneDefinition {
  id: string;
  name: string;
  spawn: THREE.Vector3;
  welcome: string;
}

export const FIRST_LIGHT_STARTER_ZONE: StarterZoneDefinition = {
  id: 'starter:first-light',
  name: 'First Light',
  spawn: new THREE.Vector3(0, 0, 8),
  welcome: 'Your personal starting place. Learn the Grid, meet your first guides, and begin building.',
};

export class StarterZone {
  readonly definition = FIRST_LIGHT_STARTER_ZONE;
  readonly group = new THREE.Group();
  private welcomeBeacon: THREE.Mesh;

  constructor() {
    this.group.name = 'StarterZone:FirstLight';
    const ground = new THREE.Mesh(
      new THREE.CylinderGeometry(9, 11, 0.35, 32),
      new THREE.MeshStandardMaterial({ color: 0x263743, roughness: 0.85 }),
    );
    ground.position.set(0, -0.2, 8);
    this.group.add(ground);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(9, 0.06, 10, 64),
      new THREE.MeshStandardMaterial({ color: 0x9bc9ad, emissive: 0x335544, emissiveIntensity: 1.2 }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, 0.02, 8);
    this.group.add(ring);
    const beacon = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.7, 1),
      new THREE.MeshStandardMaterial({ color: 0xdce9f2, emissive: 0x668899, emissiveIntensity: 2 }),
    );
    beacon.position.set(0, 2, -1);
    this.group.add(beacon);
    this.welcomeBeacon = beacon;
  }

  pulse(time: number) {
    this.welcomeBeacon.rotation.y = time * 0.4;
    this.welcomeBeacon.position.y = 2 + Math.sin(time * 2) * 0.15;
  }
}