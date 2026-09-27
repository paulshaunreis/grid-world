import * as THREE from 'three';

const app = document.querySelector<HTMLDivElement>('#app')!;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07111f);
scene.fog = new THREE.Fog(0x07111f, 45, 180);

const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 500);
camera.position.set(0, 3, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
app.appendChild(renderer.domElement);

const hemi = new THREE.HemisphereLight(0x9fc9ff, 0x182015, 1.8);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xffe2b0, 3);
sun.position.set(-30, 50, 20);
sun.castShadow = true;
scene.add(sun);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(220, 220, 40, 40),
  new THREE.MeshStandardMaterial({ color: 0x27382a, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const grid = new THREE.GridHelper(220, 44, 0x52705a, 0x304638);
grid.position.y = 0.02;
scene.add(grid);

const avatar = new THREE.Group();
const body = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.42, 1.0, 8, 16),
  new THREE.MeshStandardMaterial({ color: 0x8ad1ff, roughness: 0.55 })
);
body.position.y = 1;
body.castShadow = true;
avatar.add(body);

const head = new THREE.Mesh(
  new THREE.SphereGeometry(0.34, 16, 12),
  new THREE.MeshStandardMaterial({ color: 0xe8f5ff, roughness: 0.7 })
);
head.position.y = 1.85;
head.castShadow = true;
avatar.add(head);

scene.add(avatar);

function makeTree(x: number, z: number) {
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
  scene.add(tree);
}

[
  [-8, -8], [8, -10], [-12, 5], [13, 7], [4, -18], [-20, -2],
  [20, -4], [10, 18], [-10, 17]
].forEach(([x, z]) => makeTree(x, z));

const landmark = new THREE.Mesh(
  new THREE.BoxGeometry(5, 6, 5),
  new THREE.MeshStandardMaterial({ color: 0x35495e, roughness: 0.7 })
);
landmark.position.set(0, 3, -22);
landmark.castShadow = true;
scene.add(landmark);

const keys = new Set<string>();
addEventListener('keydown', e => keys.add(e.code));
addEventListener('keyup', e => keys.delete(e.code));

let yaw = 0;
let velocityY = 0;
let grounded = true;

renderer.domElement.addEventListener('click', () => renderer.domElement.requestPointerLock());
addEventListener('mousemove', e => {
  if (document.pointerLockElement !== renderer.domElement) return;
  yaw -= e.movementX * 0.0025;
  camera.rotation.y = yaw;
});

function update(dt: number) {
  const speed = keys.has('ShiftLeft') ? 8 : 4;
  const forward = Number(keys.has('KeyW')) - Number(keys.has('KeyS'));
  const strafe = Number(keys.has('KeyD')) - Number(keys.has('KeyA'));

  const direction = new THREE.Vector3(strafe, 0, -forward);
  if (direction.lengthSq() > 0) {
    direction.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    avatar.position.addScaledVector(direction, speed * dt);
  }

  if (keys.has('Space') && grounded) {
    velocityY = 7;
    grounded = false;
  }

  velocityY -= 18 * dt;
  avatar.position.y += velocityY * dt;
  if (avatar.position.y <= 0) {
    avatar.position.y = 0;
    velocityY = 0;
    grounded = true;
  }

  camera.position.lerp(
    new THREE.Vector3(
      avatar.position.x,
      avatar.position.y + 3.2,
      avatar.position.z + 7
    ).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw),
    1 - Math.pow(0.001, dt)
  );
  camera.lookAt(avatar.position.x, avatar.position.y + 1.2, avatar.position.z);
}

let last = performance.now();
function animate(now: number) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  update(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
