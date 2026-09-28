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
import { GridScriptRegistry } from './scripting/GridScriptRegistry';
import { parseGridScript } from './scripting/GridScript';
import { TeamAvatar } from './avatars/TeamAvatar';
import { TEAM_AVATARS } from './avatars/teamRoster';
import { Minimap } from './ui/Minimap';
import './style.css';

const app = document.querySelector<HTMLDivElement>('#app')!;
let identity = loadOrCreateIdentity();
const persistence = new Persistence();
const cloudPersistence = supabaseConfigured ? new SupabasePersistence(SUPABASE_URL!, SUPABASE_PUBLISHABLE_KEY!) : null;

type HudTheme = 'cyan' | 'violet' | 'magenta' | 'emerald' | 'amber' | 'white';
const HUD_THEME_KEY = 'grid-world:hud-theme';
const hudTheme = (localStorage.getItem(HUD_THEME_KEY) as HudTheme | null) ?? 'cyan';
document.documentElement.dataset.hudTheme = hudTheme;

const hud = document.createElement('div');
hud.className = 'hud';
hud.innerHTML = `
  <div class="hud-frame hud-frame-top"></div>
  <div class="hud-frame hud-frame-bottom"></div>
  <div class="crosshair"></div>
  <button class="identity-button" id="identity-button" type="button">✦ ${identity.displayName}</button>
  <button class="creator-button" id="creator-button" type="button">◇ CREATOR</button>
  <div class="creator-panel" id="creator-panel"><div class="creator-card"><div class="creator-title">Grid Script // Neon Door</div><div class="creator-subtitle">Safe preview · capability-bounded · no arbitrary code</div><pre class="creator-code" id="creator-code"></pre><div class="creator-capabilities" id="creator-capabilities"></div><button class="creator-close" id="creator-close" type="button">Close</button></div></div>
  <div class="identity-panel" id="identity-panel">
    <div class="identity-card">
      <div class="identity-title">Your Traveler</div>
      <div class="identity-subtitle">Choose the identity and interface style other players see.</div>
      <input id="identity-name" maxlength="20" autocomplete="off" placeholder="Display name" />
      <div class="avatar-label">Avatar style</div>
      <div class="avatar-options" id="avatar-options">
        <button type="button" data-avatar="azure">Azure</button>
        <button type="button" data-avatar="sunset">Sunset</button>
        <button type="button" data-avatar="forest">Forest</button>
        <button type="button" data-avatar="violet">Violet</button>
      </div>
      <div class="avatar-label">HUD color</div>
      <div class="hud-options" id="hud-options">
        <button type="button" data-hud="cyan">Cyan</button>
        <button type="button" data-hud="violet">Violet</button>
        <button type="button" data-hud="magenta">Magenta</button>
        <button type="button" data-hud="emerald">Emerald</button>
        <button type="button" data-hud="amber">Amber</button>
        <button type="button" data-hud="white">White</button>
      </div>
      <div class="hud-opacity">HUD transparency · 20%</div>
      <div class="identity-actions">
        <button id="identity-cancel" type="button">Cancel</button>
        <button id="identity-save" type="button">Save</button>
      </div>
      <div class="identity-hint">2–20 characters · letters, numbers, spaces, - and _</div>
    </div>
  </div>
  <div class="interaction" id="interaction-prompt">E · Interact</div>
  <section class="chat" id="chat" aria-label="Grid World chat">
    <div class="chat-header"><span>GRID CHAT</span><span id="chat-status">LOCAL</span></div>
    <div class="chat-messages" id="chat-messages" aria-live="polite"></div>
    <form class="chat-compose" id="chat-compose">
      <input id="chat-input" maxlength="240" autocomplete="off" placeholder="Say something…" aria-label="Chat message" />
      <button type="submit" aria-label="Send message">SEND</button>
    </form>
  </section>
  <div class="status" id="status">FIRST LIGHT · Connecting…</div>
`;
app.appendChild(hud);
const status = document.querySelector<HTMLDivElement>('#status')!;
const chatMessages = document.querySelector<HTMLDivElement>('#chat-messages')!;
const chatCompose = document.querySelector<HTMLFormElement>('#chat-compose')!;
const chatInput = document.querySelector<HTMLInputElement>('#chat-input')!;

