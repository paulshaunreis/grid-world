import * as THREE from 'three';
import { Input } from './core/Input';
import { InteractionSystem } from './core/InteractionSystem';
import { Persistence } from './core/Persistence';
import { SupabasePersistence } from './persistence/SupabasePersistence';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabaseConfigured } from './persistence/config';
import { loadOrCreateIdentity } from './core/PlayerIdentity';
import { PlayerController } from './core/PlayerController';
import { World } from './world/World';
import { SupabasePresence } from './network/SupabasePresence';
import { RemotePlayer } from './world/RemotePlayer';
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
  <div class="status" id="status">FIRST LIGHT · Connecting…</div>
`;
app.appendChild(hud);

const world = new World();
const input = new Input();
const player = new PlayerController(input);
world.scene.add(player.avatar);

const savedState = persistence.loadPlayerState();
if (savedState) player.restoreTransform(savedState);

let cloudIdentity = identity;
let presence: SupabasePresence | null = null;
const remotePlayers = new Map<string, RemotePlayer>();

const cloudReady = cloudPersistence
  ? (async () => {
      let authenticated = false;

      try {
        const { data, error } = await cloudPersistence.signInAnonymously();
        if (!error && data.user) {
          cloudIdentity = { ...identity, id: data.user.id };
          authenticated = true;

          const cloudState = await cloudPersistence.load(cloudIdentity);
          if (cloudState) player.restoreTransform(cloudState);
        } else {
          console.warn('Anonymous auth unavailable; presence will use the local visitor identity.');
        }
      } catch (error) {
        console.warn('Cloud persistence unavailable; continuing with realtime presence.', error);
      }

      presence = new SupabasePresence(cloudPersistence.getClient(), cloudIdentity, {
        onJoin: state => {
          if (remotePlayers.has(state.id)) return;
          const remote = new RemotePlayer(state);
          remotePlayers.set(state.id, remote);
          world.scene.add(remote.group);
        },
        onUpdate: state => remotePlayers.get(state.id)?.setState(state),
        onLeave: id => {
          const remote = remotePlayers.get(id);
          if (!remote) return;
          world.scene.remove(remote.group);
          remotePlayers.delete(id);
        },
      });

      try {
        await presence.connect();
      } catch (error) {
        console.warn('Realtime presence unavailable; continuing in local mode.', error);
        presence = null;
      }

      return authenticated;
    })()
  : Promise.resolve(false);

cloudReady.finally(() => {
  status.textContent = `FIRST LIGHT · ${identity.displayName} · WASD move · Shift sprint · Space jump · E interact · V camera`;
});

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
let presenceTimer = 0;
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
    cloudPersistence.save(cloudIdentity, state).catch(console.error);
  }
  presence?.update(transform).catch(console.error);
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
addEventListener('beforeunload', () => { presence?.disconnect().catch(() => undefined); });

let last = performance.now();

function animate(now: number) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  presenceTimer += dt;
  saveTimer += dt;

  player.update(dt);
  for (const remote of remotePlayers.values()) remote.update(dt);
  if (presenceTimer >= 0.25) {
    presence?.update(player.getTransform()).catch(console.error);
    presenceTimer = 0;
  }
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
