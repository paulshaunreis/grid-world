import * as THREE from 'three';

export class World {
  readonly scene = new THREE.Scene();
  readonly neonDoor = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 4.2, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x17243b, emissive: 0x1a6a9a, emissiveIntensity: 0.9, metalness: 0.7, roughness: 0.3 })
  );

  constructor() {
    this.scene.background = new THREE.Color(0x07111f);
    this.scene.fog = new THREE.Fog(0x07111f, 45, 180);

    const hemisphere = new THREE.HemisphereLight(0x9fc9ff, 0x182015, 1.8);
    this.scene.add(hemisphere);

    const sun = new THREE.DirectionalLight(0xffe2b0, 3);
    sun.position.set(-30, 50, 20);
    sun.castShadow = true;
    this.scene.add(sun);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(220, 220, 40, 40),
      new THREE.MeshStandardMaterial({ color: 0x27382a, roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const grid = new THREE.GridHelper(220, 44, 0x52705a, 0x304638);
    grid.position.y = 0.02;
    this.scene.add(grid);

    this.createLandmark();
    this.createBeacon();
    this.createNeonDoor();
    this.createTrees();
  }

  private createLandmark() {
    const landmark = new THREE.Mesh(
      new THREE.BoxGeometry(5, 6, 5),
      new THREE.MeshStandardMaterial({ color: 0x35495e, roughness: 0.7 })
    );
    landmark.position.set(0, 3, -22);
    landmark.castShadow = true;
    landmark.userData.interactable = true;
    landmark.userData.interactionName = 'Central Landmark';
    this.scene.add(landmark);
  }

  private createBeacon() {
    const beacon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.9, 2.4, 16),
      new THREE.MeshStandardMaterial({
        color: 0x68d9ff,
        emissive: 0x16465a,
        emissiveIntensity: 1.5
      })
    );
    beacon.position.set(0, 1.2, -7);
    beacon.castShadow = true;
    beacon.userData.interactable = true;
    beacon.userData.interactionName = 'World Beacon';
    this.scene.add(beacon);

    const glow = new THREE.PointLight(0x68d9ff, 8, 12);
    glow.position.set(0, 2.2, -7);
    this.scene.add(glow);
  }


  private createNeonDoor() {
    this.neonDoor.position.set(0, 2.1, -14);
    this.neonDoor.castShadow = true;
    this.neonDoor.userData.interactable = true;
    this.neonDoor.userData.interactionName = 'Neon Door · Grid Script';
    this.scene.add(this.neonDoor);

    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 5.2, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x0a1220, emissive: 0x083c5a, emissiveIntensity: 0.6, metalness: 0.8, roughness: 0.25 })
    );
    frame.position.set(0, 2.6, -14.25);
    this.scene.add(frame);
  }

  private createTrees() {
    const positions = [[-8,-8],[8,-10],[-12,5],[13,7],[4,-18],[-20,-2],[20,-4],[10,18],[-10,17]];
    for (const [x, z] of positions) {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.25, 2, 8),
        new THREE.MeshStandardMaterial({ color: 0x5b3b24 })
      );
      trunk.position.y = 1;
      trunk.castShadow = true;
      tree.add(trunk);

      const crown = new THREE.Mesh(
        new THREE.SphereGeometry(1.15, 10, 8),
        new THREE.MeshStandardMaterial({ color: 0x3f7a4a })
      );
      crown.position.y = 2.35;
      crown.castShadow = true;
      tree.add(crown);
      tree.position.set(x, 0, z);
      this.scene.add(tree);
    }
  }
}