function addChatMessage(sender: string, message: string, kind: 'player' | 'system' | 'team' = 'player') {
  const row = document.createElement('div');
  row.className = 'chat-message chat-' + kind;
  const name = document.createElement('span');
  name.className = 'chat-name';
  name.textContent = sender;
  const text = document.createElement('span');
  text.className = 'chat-text';
  text.textContent = message;
  row.append(name, text);
  chatMessages.appendChild(row);
  while (chatMessages.children.length > 40) chatMessages.firstElementChild?.remove();
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

addChatMessage('GRID', 'Welcome to First Light. Chat is ready.', 'system');

chatCompose.addEventListener('submit', event => {
  event.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;
  addChatMessage(identity.displayName, message, 'player');
  presence?.sendChat(message).then(ok => {
    if (!ok && presence) addChatMessage('GRID', 'Chat delivery unavailable. Message remains local.', 'system');
  }).catch(() => addChatMessage('GRID', 'Chat delivery failed. Message remains local.', 'system'));
  chatInput.value = '';
  chatInput.focus();
});

const world = new World();
const input = new Input();
const player = new PlayerController(input);
world.scene.add(player.avatar);

const savedState = persistence.loadPlayerState();
if (savedState) player.restoreTransform(savedState);
player.setAvatarStyle(identity.avatarStyle);

let cloudIdentity = identity;
const remotePlayers = new Map<string, RemotePlayer>();
const teamAvatars = TEAM_AVATARS.map(definition => new TeamAvatar(definition));
for (const avatar of teamAvatars) world.scene.add(avatar.group);

const minimap = new Minimap({
  regions: world.regions,
  getPlayer: () => ({
    x: player.avatar.position.x,
    z: player.avatar.position.z,
    yaw: player.heading,
  }),
  getMarkers: () => [
    { id: 'player', x: player.avatar.position.x, z: player.avatar.position.z, kind: 'player' },
    ...teamAvatars.map(avatar => ({
      id: avatar.definition.id,
      x: avatar.group.position.x,
      z: avatar.group.position.z,
      kind: 'team' as const,
    })),
    ...[...remotePlayers.values()].map(remote => ({
      id: remote.id,
      x: remote.group.position.x,
      z: remote.group.position.z,
      kind: 'player' as const,
    })),
    { id: 'central-landmark', x: 0, z: -22, kind: 'landmark' as const },
    { id: 'world-beacon', x: 0, z: -7, kind: 'interactable' as const },
    { id: 'neon-door', x: 0, z: -14, kind: 'interactable' as const },
  ],
});
hud.appendChild(minimap.element);

let presence: SupabasePresence | null = null;

if (cloudPersistence) {
  presence = new SupabasePresence(cloudPersistence.getClient(), identity, {
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
    onStatus: state => {
      const labels = {
        CONNECTING: 'MULTIPLAYER · Connecting…',
        CONNECTED: 'MULTIPLAYER · Connected',
        ERROR: 'MULTIPLAYER · Connection error',
        TIMED_OUT: 'MULTIPLAYER · Timed out',
      } as const;
      setMultiplayerStatus(labels[state]);
    },
  });

  presence.onChat(chat => addChatMessage(chat.displayName, chat.message, 'player'));
  presence.connect(player.getTransform()).catch(error => {
    console.warn('Realtime presence unavailable; continuing in local mode.', error);
    status.textContent = 'FIRST LIGHT · MULTIPLAYER · Unavailable';
    presence = null;
  });
}

const cloudReady = cloudPersistence
  ? (async () => {
      let authenticated = false;
      try {
        const { data, error } = await cloudPersistence.signInAnonymously();
        if (!error && data.user) {
          cloudIdentity = { ...identity, id: data.user.id };
          authenticated = true;
        } else {
          console.warn('Anonymous auth unavailable; presence will use the local visitor identity.');
        }
      } catch (error) {
        console.warn('Cloud persistence unavailable; continuing with realtime presence.', error);
      }

      if (authenticated) {
        presence?.setIdentity(cloudIdentity);
        try {
          const cloudState = await cloudPersistence.load(cloudIdentity);
          if (cloudState) player.restoreTransform(cloudState);
        } catch (error) {
          console.warn('Cloud state unavailable; continuing with realtime presence.', error);
        }
      }
      return authenticated;
    })()
  : Promise.resolve(false);

let multiplayerLabel = 'MULTIPLAYER · Connecting…';

function setControlStatus() {
  status.textContent = `FIRST LIGHT · ${identity.displayName} · WASD move · Shift sprint · Space jump · E interact · V camera`;
}

function setMultiplayerStatus(label: string) {
  multiplayerLabel = label;
  status.textContent = `FIRST LIGHT · ${label}`;
}

cloudReady.finally(() => {
  if (multiplayerLabel === 'MULTIPLAYER · Connecting…') setControlStatus();
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
const creatorButton = document.querySelector<HTMLButtonElement>('#creator-button')!;
const creatorPanel = document.querySelector<HTMLDivElement>('#creator-panel')!;
const creatorCode = document.querySelector<HTMLPreElement>('#creator-code')!;
const creatorCapabilities = document.querySelector<HTMLDivElement>('#creator-capabilities')!;
const neonDoorSource = `object "Neon Door"

when player interacts:
    door.open()
`;
const parsedNeonDoor = parseGridScript(neonDoorSource);
creatorCode.textContent = neonDoorSource;
creatorCapabilities.textContent = parsedNeonDoor.script ? 'CAPABILITIES · ' + [...new Set(parsedNeonDoor.script.handlers.flatMap(handler => handler.actions.map(action => action.kind === 'call' ? 'object_control' : action.kind === 'play_sound' ? 'play_audio' : action.kind === 'give_item' ? 'economy_transaction' : 'ui_feedback')))].join(' · ') : 'SCRIPT ERROR · ' + parsedNeonDoor.diagnostics.map(d => 'L' + d.line + ' ' + d.message).join(' | ');
const scriptedObjects = new GridScriptRegistry();
if (parsedNeonDoor.script) {
  scriptedObjects.register('neon-door', world.neonDoor, parsedNeonDoor.script, {
    openDoor: () => {
      world.neonDoor.position.y = 7;
      const material = world.neonDoor.material;
      if (material instanceof THREE.MeshStandardMaterial) material.emissiveIntensity = 2.5;
      prompt.textContent = 'E · Neon Door opened';
      window.setTimeout(() => { world.neonDoor.position.y = 2.1; }, 1800);
    },
  });
}
const identityButton = document.querySelector<HTMLButtonElement>('#identity-button')!;
const identityPanel = document.querySelector<HTMLDivElement>('#identity-panel')!;
const identityName = document.querySelector<HTMLInputElement>('#identity-name')!;
const identitySave = document.querySelector<HTMLButtonElement>('#identity-save')!;
const identityCancel = document.querySelector<HTMLButtonElement>('#identity-cancel')!;
const avatarOptions = document.querySelector<HTMLDivElement>('#avatar-options')!;
const hudOptions = document.querySelector<HTMLDivElement>('#hud-options')!;

function openIdentityPanel() {
  identityName.value = identity.displayName;
  avatarOptions.querySelectorAll<HTMLButtonElement>('[data-avatar]').forEach(button => {
    button.classList.toggle('selected', button.dataset.avatar === identity.avatarStyle);
  });
  hudOptions.querySelectorAll<HTMLButtonElement>('[data-hud]').forEach(button => {
    button.classList.toggle('selected', button.dataset.hud === document.documentElement.dataset.hudTheme);
  });
  identityPanel.classList.add('open');
  identityName.focus();
  identityName.select();
}

function closeIdentityPanel() {
  identityPanel.classList.remove('open');
}

hudOptions.addEventListener('click', event => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-hud]');
  if (!button) return;
  const theme = button.dataset.hud as HudTheme;
  document.documentElement.dataset.hudTheme = theme;
  localStorage.setItem(HUD_THEME_KEY, theme);
  hudOptions.querySelectorAll<HTMLButtonElement>('[data-hud]').forEach(option => {
    option.classList.toggle('selected', option === button);
  });
});

avatarOptions.addEventListener('click', event => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-avatar]');
  if (!button) return;
  identity = { ...identity, avatarStyle: button.dataset.avatar as typeof identity.avatarStyle };
  player.setAvatarStyle(identity.avatarStyle);
  localStorage.setItem('grid-world:identity', JSON.stringify(identity));
  cloudIdentity = { ...cloudIdentity, avatarStyle: identity.avatarStyle };
  presence?.setIdentity(cloudIdentity);
  avatarOptions.querySelectorAll<HTMLButtonElement>('[data-avatar]').forEach(option => {
    option.classList.toggle('selected', option === button);
  });
  presence?.update(player.getTransform()).catch(console.error);
});

