import * as THREE from 'three';
import type { DreamSeedPreview } from '../world/DreamSeedWorldAdapter';

export interface DreamSeedVisualPreview {
  canvas: HTMLCanvasElement;
  render(preview: DreamSeedPreview): void;
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
  const h = hash(preview.seedId + preview.blueprintVersion);
  const color = new THREE.Color();
  color.setHSL(h, .58, .56);
  return color;
}

export function createDreamSeedVisualPreview(host: HTMLElement): DreamSeedVisualPreview {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-label', 'Dream Seed isolated visual preview');
  Object.assign(canvas.style, { width:'100%', height:'100%', display:'block', borderRadius:'10px' });
  host.replaceChildren(canvas);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x030914);
  const camera = new THREE.PerspectiveCamera(46, 1, .1, 200);
  camera.position.set(15, 11, 18);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const root = new THREE.Group();
  root.name = 'dream-seed-preview-only';
  scene.add(root);

  const ambient = new THREE.HemisphereLight(0xa9ddff, 0x080d16, 1.7);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(-10, 18, 10);
  scene.add(key);

  const previewState = { active: false, color: new THREE.Color(0x69d8ff), time: 0 };

  function clearRoot() {
    while (root.children.length) {
      const object = root.children.pop()!;
      object.traverse(child => {
        const mesh = child as THREE.Mesh;
        mesh.geometry?.dispose?.();
        const material = mesh.material;
        if (Array.isArray(material)) material.forEach(m => m.dispose());
        else material?.dispose?.();
      });
    }
  }

  function addLabelPlate(text: string) {
    const plate = new THREE.Mesh(
      new THREE.PlaneGeometry(7.5, .8),
      new THREE.MeshBasicMaterial({ color: previewState.color, transparent:true, opacity:.11, side:THREE.DoubleSide })
    );
    plate.position.set(0, 8.5, -2);
    plate.rotation.x = -.18;
    plate.userData.label = text;
    root.add(plate);
  }

  function build(preview: DreamSeedPreview) {
    clearRoot();
    previewState.color = colorFor(preview);
    previewState.active = true;

    const life = Math.max(0.8, Math.min(2.4, 1 + preview.summary.flora.length * .12 + preview.summary.fauna.length * .14));
    const organic = has(preview, 'forest') || has(preview, 'growth') || has(preview, 'living') || has(preview, 'garden');
    const water = has(preview, 'water') || has(preview, 'ocean') || has(preview, 'river') || has(preview, 'harbor');
    const crystalline = has(preview, 'crystal') || has(preview, 'glass');
    const volcanic = has(preview, 'volcan') || has(preview, 'ash');
    const monumental = has(preview, 'ancient') || has(preview, 'temple') || has(preview, 'monument');
    const warm = has(preview, 'desert') || has(preview, 'arid') || has(preview, 'sun');

    const groundColor = previewState.color.clone().lerp(new THREE.Color(warm ? 0xb48a55 : 0x1a2934), .62);
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(13, 64),
      new THREE.MeshStandardMaterial({ color:groundColor, roughness:.92, metalness:.04 })
    );
    ground.rotation.x = -Math.PI / 2;
    root.add(ground);

    if (water) {
      const lagoon = new THREE.Mesh(
        new THREE.CircleGeometry(7.5, 48),
        new THREE.MeshStandardMaterial({ color:0x287eaa, roughness:.18, metalness:.12, transparent:true, opacity:.82 })
      );
      lagoon.rotation.x = -Math.PI / 2;
      lagoon.position.y = .04;
      root.add(lagoon);
    }

    const buildingCount = 5 + Math.min(5, preview.summary.pointsOfInterest.length);
    for (let i=0; i<buildingCount; i++) {
      const a = i * 2.399963 + hash(preview.seedId + i) * .5;
      const radius = 3.2 + (i % 3) * 2.15;
      const height = monumental ? 2.4 + (i % 3) * 1.4 : 1.25 + (i % 4) * .65;
      const width = organic ? 1.0 + (i % 2) * .35 : 1.15;
      const geometry = crystalline ? new THREE.CylinderGeometry(width*.55, width, height, 6) :
        monumental ? new THREE.CylinderGeometry(width, width*1.15, height, 8) :
        new THREE.BoxGeometry(width, height, width);
      const material = new THREE.MeshStandardMaterial({
        color: previewState.color.clone().offsetHSL((i%3-.9)*.04, .02, (i%4-.2)*.025),
        roughness: crystalline ? .28 : .68,
        metalness: crystalline ? .45 : .12,
        emissive: previewState.color,
        emissiveIntensity: .025,
      });
      const building = new THREE.Mesh(geometry, material);
      building.position.set(Math.cos(a)*radius, height/2, Math.sin(a)*radius);
      building.rotation.y = a + .4;
      root.add(building);
    }

    const floraCount = Math.min(28, Math.round(10 * life));
    for (let i=0; i<floraCount; i++) {
      const a = i * 2.399963;
      const radius = 4 + (i % 7) * 1.1;
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(.07,.11,.75,7),
        new THREE.MeshStandardMaterial({ color:0x5c4635, roughness:.9 })
      );
      trunk.position.set(Math.cos(a)*radius, .38, Math.sin(a)*radius);
      root.add(trunk);
      const crown = new THREE.Mesh(
        new THREE.SphereGeometry(.48 + (i%3)*.12, 10, 8),
        new THREE.MeshStandardMaterial({ color:organic ? 0x67a96d : previewState.color, roughness:.8, transparent:true, opacity:.9 })
      );
      crown.position.set(trunk.position.x, .92 + (i%2)*.12, trunk.position.z);
      crown.scale.y = 1.15;
      root.add(crown);
    }

    const creatureCount = Math.min(12, Math.max(3, Math.round(3 * life)));
    for (let i=0; i<creatureCount; i++) {
      const a = i * 3.1;
      const r = 2.5 + (i%5)*1.7;
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(.28 + (i%2)*.08, 10, 7),
        new THREE.MeshStandardMaterial({ color:previewState.color, roughness:.6, emissive:previewState.color, emissiveIntensity:.08 })
      );
      body.position.set(Math.cos(a)*r, .42 + (i%3)*.12, Math.sin(a)*r);
      body.scale.set(1.35,.7,.9);
      root.add(body);
    }

    if (volcanic) {
      for (let i=0; i<7; i++) {
        const ember = new THREE.Mesh(new THREE.SphereGeometry(.08,7,6), new THREE.MeshBasicMaterial({color:0xffa23a}));
        ember.position.set((hash(preview.seedId+'e'+i)-.5)*15, 1+i*.55, (hash(preview.seedId+'z'+i)-.5)*15);
        root.add(ember);
      }
    }

    if (crystalline) {
      for (let i=0; i<9; i++) {
        const crystal = new THREE.Mesh(
          new THREE.OctahedronGeometry(.38 + (i%3)*.12),
          new THREE.MeshStandardMaterial({ color:previewState.color, roughness:.2, metalness:.55, emissive:previewState.color, emissiveIntensity:.18, transparent:true, opacity:.9 })
        );
        const a = i * 2.399963;
        crystal.position.set(Math.cos(a)*7.5, .45 + (i%2)*.3, Math.sin(a)*7.5);
        crystal.scale.y = 1.8;
        root.add(crystal);
      }
    }

    if (water) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(8.5,.035,6,96),
        new THREE.MeshBasicMaterial({color:0x7ee7ff, transparent:true, opacity:.42})
      );
      ring.rotation.x = -Math.PI/2;
      ring.position.y = .06;
      root.add(ring);
    }

    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(120*3);
    for (let i=0;i<120;i++) {
      const a=i*2.399963;
      const r=6+(i%12)*.58;
      positions[i*3]=Math.cos(a)*r;
      positions[i*3+1]=1.2+(i%14)*.58;
      positions[i*3+2]=Math.sin(a)*r;
    }
    particles.setAttribute('position',new THREE.BufferAttribute(positions,3));
    root.add(new THREE.Points(particles,new THREE.PointsMaterial({color:previewState.color,size:.055,transparent:true,opacity:.4,depthWrite:false})));

    const monument = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.05,.11,72,10),
      new THREE.MeshStandardMaterial({color:previewState.color, emissive:previewState.color, emissiveIntensity:.22, metalness:.6, roughness:.3})
    );
    monument.position.set(0, 2.2, 0);
    root.add(monument);

    addLabelPlate(preview.summary.name);
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
      root.children.forEach((child,index) => {
        if (child.userData.label) child.position.y = 8.5 + Math.sin(previewState.time + index)*.04;
      });
      renderer.render(scene,camera);
    }
    raf = requestAnimationFrame(tick);
  }
  tick();

  return {
    canvas,
    render(preview) { build(preview); resize(); },
    resize,
    dispose() {
      cancelAnimationFrame(raf);
      clearRoot();
      renderer.dispose();
    },
  };
}
