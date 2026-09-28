import * as THREE from 'three';

export interface WorldChunkCoordinate {
  x: number;
  z: number;
}

export class WorldChunk {
  readonly group = new THREE.Group();
  readonly key: string;

  constructor(readonly coordinate: WorldChunkCoordinate, readonly size: number) {
    this.key = WorldChunk.keyOf(coordinate.x, coordinate.z);
    this.group.name = `world-chunk:${this.key}`;
    this.group.position.set(coordinate.x * size, 0, coordinate.z * size);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(size, size, 8, 8),
      new THREE.MeshStandardMaterial({ color: this.groundColor(coordinate.x, coordinate.z), roughness: 1 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.userData.worldChunk = this.key;
    this.group.add(ground);

    const grid = new THREE.GridHelper(size, Math.max(1, Math.floor(size / 4)), 0x52705a, 0x304638);
    grid.position.y = 0.02;
    grid.userData.worldChunk = this.key;
    this.group.add(grid);
  }

  static keyOf(x: number, z: number): string {
    return `${x},${z}`;
  }

  static fromWorld(x: number, z: number, size: number): WorldChunkCoordinate {
    return {
      x: Math.floor((x + size / 2) / size),
      z: Math.floor((z + size / 2) / size),
    };
  }

  private groundColor(x: number, z: number): number {
    const variation = Math.abs((x * 73856093) ^ (z * 19349663)) % 3;
    return [0x27382a, 0x2a3b2d, 0x25352a][variation];
  }

  dispose() {
    this.group.traverse(object => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) object.material.forEach(material => material.dispose());
        else object.material.dispose();
      }
    });
  }
}