function saveIdentityName() {
  const displayName = identityName.value.trim().replace(/\s+/g, ' ');
  if (!/^[A-Za-z0-9 _-]{2,20}$/.test(displayName)) {
    identityName.setCustomValidity('Use 2–20 letters, numbers, spaces, - or _.');
    identityName.reportValidity();
    return;
  }

  identityName.setCustomValidity('');
  identity = { ...identity, displayName };
  localStorage.setItem('grid-world:identity', JSON.stringify(identity));
  cloudIdentity = { ...cloudIdentity, displayName };
  presence?.setIdentity(cloudIdentity);
  identityButton.textContent = '✦ ' + displayName;
  setControlStatus();
  presence?.update(player.getTransform()).catch(console.error);
  closeIdentityPanel();
}

creatorButton.addEventListener('click', () => creatorPanel.classList.add('open'));
document.querySelector<HTMLButtonElement>('#creator-close')!.addEventListener('click', () => creatorPanel.classList.remove('open'));
creatorPanel.addEventListener('click', event => { if (event.target === creatorPanel) creatorPanel.classList.remove('open'); });
identityButton.addEventListener('click', openIdentityPanel);
identityCancel.addEventListener('click', closeIdentityPanel);
identitySave.addEventListener('click', saveIdentityName);
identityName.addEventListener('keydown', event => {
  if (event.key === 'Enter') saveIdentityName();
  if (event.key === 'Escape') closeIdentityPanel();
});
setControlStatus();

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
  if (cloudPersistence) cloudPersistence.save(cloudIdentity, state).catch(console.error);
  presence?.update(transform).catch(console.error);
}

