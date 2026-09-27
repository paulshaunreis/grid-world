import * as THREE from 'three';
import { Input } from './core/Input';
import { InteractionSystem } from './core/InteractionSystem';
import { Persistence } from './core/Persistence';
import { SupabasePersistence } from './persistence/SupabasePersistence';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabaseConfigured } from './persistence/config';
import { loadOrCreateIdentity } from './core/PlayerIdentity';
import { PlayerController } from './core/PlayerController';
import { World } from './world/World';
import './style.css';

const app = document.querySelector<HTMLDivElement>('#app')!;
const identity = loadOrCreateIdentity();
const persistence = new Persistence();
const cloudPersistence = supabaseConfigured ? new SupabasePersistence(SUPABASE_URL!, SUPABASE_PUBLISHABLE_KEY!) : null;

const hud = document.createElement('div');
hud.className = 'hud';
hud.innerHTML = `
  <div class="crosshair"></div>
  <div class="interaction" id="interaction-prompt">E · Interact</div>
  <div class="status" id="status">FIRST LIGHT · WASD move · Shift sprint · Space jump · E interact · V camera</div>
`;
app.appendChild(hud);

const world = new World();
const input = new Input();
const player = new PlayerController(input);
world.scene.add(player.avatar);

const savedState = persistence.loadPlayerState();
if (savedState) player.restoreTransform(savedState);

if (cloudPersistence) {
  cloudPersistence.signInAnonymously().then(({ data, error }) => {
    if (error || !data.user) return;
    const cloudIdentity = { ...identity, id: data.user.id };
    cloudPersistence.load(cloudIdentity).then(cloudState => {
      if (cloudState) player.restoreTransform(cloudState);
    }).catch(console.error);
  }).catch(console.error);
}

const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 500);
camera.position.set(0, 3.2, 7);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
app.appendChild(renderer.domElement);

const interaction = new InteractionSystem(camera, world.scene);
const prompt = document.querySelector<HTMLDivElement>('#interaction-prompt')!;
const status = document.querySelector<HTMLDivElement>('#status')!;
status.textContent = `FIRST LIGHT · ${identity.displayName} · WASD move · Shift sprint · Space jump · E interact · V camera`;

let firstPerson = false;
let saveTimer = 0;

function savePlayer() {
  const transform = player.getTransform();
  const state = {
    ...transform,
    regionId: 'first-light',
    updatedAt: new Date().toISOString(),
  };
  persistence.savePlayerState(state);
  if (cloudPersistence) {
    cloudPersistence.signInAnonymously().then(({ data, error }) => {
      if (error || !data.user) return;
      cloudPersistence.save({ ...identity, id: data.user.id }, state).catch(console.error);
    }).catch(console.error);
  }
}

renderer.domElement.addEventListener('click', () => renderer.domElement.requestPointerLock());

addEventListener('mousemove', event => {
  if (document.pointerLockElement === renderer.domElement) player.rotate(event.movementX);
});

addEventListener('keydown', event => {
  if (event.code === 'KeyV' && !event.repeat) firstPerson = !firstPerson;

  if (event.code === 'KeyE' && !event.repeat) {
    const result = interaction.interact();
    if (result) {
      prompt.textContent = `E · ${result.name}`;
      console.info('Interacted with:', result.name);
    }
  }
});

addEventListener('beforeunload', savePlayer);

let last = performance.now();

function animate(now: number) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  saveTimer += dt;

  player.update(dt);
  if (saveTimer >= 2) {
    savePlayer();
    saveTimer = 0;
  }

  const distance = firstPerson ? 0.05 : 7;
  const height = firstPerson ? 2.0 : 3.2;
  const target = new THREE.Vector3(
    player.avatar.position.x,
    player.avatar.position.y + height,
    player.avatar.position.z + distance
  ).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.heading);

  camera.position.lerp(target, 1 - Math.pow(0.001, dt));
  camera.lookAt(
    player.avatar.position.x,
    player.avatar.position.y + (firstPerson ? 1.65 : 1.2),
    player.avatar.position.z
  );

  const targetObject = interaction.findTarget();
  prompt.classList.toggle('visible', Boolean(targetObject));
  if (targetObject) prompt.textContent = `E · ${targetObject.name}`;

  renderer.render(world.scene, camera);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
