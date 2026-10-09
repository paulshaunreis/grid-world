import * as THREE from 'three';
import { FIRST_LIGHT_REGION, WorldRegionRegistry } from './WorldRegion';
import { GRID_WORLD_DEFINITION, type WorldDefinition } from './WorldDefinition';
import { WorldClock } from './WorldClock';
import { WorldSimulation } from './WorldSimulation';
import { WorldAtmosphere } from './WorldAtmosphere';
import { WorldChunkStreamer } from './WorldChunkStreamer';
import { createStarterPBRMaterial, createTexturedPBRMaterial } from '../engine/GridPBRLibrary';

export class World {
  readonly definition: WorldDefinition;
  readonly clock = new WorldClock();
  readonly simulation = new WorldSimulation();
  readonly scene = new THREE.Scene();
  readonly regions = new WorldRegionRegistry();
  readonly atmosphere = new WorldAtmosphere();
  readonly chunks: WorldChunkStreamer;
  private simulationAccumulator = 0;
  private showcaseTime = 0;
  private readonly showcaseActors: Array<{ group: THREE.Group; phase: number; radius: number; height: number; speed: number; centerX: number; centerZ: number }> = [];
  private readonly weatherParticles = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ color: 0x7ddcff, size: 0.045, transparent: true, opacity: 0.32, depthWrite: false }));
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

    this.createTerrain();
    this.createFirstLightDistricts();
    this.createLandmark();
    this.createBeacon();
    this.createNeonDoor();
    this.createTrees();
    this.createFirstLightShowcase();
  }

  updateStreaming(worldX: number, worldZ: number) {
    this.chunks.update(worldX, worldZ);
  }

  update(realTimeMs = Date.now()) {
    const deltaSeconds = this.clock.update(realTimeMs);
    this.showcaseTime += deltaSeconds;
    this.updateShowcaseLife(deltaSeconds);
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


  private createFirstLightShowcase() {
    const plaza = new THREE.Mesh(new THREE.CylinderGeometry(13, 15, .45, 64), createTexturedPBRMaterial('tex-ground-metal-deck.webp', { metalness: .6, roughness: .4, repeat: 6 }));
    plaza.position.set(0, .05, 8); plaza.receiveShadow = true; this.scene.add(plaza);
    const plazaRing = new THREE.Mesh(new THREE.TorusGeometry(12.2, .12, 8, 96), new THREE.MeshStandardMaterial({ color: 0x68d9ff, emissive: 0x167b9b, emissiveIntensity: 1.8, metalness: .55, roughness: .22 }));
    plazaRing.rotation.x = Math.PI / 2; plazaRing.position.set(0, .35, 8); this.scene.add(plazaRing);

    const worlds = [
      ['FIRST LIGHT', 0x68d9ff, 'ENTRY'], ['LIVING WILDS', 0x65e38a, 'ECOLOGY'], ['CIVIC', 0xf3bf70, 'CITY'],
      ['FRONTIER', 0xd78cff, 'EXPLORATION'], ['MIRROR', 0x83b5ff, 'REFLECTION'], ['VERDANT', 0x73d5bd, 'GARDEN'],
      ['NEON RAIN', 0xff71c8, 'SIGNAL'], ['SKYFORGE', 0xff9b64, 'CREATION'], ['DEEP GRID', 0x7c9cff, 'FOUNDATION'],
    ] as const;
    const gateRadius = 30;
    worlds.forEach(([name, color, tag], index) => {
      const angle = (index / worlds.length) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * gateRadius, z = Math.sin(angle) * gateRadius + 2;
      const route = new THREE.Mesh(new THREE.BoxGeometry(1.05, .06, gateRadius - 15), new THREE.MeshStandardMaterial({ color: 0x102231, emissive: color, emissiveIntensity: .16, metalness: .7, roughness: .34 }));
      route.position.set(x / 2, .16, 8 + (z - 8) / 2); route.rotation.y = angle; this.scene.add(route);

      const gate = new THREE.Group();
      const frame = new THREE.Mesh(new THREE.TorusGeometry(2.5, .26, 12, 48), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 2.2, metalness: .45, roughness: .2 }));
      frame.rotation.y = Math.PI / 2;
      const inner = new THREE.Mesh(new THREE.CircleGeometry(2.15, 48), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .13, side: THREE.DoubleSide }));
      inner.rotation.y = Math.PI / 2; gate.add(frame, inner);
      const crown = new THREE.Mesh(new THREE.OctahedronGeometry(.7, 1), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 2.6, metalness: .55, roughness: .2 }));
      crown.position.y = 3.45; gate.add(crown);
      const pillarMaterial = new THREE.MeshStandardMaterial({ color: 0x142536, emissive: color, emissiveIntensity: .45, metalness: .78, roughness: .24 });
      const pillarA = new THREE.Mesh(new THREE.CylinderGeometry(.22, .34, 4.8, 10), pillarMaterial);
      const pillarB = pillarA.clone(); pillarA.position.set(-2.75, 2.1, 0); pillarB.position.set(2.75, 2.1, 0); gate.add(pillarA, pillarB);
      gate.position.set(x, .25, z); gate.rotation.y = -angle;
      gate.userData.gridObjectId = `world-gate.${index + 1}`; gate.userData.interactable = true; gate.userData.interactionName = `${name} · ${tag} World`;
      this.scene.add(gate);
      const label = this.createFloatingLabel(`${String(index + 1).padStart(2, '0')} · ${name}`, color); label.position.set(x, 5.25, z); this.scene.add(label);
      const orb = new THREE.Mesh(new THREE.SphereGeometry(.55, 16, 12), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 2.8, transparent: true, opacity: .9 }));
      orb.position.set(x, 7 + (index % 3) * .6, z); this.scene.add(orb);
      this.showcaseActors.push({ group: gate, phase: index * .72, radius: .18, height: .12, speed: .7 + index * .025, centerX: x, centerZ: z });
    });

    const lens = new THREE.Group();
    const outer = new THREE.Mesh(new THREE.TorusGeometry(7.2, .32, 16, 96), new THREE.MeshStandardMaterial({ color: 0x6fe9ff, emissive: 0x1598c0, emissiveIntensity: 2.4, metalness: .65, roughness: .2 }));
    outer.rotation.x = Math.PI / 2;
    const inner = new THREE.Mesh(new THREE.CircleGeometry(6.55, 64), new THREE.MeshBasicMaterial({ color: 0x102e40, transparent: true, opacity: .38, side: THREE.DoubleSide }));
    inner.rotation.x = Math.PI / 2; lens.add(outer, inner); lens.position.set(0, 6.8, 8);
    lens.userData.gridObjectId = 'first-light.transit-lens'; lens.userData.interactable = true; lens.userData.interactionName = 'Omni Transit Lens · Select Destination'; this.scene.add(lens);
    for (let i = 0; i < 4; i++) { const arc = new THREE.Mesh(new THREE.TorusGeometry(8.2 + i * .65, .045, 6, 64), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xb77cff : 0x68d9ff, transparent: true, opacity: .38 })); arc.rotation.x = Math.PI / 2; arc.position.set(0, 7.1 + i * .18, 8); this.scene.add(arc); }

    const primitiveTypes: Array<'box' | 'sphere' | 'cylinder' | 'cone' | 'torus'> = ['box', 'sphere', 'cylinder', 'cone', 'torus'];
    primitiveTypes.forEach((type, i) => {
      const x = 11 + i * 3;
      const material = new THREE.MeshStandardMaterial({ color: 0x6d8fa2, emissive: 0x102c3d, emissiveIntensity: .5, metalness: .45, roughness: .34 });
      let mesh: THREE.Mesh;
      if (type === 'box') mesh = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 1.8), material);
      else if (type === 'sphere') mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), material);
      else if (type === 'cylinder') mesh = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1.9, 20), material);
      else if (type === 'cone') mesh = new THREE.Mesh(new THREE.ConeGeometry(1.05, 2.0, 20), material);
      else mesh = new THREE.Mesh(new THREE.TorusGeometry(.82, .26, 10, 28), material);
      mesh.position.set(x, 1.15, -2); mesh.castShadow = true; mesh.userData.gridObjectId = `build-primitive.${type}`; mesh.userData.interactable = true; mesh.userData.interactionName = `Build Primitive · ${type.toUpperCase()}`; this.scene.add(mesh);
      const label = this.createFloatingLabel(type.toUpperCase(), 0x9bdff2); label.position.set(x, 2.65, -2); label.scale.set(.8, .8, 1); this.scene.add(label);
    });

    const flora = [[-27,-2,0x4f8b5d],[-23,8,0x6fbf6b],[-20,18,0x5aa37d],[22,17,0x76c66d],[26,5,0x5b9b68],[24,-12,0x83b96d],[-25,-18,0x6ba77c],[-14,24,0x4e9d75]] as const;
    flora.forEach(([x,z,color],i) => {
      const plant = new THREE.Group();
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(.07,.13,1.3+(i%3)*.25,7), new THREE.MeshStandardMaterial({ color:0x4a6f42, roughness:.95 })); stem.position.y=.65; plant.add(stem);
      for(let leaf=0;leaf<5;leaf++){const blade=new THREE.Mesh(new THREE.CapsuleGeometry(.13,.65,3,6),new THREE.MeshStandardMaterial({color,roughness:.92}));blade.position.set(Math.cos(leaf*1.256)*.28,1.15+(leaf%2)*.15,Math.sin(leaf*1.256)*.28);blade.rotation.z=Math.sin(leaf*1.256)*.42;plant.add(blade);}
      plant.position.set(x,0,z); this.scene.add(plant);
    });
    for(let i=0;i<18;i++){const angle=i*2.399,radius=18+(i%5)*3;const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(.22+(i%3)*.12,0),new THREE.MeshStandardMaterial({color:i%2?0x68d9ff:0xb77cff,emissive:i%2?0x1a8fb0:0x5a2b8d,emissiveIntensity:1.7,metalness:.3,roughness:.18}));crystal.position.set(Math.cos(angle)*radius,.35+(i%2)*.15,Math.sin(angle)*radius);crystal.rotation.set(.2,angle,.35);this.scene.add(crystal);}

    for(let i=0;i<10;i++){
      const creature=new THREE.Group();
      const body=new THREE.Mesh(new THREE.SphereGeometry(.48,12,8),new THREE.MeshStandardMaterial({color:i%2?0x6c89a6:0x8b6caa,emissive:i%2?0x19334d:0x36204e,emissiveIntensity:.75,roughness:.5}));body.scale.set(1.25,.72,1);
      const eye=new THREE.Mesh(new THREE.SphereGeometry(.1,8,6),new THREE.MeshBasicMaterial({color:0xbaf5ff}));eye.position.set(0,.12,-.45);creature.add(body,eye);
      for(const side of [-1,1]){const wing=new THREE.Mesh(new THREE.CapsuleGeometry(.08,.55,3,6),new THREE.MeshStandardMaterial({color:0x79d6ff,emissive:0x164d65,emissiveIntensity:.8}));wing.position.set(side*.55,.08,0);wing.rotation.z=side*.65;creature.add(wing);}
      const angle=i*2.7,radius=8+(i%4)*4;creature.position.set(Math.cos(angle)*radius,3+(i%3)*.7,8+Math.sin(angle)*radius);creature.userData.gridObjectId=`creature.first-light.${i}`;creature.userData.interactable=true;creature.userData.interactionName=`Skyling ${i+1} · Observe Profile`;this.scene.add(creature);
      this.showcaseActors.push({group:creature,phase:i*.83,radius:.9+(i%3)*.35,height:.45+(i%2)*.2,speed:.38+(i%4)*.08,centerX:0,centerZ:8});
    }

    const count=420,positions=new Float32Array(count*3);
    for(let i=0;i<count;i++){const a=i*1.618,r=12+(i%34)*1.7;positions[i*3]=Math.cos(a)*r;positions[i*3+1]=1+(i%22)*.65;positions[i*3+2]=Math.sin(a)*r;}
    const particleGeometry=new THREE.BufferGeometry();particleGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));this.weatherParticles.geometry=particleGeometry;this.scene.add(this.weatherParticles);
  }

  private createFloatingLabel(text: string, color: number) {
    const canvas=document.createElement('canvas');canvas.width=720;canvas.height=120;const ctx=canvas.getContext('2d')!;
    ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='rgba(4,10,18,.72)';ctx.fillRect(8,18,704,84);ctx.strokeStyle='#'+color.toString(16).padStart(6,'0');ctx.strokeRect(8,18,704,84);ctx.fillStyle='#effcff';ctx.font='700 34px IBM Plex Mono, monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,canvas.width/2,canvas.height/2);
    const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(canvas),transparent:true,depthWrite:false}));sprite.scale.set(5.2,.86,1);return sprite;
  }

  private updateShowcaseLife(deltaSeconds: number) {
    for(const actor of this.showcaseActors){
      if(actor.group.userData.gridObjectId?.startsWith('world-gate.')){actor.group.position.y=.25+Math.sin(this.showcaseTime*actor.speed+actor.phase)*actor.height;actor.group.rotation.z=Math.sin(this.showcaseTime*actor.speed*.7+actor.phase)*.025;}
      else{const t=this.showcaseTime*actor.speed+actor.phase;actor.group.position.x=actor.centerX+Math.cos(t)*(actor.radius+3);actor.group.position.y=actor.height+3+Math.sin(t*1.7)*.35;actor.group.position.z=actor.centerZ+Math.sin(t)*(actor.radius+3);actor.group.rotation.y=t+Math.PI/2;}
    }
    const pos=this.weatherParticles.geometry.getAttribute('position') as THREE.BufferAttribute|undefined;
    if(pos){for(let i=0;i<pos.count;i++){const y=pos.getY(i)-deltaSeconds*(.08+(i%5)*.015);pos.setY(i,y<1?15:y);}pos.needsUpdate=true;}
  }

  private createTerrain() {
    const geometry = new THREE.PlaneGeometry(112, 112, 32, 32);
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const radius = Math.hypot(x, y);
      const rise = Math.max(0, (radius - 34) / 22) * .18;
      const ripple = Math.sin(x * .16) * Math.cos(y * .13) * .045;
      positions.setZ(i, rise + ripple);
    }
    geometry.computeVertexNormals();
    const terrain = new THREE.Mesh(geometry, createTexturedPBRMaterial('tex-ground-plaza-dark.webp', { roughness: .9, repeat: 14 }));
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.y = -.42;
    terrain.receiveShadow = true;
    terrain.userData.gridObjectId = 'terrain.first-light';
    terrain.userData.interactable = true;
    terrain.userData.interactionName = 'First Light Terrain';
    this.scene.add(terrain);

    const water = new THREE.Mesh(
      new THREE.CircleGeometry(28, 48),
      createStarterPBRMaterial('glass', { color: '#2c7180', roughness: .12, emissive: '#155766', emissiveIntensity: .22 }),
    );
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, -.25, 38);
    water.scale.set(1.9, .7, 1);
    this.scene.add(water);

    for (const x of [-46, -34, 34, 46]) {
      const berm = new THREE.Mesh(
        new THREE.BoxGeometry(8, 1.2, 112),
        createStarterPBRMaterial('stone', { color: '#59605b', roughness: .94 }),
      );
      berm.position.set(x, -.1, 0);
      berm.receiveShadow = true;
      this.scene.add(berm);
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
        createStarterPBRMaterial('stone', { color: '#' + district.color.toString(16).padStart(6, '0'), roughness: .88 }),
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
        createStarterPBRMaterial('stone', { color: '#' + color.toString(16).padStart(6, '0'), roughness: .58, metalness: .18 }),
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
        createStarterPBRMaterial('metal', { color: '#111b26', metalness: .72, roughness: .25 }),
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
      createStarterPBRMaterial('metal', { color: '#657987', metalness: .62, roughness: .35 }),
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
        createStarterPBRMaterial('wood', { color: '#5b3b24', roughness: .82 })
      );
      trunk.position.y = 1;
      trunk.castShadow = true;
      tree.add(trunk);

      const crown = new THREE.Mesh(
        new THREE.SphereGeometry(1.15, 10, 8),
        createStarterPBRMaterial('foliage', { color: '#3f7a4a', roughness: .96 })
      );
      crown.position.y = 2.35;
      crown.castShadow = true;
      tree.add(crown);
      tree.position.set(x, 0, z);
      this.scene.add(tree);
    }
  }
}
