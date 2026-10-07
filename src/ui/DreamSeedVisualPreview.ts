import * as THREE from 'three';
import type { DreamSeedPreview } from '../world/DreamSeedWorldAdapter';
import { deriveWorldDNA } from '../world/WorldDNA';
import { cloneGridRuntimeModel, type GridRuntimeModelId } from '../engine/GridRuntimeModelLoader';
import { createStarterPBRMaterial } from '../engine/GridPBRLibrary';

export interface DreamSeedVisualPreview {
  canvas: HTMLCanvasElement;
  render(preview: DreamSeedPreview): Promise<void>;
  resize(): void;
  dispose(): void;
}

function hash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967295;
}

function has(preview: DreamSeedPreview, token: string): boolean {
  const s = [
    preview.summary.creativeIntent,
    preview.summary.visualDirection,
    preview.summary.geography,
    preview.summary.climate,
    preview.summary.architecture,
    ...preview.summary.materials,
    ...preview.summary.flora,
    ...preview.summary.fauna,
  ].filter(Boolean).join(' ').toLowerCase();
  return s.includes(token.toLowerCase());
}

function colorFor(preview: DreamSeedPreview): THREE.Color {
  const color = new THREE.Color();
  color.setHSL(hash(preview.seedId + preview.blueprintVersion), .48, .55);
  return color;
}

function modelForGeometry(geometry: string): GridRuntimeModelId {
  if (geometry === 'volcanic') return 'building-d';
  if (geometry === 'crystalline') return 'building-c';
  if (geometry === 'storm') return 'building-e';
  if (geometry === 'mineral-life') return 'building-b';
  return 'building-a';
}

function treeForGeometry(geometry: string): GridRuntimeModelId {
  if (geometry === 'volcanic') return 'tree-palm';
  if (geometry === 'crystalline') return 'tree-pine';
  return 'tree-oak';
}

function creatureForPreview(preview: DreamSeedPreview, geometry: string): GridRuntimeModelId {
  const text = [
    ...preview.summary.fauna,
    preview.summary.creativeIntent,
    preview.summary.visualDirection,
  ].filter(Boolean).join(' ').toLowerCase();
  if (text.includes('fox')) return 'animal-fox';
  if (text.includes('cat')) return 'animal-cat';
  return geometry === 'primal' || text.includes('wild') ? 'animal-deer' : 'animal-fox';
}