renderer.domElement.addEventListener('click', () => renderer.domElement.requestPointerLock());

addEventListener('mousemove', event => {
  if (document.pointerLockElement === renderer.domElement) player.rotate(event.movementX);
});

addEventListener('keydown', event => {
  if (document.activeElement === chatInput || document.activeElement === identityName) return;
  if (event.code === 'KeyV' && !event.repeat) firstPerson = !firstPerson;

  if (event.code === 'KeyE' && !event.repeat) {
    const result = interaction.interact();
    if (result) {
      prompt.textContent = `E · ${result.name} ✓`;
      const teamAvatarId = result.object.userData.teamAvatarId as string | undefined;
      if (teamAvatarId) {
        const teamAvatar = teamAvatars.find(avatar => avatar.definition.id === teamAvatarId);
        if (teamAvatar) prompt.textContent = `E · ${teamAvatar.definition.displayName} · ${teamAvatar.interact()}`;
      }
      scriptedObjects.dispatch(result.object, 'player interacts');
      result.object.userData.interacted = true;

      const material = result.object instanceof THREE.Mesh
        ? result.object.material
        : null;

      if (material instanceof THREE.MeshStandardMaterial) {
        material.emissiveIntensity = material.emissiveIntensity > 0 ? 2.8 : 0.35;
      }

      window.setTimeout(() => {
        if (prompt.textContent === `E · ${result.name} ✓`) {
          prompt.textContent = `E · ${result.name}`;
        }
      }, 1200);
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
  for (const avatar of teamAvatars) avatar.update(dt);
  minimap.update();
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
