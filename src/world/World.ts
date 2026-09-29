import * as THREE from 'three';
import { FIRST_LIGHT_REGION, WorldRegionRegistry } from './WorldRegion';
import { GRID_WORLD_DEFINITION, type WorldDefinition } from './WorldDefinition';
import { WorldClock } from './WorldClock';
import { WorldSimulation } from './WorldSimulation';
import { WorldAtmosphere } from './WorldAtmosphere';
import { WorldChunkStreamer } from './WorldChunkStreamer';

export class World {
  readonly definition: WorldDefinition;
  readonly clock = new WorldClock();
  readonly simulation = new WorldSimulation();
  readonly scene = new THREE.Scene();
  readonly regions = new WorldRegionRegistry();
  readonly atmosphere = new WorldAtmosphere();
  readonly chunks: WorldChunkStreamer;
  private simulationAccumulator = 0;
  readonly neonDoor = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 4.2, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x17243b, emissive: 0x1a6a9a, emissiveIntensity: 0.9, metalness: 0.7, roughness: 0.3 })
  );

  constructor(definition: WorldDefinition = GRID_WORLD_DEFINITION) {
    this.definition = definition;
    this.regions.register(FIRST_LIGHT_REGION);
    this.chunks = new WorldChunkStreamer(this.scene, {
      chunkSize: 32,
      loadRadius: 2,
      resolveRegionId: (worldX, worldZ) => this.regions.findAt(worldX, worldZ)?.definition.id ?? 'unclaimed',
      hydrateState: state => {
        const region = this.regions.get(state.regionId);
        if (!region) return state;
        const lastSimulatedMs = Date.parse(state.lastSimulatedAt);
        if (!Number.isFinite(lastSimulatedMs)) return state;
        const elapsedSeconds = Math.max(0, (Date.now() - lastSimulatedMs) / 1000);
        return this.simulation.simulateChunk(state, region, elapsedSeconds, this.clock.getWorldSeconds());
      },
    });
    this.chunks.update(0, 0);

    this.scene.background = new THREE.Color(0x07111f);
    this.scene.fog = new THREE.Fog(0x07111f, 45, 180);

    const hemisphere = new THREE.HemisphereLight(0x9fc9ff, 0x182015, 1.8);
    this.scene.add(hemisphere);

    const sun = new THREE.DirectionalLight(0xffe2b0, 3);
    sun.position.set(-30, 50, 20);
    sun.castShadow = true;
    this.scene.add(sun);

    this.createFirstLightDistricts();
    this.createLandmark();
    this.createBeacon();
    this.createNeonDoor();
    this.createTrees();
  }

  updateStreaming(worldX: number, worldZ: number) {
    this.chunks.update(worldX, worldZ);
  }

  update(realTimeMs = Date.now()) {
    const deltaSeconds = this.clock.update(realTimeMs);
    this.simulationAccumulator += deltaSeconds;
    if (this.simulationAccumulator < 1) return;
    const simulationDelta = Math.min(this.simulationAccumulator, 10);
    this.simulationAccumulator = 0;

    for (const region of this.regions.all()) {
      this.atmosphere.set(region.definition.id, this.simulation.conditionsFor(region, this.clock.worldSeconds));
    }

    for (const state of this.chunks.getLoadedStates()) {
      const region = this.regions.get(state.regionId);
      if (!region) continue;
      const updated = this.simulation.simulateChunk(state, region, simulationDelta, this.clock.worldSeconds);
      if (updated !== state) {
        this.chunks.setState(updated);
      }
    }
  }

  private createFirstLightDistricts() {
    const districts = [
      { id: 'civic', name: 'Civic Ring', x: 0, z: 10, width: 28, depth: 18, color: 0x263b4d },
      { id: 'market', name: 'Market Walk', x: -17, z: -3, width: 18, depth: 30, color: 0x4a3940 },
      { id: 'creator', name: 'Creator Yard', x: 17, z: -3, width: 18, depth: 30, color: 0x354a42 },
      { id: 'gallery', name: 'Gallery Row', x: -17, z: -26, width: 18, depth: 18, color: 0x3d3b55 },
      { id: 'wilds', name: 'Living Wilds', x: 17, z: -26, width: 18, depth: 18, color: 0x304b3a },
    ];

    for (const district of districts) {
      const pad = new THREE.Mesh(
        new THREE.BoxGeometry(district.width, .3, district.depth),
        new THREE.MeshStandardMaterial({ color: district.color, roughness: .9 }),
      );
      pad.position.set(district.x, -.15, district.z);
      pad.receiveShadow = true;
      pad.userData.gridObjectId = 'district.' + district.id;
      pad.userData.interactable = true;
      pad.userData.interactionName = district.name;
      this.scene.add(pad);

      const spine = new THREE.Mesh(
        new THREE.BoxGeometry(.32, 3.5, district.depth * .72),
        new THREE.MeshStandardMaterial({ color: 0x15212e, metalness: .7, roughness: .32, emissive: 0x12374a, emissiveIntensity: .35 }),
      );
      spine.position.set(district.x, 1.75, district.z);
      this.scene.add(spine);

      const sign = this.createDistrictSign(district.name, district.x, district.z - district.depth / 2 + 1);
      this.scene.add(sign);

      this.createBlockBuildings(district.x, district.z, district.width, district.depth, district.color);
    }

    this.createBridge(-17, -17, 17, -17);
    this.createBridge(-17, 4, 17, 4);
  }

  private createDistrictSign(name: string, x: number, z: number) {
    const group = new THREE.Group();
    const post = new THREE.Mesh(
      new THREE.BoxGeometry(.08, 2.2, .08),
      new THREE.MeshStandardMaterial({ color: 0x7d8b98, metalness: .8, roughness: .25 }),
    );
    post.position.y = 1.1;
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(4.8, 1.05, .12),
      new THREE.MeshStandardMaterial({ color: 0x0c1825, emissive: 0x16465a, emissiveIntensity: .5, metalness: .7, roughness: .3 }),
    );
    board.position.y = 2.05;
    const canvas = document.createElement('canvas');
    canvas.width = 768; canvas.height = 160;
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#07111f';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#68d9ff';
    context.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
    context.font = 'bold 38px system-ui';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#eefcff';
    context.fillText(name.toUpperCase(), canvas.width / 2, canvas.height / 2);
    const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, depthWrite: false }));
    label.scale.set(4.6, .96, 1);
    label.position.set(0, 2.06, -.1);
    group.add(post, board, label);
    group.position.set(x, 0, z);
    return group;
  }

  private createBlockBuildings(cx: number, cz: number, width: number, depth: number, color: number) {
    const placements = [
      [-width / 2 + 3, -depth / 2 + 3, 4, 4, 4],
      [width / 2 - 3, -depth / 2 + 3, 4, 5, 5],
      [-width / 2 + 3, depth / 2 - 3, 5, 6, 4],
      [width / 2 - 3, depth / 2 - 3, 4, 4, 5],
    ] as const;

    for (let index = 0; index < placements.length; index++) {
      const [x, z, w, h, d] = placements[index];
      const building = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({ color, roughness: .58, metalness: .18 }),
      );
      building.position.set(cx + x, h / 2, cz + z);
      building.castShadow = true;
      building.receiveShadow = true;
      building.userData.gridObjectId = `building.${Math.round(cx)}.${Math.round(cz)}.${index}`;
      building.userData.interactable = true;
      building.userData.interactionName = `Placeholder Building ${index + 1}`;
      this.scene.add(building);

      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(w + .3, .18, d + .3),
        new THREE.MeshStandardMaterial({ color: 0x111b26, metalness: .72, roughness: .25 }),
      );
      roof.position.set(cx + x, h + .1, cz + z);
      this.scene.add(roof);

      for (let floor = 1; floor < h; floor += 2) {
        const window = new THREE.Mesh(
          new THREE.BoxGeometry(Math.max(.7, w - .8), .22, .06),
          new THREE.MeshStandardMaterial({ color: 0x91e7f2, emissive: 0x2d7180, emissiveIntensity: .6 }),
        );
        window.position.set(cx + x, floor, cz + z - d / 2 - .04);
        this.scene.add(window);
      }
    }
  }

  private createBridge(x1: number, z1: number, x2: number, z2: number) {
    const length = Math.hypot(x2 - x1, z2 - z1);
    const bridge = new THREE.Mesh(
      new THREE.BoxGeometry(length, .45, 2.8),
      new THREE.MeshStandardMaterial({ color: 0x657987, metalness: .62, roughness: .35 }),
    );
    bridge.position.set((x1 + x2) / 2, 2.5, (z1 + z2) / 2);
    bridge.rotation.y = Math.atan2(z2 - z1, x2 - x1);
    bridge.castShadow = true;
    this.scene.add(bridge);
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
      new THREE.MeshStandardMaterial({ color: 0x68d9ff, emissive: 0x16465a, emissiveIntensity: 1.5 })
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