export function createDreamSeedVisualPreview(host: HTMLElement): DreamSeedVisualPreview {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-label', 'Dream Seed isolated visual preview');
  Object.assign(canvas.style, { width: '100%', height: '100%', display: 'block', borderRadius: '10px' });
  host.replaceChildren(canvas);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x030914);
  const camera = new THREE.PerspectiveCamera(46, 1, .1, 200);
  camera.position.set(15, 10.5, 17);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const root = new THREE.Group();
  root.name = 'dream-seed-preview-only';
  scene.add(root);

  const ambient = new THREE.HemisphereLight(0xb9e7ff, 0x10151b, 1.8);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(-12, 20, 10);
  scene.add(key);

  const previewState = { active: false, color: new THREE.Color(0x69d8ff), time: 0 };

  function clearRoot() {
    // Runtime GLB clones share cached geometry/materials. Detach them here instead
    // of disposing shared resources owned by GridRuntimeModelLoader.
    while (root.children.length) root.remove(root.children[0]);
  }

  function addLabelPlate(label: string) {
    const plate = new THREE.Mesh(
      new THREE.PlaneGeometry(7.5, .8),
      new THREE.MeshBasicMaterial({
        color: previewState.color,
        transparent: true,
        opacity: .10,
        side: THREE.DoubleSide,
      }),
    );
    plate.position.set(0, 8.5, -2);
    plate.rotation.x = -.18;
    plate.userData.label = label;
    root.add(plate);
  }

  async function addRuntimeAsset(
    id: GridRuntimeModelId,
    position: THREE.Vector3,
    scale: number,
    rotationY = 0,
  ) {
    try {
      const model = await cloneGridRuntimeModel(id);
      model.position.copy(position);
      model.scale.setScalar(scale);
      model.rotation.y = rotationY;
      model.userData.gridObjectKind = 'dream-seed-preview-asset';
      model.userData.gridAssetSource = 'Grid runtime presentation layer';
      root.add(model);
    } catch (error) {
      // Preview remains usable when an optional presentation asset is unavailable.
      console.warn('Dream Seed preview asset unavailable.', id, error);
    }
  }

  async function build(preview: DreamSeedPreview) {
    clearRoot();
    previewState.color = colorFor(preview);
    previewState.active = true;

    const tags = preview.worldRequest.tags ?? [];
    const dna = deriveWorldDNA(tags);
    const geometry = dna.presentation.geometry;
    const life = Math.max(.8, Math.min(2.4, dna.ambientLife));
    const organic = geometry === 'organic' || geometry === 'mineral-life';
    const water = has(preview, 'water') || has(preview, 'ocean') || has(preview, 'river') || has(preview, 'harbor');
    const crystalline = geometry === 'crystalline' || has(preview, 'crystal') || has(preview, 'glass');
    const volcanic = geometry === 'volcanic' || has(preview, 'volcan');
    const monumental = geometry === 'monumental' || has(preview, 'temple') || has(preview, 'monument');
    const warm = dna.climate === 'arid' || has(preview, 'desert') || has(preview, 'arid');

    const groundFamily = warm ? 'ground' : organic ? 'foliage' : 'ground';
    const groundMaterial = createStarterPBRMaterial(groundFamily, {
      color: warm ? '#8a6b48' : previewState.color.clone().lerp(new THREE.Color('#26342d'), .68),
      roughness: .94,
    });
    const ground = new THREE.Mesh(new THREE.CircleGeometry(14 + life * 3, 64), groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.userData.gridObjectKind = 'dream-seed-preview-terrain';
    root.add(ground);

    if (water) {
      const waterMaterial = createStarterPBRMaterial('glass', {
        color: '#287eaa',
        roughness: .16,
        metalness: .18,
        emissive: '#0b4968',
        emissiveIntensity: .08,
      });
      const lagoon = new THREE.Mesh(new THREE.CircleGeometry(7.5, 64), waterMaterial);
      lagoon.rotation.x = -Math.PI / 2;
      lagoon.position.y = .035;
      root.add(lagoon);
    }

    // Use the same runtime presentation assets as live worlds, but place them in
    // this private preview group so no live world is registered or mutated.
    const buildingId = modelForGeometry(geometry);
    const buildingCount = Math.min(8, 4 + preview.summary.pointsOfInterest.length);
    const assetPromises: Promise<void>[] = [];
    for (let i = 0; i < buildingCount; i++) {
      const a = i * 2.399963 + hash(preview.seedId + i) * .5;
      const radius = 3.6 + (i % 3) * 2.2;
      const scale = (monumental ? 1.25 : .9) + (i % 3) * .12;
      assetPromises.push(addRuntimeAsset(
        buildingId,
        new THREE.Vector3(Math.cos(a) * radius, .02, Math.sin(a) * radius),
        scale,
        a + .4,
      ));
    }

    const treeId = treeForGeometry(geometry);
    const floraCount = Math.min(12, Math.max(5, Math.round(7 * life)));
    for (let i = 0; i < floraCount; i++) {
      const a = i * 2.399963 + .8;
      const radius = 5.5 + (i % 5) * 1.45;
      assetPromises.push(addRuntimeAsset(
        treeId,
        new THREE.Vector3(Math.cos(a) * radius, .02, Math.sin(a) * radius),
        .62 + (i % 3) * .12,
        a,
      ));
    }

    const creatureId = creatureForPreview(preview, geometry);
    const creatureCount = Math.min(6, Math.max(2, Math.round(2.5 * life)));
    for (let i = 0; i < creatureCount; i++) {
      const a = i * 3.1 + 1.1;
      const radius = 2.8 + (i % 4) * 1.8;
      assetPromises.push(addRuntimeAsset(
        creatureId,
        new THREE.Vector3(Math.cos(a) * radius, .05, Math.sin(a) * radius),
        .38 + (i % 2) * .08,
        a,
      ));
    }

    // Keep a small amount of procedural geometry for seed-specific landmarks.
    const monumentMaterial = createStarterPBRMaterial(crystalline ? 'glass' : 'technical', {
      color: previewState.color,
      roughness: crystalline ? .22 : .38,
      metalness: crystalline ? .55 : .62,
      emissive: previewState.color,
      emissiveIntensity: .16,
    });
    const monumentGeometry = crystalline
      ? new THREE.OctahedronGeometry(1.55, 1)
      : monumental
        ? new THREE.CylinderGeometry(1.15, 1.65, 3.4, 10)
        : new THREE.TorusKnotGeometry(1.05, .11, 72, 10);
    const monument = new THREE.Mesh(monumentGeometry, monumentMaterial);
    monument.position.set(0, monumental ? 1.7 : 2.2, 0);
    root.add(monument);

    if (volcanic) {
      for (let i = 0; i < 12; i++) {
        const ember = new THREE.Mesh(
          new THREE.SphereGeometry(.07 + (i % 3) * .025, 7, 6),
          new THREE.MeshBasicMaterial({ color: 0xffa23a }),
        );
        ember.position.set(
          (hash(preview.seedId + 'e' + i) - .5) * 16,
          1 + (i % 7) * .6,
          (hash(preview.seedId + 'z' + i) - .5) * 16,
        );
        root.add(ember);
      }
    }

    if (crystalline) {
      for (let i = 0; i < 10; i++) {
        const crystal = new THREE.Mesh(
          new THREE.OctahedronGeometry(.32 + (i % 3) * .12),
          new THREE.MeshStandardMaterial({
            color: previewState.color,
            roughness: .18,
            metalness: .6,
            emissive: previewState.color,
            emissiveIntensity: .15,
            transparent: true,
            opacity: .9,
          }),
        );
        const a = i * 2.399963;
        crystal.position.set(Math.cos(a) * 7.5, .42 + (i % 2) * .3, Math.sin(a) * 7.5);
        crystal.scale.y = 1.8;
        root.add(crystal);
      }
    }

    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(150 * 3);
    for (let i = 0; i < 150; i++) {
      const a = i * 2.399963;
      const radius = 6 + (i % 12) * .58;
      positions[i * 3] = Math.cos(a) * radius;
      positions[i * 3 + 1] = 1.2 + (i % 14) * .58;
      positions[i * 3 + 2] = Math.sin(a) * radius;
    }
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    root.add(new THREE.Points(
      particles,
      new THREE.PointsMaterial({
        color: previewState.color,
        size: .055,
        transparent: true,
        opacity: .34,
        depthWrite: false,
      }),
    ));

    if (water) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(8.5, .035, 6, 96),
        new THREE.MeshBasicMaterial({ color: 0x7ee7ff, transparent: true, opacity: .42 }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = .06;
      root.add(ring);
    }

    addLabelPlate(preview.summary.name);
    await Promise.all(assetPromises);
    camera.position.set(15, 10.5, 17);
    camera.lookAt(0, 1.5, 0);
  }

  function resize() {
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  let raf = 0;
  function tick() {
    previewState.time += .016;
    if (previewState.active) {
      root.rotation.y += .0009;
      root.children.forEach((child, index) => {
        if (child.userData.label) child.position.y = 8.5 + Math.sin(previewState.time + index) * .04;
      });
      renderer.render(scene, camera);
    }
    raf = requestAnimationFrame(tick);
  }
  tick();

  return {
    canvas,
    render: build,
    resize,
    dispose() {
      cancelAnimationFrame(raf);
      clearRoot();
      renderer.dispose();
    },
  };
}
