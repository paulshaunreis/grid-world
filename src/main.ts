import * as THREE from 'three';
import { Input } from './core/Input';
import { InteractionSystem } from './core/InteractionSystem';
import { Persistence } from './core/Persistence';
import { SupabasePersistence } from './persistence/SupabasePersistence';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabaseConfigured } from './persistence/config';
import { loadOrCreateIdentity } from './core/PlayerIdentity';
import { writeVersioned } from './core/VersionedStorage';
import { PlayerController } from './core/PlayerController';
import { World } from './world/World';
import { SupabasePresence } from './network/SupabasePresence';
import { GridCombatAuthority } from './network/GridCombatAuthority';
import { GridWorldEventStream } from './network/GridWorldEventStream';
import { RemotePlayer } from './world/RemotePlayer';
import { GridScriptRegistry } from './scripting/GridScriptRegistry';
import { parseGridScript } from './scripting/GridScript';
import { TeamAvatar } from './avatars/TeamAvatar';
import { TEAM_AVATARS } from './avatars/teamRoster';
import { Minimap } from './ui/Minimap';
import { UIModRegistry, WindowManager } from './ui/WindowManager';
import { FieldGuide } from './ui/FieldGuide';
import { QRScanner } from './ui/QRScanner';
import './style.css';
import { StarterZone } from './world/StarterZone';
import { GridSentinel } from './world/GridSentinel';
import { GridOmniGuard } from './core/GridOmniGuard';
import { compileGridCode } from './scripting/GridCodeRuntime';
import { GridEngine } from './engine/GridEngine';
import { ThreeGridRenderer } from './engine/ThreeGridRenderer';
import { GridSimulationClock } from './engine/GridEngineRuntime';
import { GridEngineCore } from './engine/GridEngineCore';
import { GridEntitySystem } from './engine/GridEntitySystem';
import { GridCrowdActor, type GridActorDefinition } from './world/GridCrowdActor';
import { createGridOmniGuardLayer } from './world/GridOmniGuardPylon';
import { GridVoiceSystem } from './audio/GridVoiceSystem';
import { GridAudioSystem } from './audio/GridAudioSystem';
import { createGridFreeObject } from './engine/GridFreeObjectLibrary';
import { GridTeleportSystem, createTeleportGate, createTeleportPylon } from './engine/GridTeleport';
import { GridLivingWorld } from './world/GridLivingWorld';
import { GRID_MODEL_SOURCES } from './engine/GridModelLibrary';
import { installGridWorldArtDirector } from './world-art-director';
import { createGridFoundationLayer } from './world/GridFoundationLayer';
import { mountTeamArea } from './ui/TeamArea';
import { createWorldSkinDirector } from './world/WorldSkinDirector';
import { createTeamWorkSystem } from './world/TeamWorkSystem';
import { CreatureEcologySystem, type EcologyWorld } from './world/CreatureEcologySystem';
import { NPCSocietySystem } from './world/NPCSocietySystem';
import { RelationshipStorySystem } from './world/RelationshipStorySystem';
import { TraversalSystem } from './world/TraversalSystem';
import { QuestSystem } from './world/QuestSystem';
import { CombatSystem } from './world/CombatSystem';
import { DynamicQuestSystem } from './world/DynamicQuestSystem';
import { WorldConsequenceSystem } from './world/WorldConsequenceSystem';
import { mountQuestPanel } from './ui/QuestPanel';

const app = document.querySelector<HTMLDivElement>('#app')!;
let identity = loadOrCreateIdentity();
const persistence = new Persistence();
const cloudPersistence = supabaseConfigured ? new SupabasePersistence(SUPABASE_URL!, SUPABASE_PUBLISHABLE_KEY!) : null;

type HudTheme = 'cyan' | 'violet' | 'magenta' | 'emerald' | 'amber' | 'white';
const HUD_THEME_KEY = 'grid-world:hud-theme';
const hudTheme = (localStorage.getItem(HUD_THEME_KEY) as HudTheme | null) ?? 'cyan';
document.documentElement.dataset.hudTheme = hudTheme;
type UIStyle = 'luminous' | 'slate' | 'signal' | 'ember';
const UI_STYLE_KEY = 'grid-world:ui-style';
const uiStyle = (localStorage.getItem(UI_STYLE_KEY) as UIStyle | null) ?? 'luminous';
document.documentElement.dataset.uiStyle = uiStyle;

const hud = document.createElement('div');
hud.className = 'hud';
hud.innerHTML = `
  <div class="hud-frame hud-frame-top"></div>
  <div class="hud-frame hud-frame-bottom"></div>
  <div class="hud-topbar" aria-label="Grid runtime status">
    <div class="hud-system"><span class="hud-signal"></span><b>GRID ENGINE 0.1</b><small>FIRST LIGHT</small></div>
    <div class="hud-telemetry"><span>WORLD <b id="hud-world-state">ONLINE</b></span><span>TRANSIT <b>READY</b></span><span>OMNI <b>GUARDED</b></span><span>SIGNAL <b id="hud-world-signal">SYNC</b></span></div>
  </div>
  <div class="crosshair"><span></span></div>
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
        <button type="button" data-avatar="navigator">Navigator</button>
        <button type="button" data-avatar="muse">Muse</button>
        <button type="button" data-avatar="explorer">Explorer</button>
        <button type="button" data-avatar="builder">Builder</button>
        <button type="button" data-avatar="scholar">Scholar</button>
        <button type="button" data-avatar="sentinel">Sentinel</button>
        <button type="button" data-avatar="wanderer">Wanderer</button>
        <button type="button" data-avatar="artist">Artist</button>
        <button type="button" data-avatar="ranger">Ranger</button>
        <button type="button" data-avatar="architect">Architect</button>
        <button type="button" data-avatar="guardian">Guardian</button>
        <button type="button" data-avatar="signal">Signal</button>
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
      <div class="avatar-label">Interface style</div>
      <div class="ui-style-options" id="ui-style-options">
        <button type="button" data-ui-style="luminous">Luminous</button>
        <button type="button" data-ui-style="slate">Slate</button>
        <button type="button" data-ui-style="signal">Signal</button>
        <button type="button" data-ui-style="ember">Ember</button>
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
  <div class="grid-dock" aria-label="Grid World tools">
    <button type="button" data-tool="profile"><b>◎</b><span>PROFILE</span></button>
    <button type="button" data-tool="inventory"><b>▣</b><span>INVENTORY</span></button>
    <button type="button" data-tool="wallet"><b>◉</b><span>WALLET</span></button>
    <button type="button" data-tool="map"><b>◇</b><span>MAP</span></button>
    <button type="button" data-tool="field"><b>⌖</b><span>FIELD</span></button>
    <button type="button" data-tool="qr"><b>▧</b><span>QR</span></button>
    <button type="button" data-tool="build"><b>✦</b><span>BUILD</span></button>
    <button type="button" data-tool="team"><b>⌂</b><span>TEAM</span></button><button type="button" data-tool="settings"><b>⚙</b><span>SETTINGS</span></button>
  </div>
  <div class="target-card" id="target-card">
    <div class="target-kicker">OBJECT PROFILE</div>
    <div class="target-title" id="target-title">First Light Beacon</div>
    <div class="target-meta" id="target-meta">LANDMARK · DISCOVERED · LEVEL 02</div>
    <div class="target-bars"><span><i style="width:78%"></i> HISTORY</span><span><i style="width:62%"></i> RESONANCE</span><span><i style="width:91%"></i> VISIBILITY</span></div>
  </div>
  <section class="chat" id="chat" aria-label="Grid World chat">
    <div class="chat-header"><span>GRID CHAT</span><span id="chat-status">LOCAL</span></div>
    <div class="chat-messages" id="chat-messages" aria-live="polite"></div>
    <form class="chat-compose" id="chat-compose">
      <input id="chat-input" maxlength="240" autocomplete="off" placeholder="Say something…" aria-label="Chat message" />
      <button type="button" id="voice-target" aria-label="Speak to the current target">MIC</button><button type="submit" aria-label="Send message">SEND</button>
    </form>
  </section>
  <div class="status" id="status">FIRST LIGHT · Connecting…</div>
`;
app.appendChild(hud);
const status = document.querySelector<HTMLDivElement>('#status')!;
const chatMessages = document.querySelector<HTMLDivElement>('#chat-messages')!;
const chatCompose = document.querySelector<HTMLFormElement>('#chat-compose')!;
const chatInput = document.querySelector<HTMLInputElement>('#chat-input')!;
const voiceTargetButton = document.querySelector<HTMLButtonElement>('#voice-target')!;
const voice = new GridVoiceSystem();
const audio = new GridAudioSystem();

function addChatMessage(sender: string, message: string, kind: 'player' | 'system' | 'team' = 'player') {
  if (kind !== 'player') audio.play('chat.receive');
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

addChatMessage('GRID', 'Welcome to First Light. Chat is ready. MIC speaks to the object, NPC, or team member in your crosshair.', 'system');


function respondToVoiceTarget(utterance: string) {
  const target = interaction.findTarget();
  const text = utterance.trim();
  if (!target) {
    addChatMessage('GRID', 'I heard you, but there is no target in your crosshair.', 'system');
    audio.play('ui.error');
    voice.speak('grid', 'I heard you, but there is no target in your crosshair.');
    return;
  }

  const npcBrain = target.object.userData.gridNpcBrain as {
    remember?: (memory: { subjectId?: string; eventType: string; summary: string; valence: number; importance: number; confidence: number }) => void;
    thought?: () => string;
  } | undefined;

  if (npcBrain?.remember) {
    const npcId = target.object.userData.gridActorId as string | undefined;
    npcBrain.remember({
      subjectId: identity.id,
      eventType: 'voice-interaction',
      summary: identity.displayName + ' said: ' + text,
      valence: .35,
      importance: .72,
      confidence: .94,
    });
    const response = npcBrain.thought?.() ?? 'I heard you.';
    addChatMessage(target.name, response, 'team');
    voice.speak(npcId ?? 'grid', response);
    return;
  }

  const teamAvatarId = target.object.userData.teamAvatarId as string | undefined;
  if (teamAvatarId) {
    const teamAvatar = teamAvatars.find(avatar => avatar.definition.id === teamAvatarId);
    if (teamAvatar) {
      const response = teamAvatar.interact(text);
      addChatMessage(teamAvatar.definition.displayName, response, 'team');
      voice.speak(teamAvatarId, response);
      return;
    }
  }

  const objectId = String(target.object.userData.gridObjectId ?? '').toLowerCase();
  const lower = text.toLowerCase();
  let response = target.name + ' acknowledges the request.';

  if (objectId.includes('beacon') || lower.includes('beacon') || target.name.toLowerCase().includes('beacon')) {
    const material = target.object instanceof THREE.Mesh ? target.object.material : null;
    if (material instanceof THREE.MeshStandardMaterial) material.emissiveIntensity = lower.includes('off') ? .15 : 2.8;
    response = lower.includes('off') ? 'Beacon power reduced. The signal is now quiet.' : 'Beacon awakened. Its signal is now broadcasting locally.';
  } else if (objectId.includes('neon-door') || target.name.toLowerCase().includes('neon door')) {
    response = lower.includes('open') ? 'The Neon Door accepts the request and opens its scripted state.' : lower.includes('close') ? 'The Neon Door returns to its closed state.' : 'The Neon Door is listening for an open or close instruction.';
    scriptedObjects.dispatch(target.object, 'player interacts');
  } else if (objectId.includes('terrain') || target.name.toLowerCase().includes('terrain')) {
    response = 'Terrain profile: Grid Measurement is active. The land is being treated as a measurable world system.';
  } else if (target.object.userData.gridFreeObject) {
    response = lower.includes('inspect') || lower.includes('what') ? target.name + ' is a Grid World original object with a stable profile and provenance.' : target.name + ' responds through the Grid interaction layer.';
    scriptedObjects.dispatch(target.object, 'player interacts');
  } else {
    scriptedObjects.dispatch(target.object, 'player interacts');
  }

  addChatMessage(target.name, response, 'team');
  voice.speak('grid', response);
}

voiceTargetButton.addEventListener('click', async () => {
  if (!voice.isSpeechInputAvailable()) {
    addChatMessage('GRID', 'Speech input is not available in this browser. Text chat remains active.', 'system');
    return;
  }
  audio.play('ui.focus');
  voiceTargetButton.textContent = 'LISTENING…';
  const transcript = await voice.listenOnce();
  voiceTargetButton.textContent = 'MIC';
  if (!transcript) {
    addChatMessage('GRID', 'No speech was captured. Try again or use text chat.', 'system');
    return;
  }
  addChatMessage(identity.displayName, transcript, 'player');
  respondToVoiceTarget(transcript);
});

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
const foundationLayer = createGridFoundationLayer();
world.scene.add(foundationLayer.root);
const teamArea = mountTeamArea();
const questButton = document.createElement('button'); questButton.className='toolbar-button'; questButton.textContent='QUESTS'; questButton.type='button'; questButton.addEventListener('click',()=>questPanel.open()); document.body.appendChild(questButton);
const artDirector = installGridWorldArtDirector(world.scene);
const worldSkins = createWorldSkinDirector();
world.scene.add(worldSkins.root);
const engine = new GridEngine('client', world.scene);
engine.register(new GridEngineCore());
engine.register(new GridEntitySystem());
engine.register(new GridSimulationClock());
const teleportSystem = new GridTeleportSystem();
engine.register(teleportSystem);
const starterZone = new StarterZone();
const livingWorld = new GridLivingWorld();
const creatureEcology = new CreatureEcologySystem();
const npcSociety = new NPCSocietySystem();
const relationshipStories = new RelationshipStorySystem();
const traversalSystem = new TraversalSystem();
const questSystem = new QuestSystem(identity.id);
const dynamicQuestSystem = new DynamicQuestSystem(questSystem);
const worldConsequences = new WorldConsequenceSystem();
const questPanel = mountQuestPanel(questSystem);
let lastStoryId = '';
let lastCombatKills = 0;
let lastConsequenceId = '';
world.scene.add(livingWorld.root);
world.scene.add(creatureEcology.root);
world.scene.add(npcSociety.root);
world.scene.add(relationshipStories.root);
world.scene.add(traversalSystem.root);
world.scene.add(questSystem.root);
world.scene.add(dynamicQuestSystem.root);
world.scene.add(worldConsequences.root);
world.scene.add(starterZone.group);
const omniGuard = new GridOmniGuard();
const sentinels = [new GridSentinel('Omni Sentinel · First Light')];
for (const sentinel of sentinels) world.scene.add(sentinel.group);

const omniLayer = createGridOmniGuardLayer();
world.scene.add(omniLayer.root);

const crowdDefinitions: GridActorDefinition[] = [
  { id: 'npc.market-broker', displayName: 'Mira Vale', kind: 'npc', role: 'Market Broker', color: 0x4f86b7, accent: 0x68d9ff, spawn: { x: -8, z: -4 }, chatLines: ['The market is quiet enough to browse.', 'I just received three new creator listings.'] },
  { id: 'npc.gallery-curator', displayName: 'Elder Vell', kind: 'npc', role: 'Gallery Curator', color: 0x806aa8, accent: 0xc6a6ff, spawn: { x: -15, z: -24 }, chatLines: ['The new gallery wall is ready.', 'Leave room for artists to surprise us.'] },
  { id: 'npc.city-guide', displayName: 'Lyra', kind: 'npc', role: 'City Guide', color: 0x4f9a83, accent: 0x73e6c4, spawn: { x: 7, z: -4 }, chatLines: ['The Creator Yard connects to the east bridge.', 'First Light is easier to learn one district at a time.'] },
  { id: 'npc.builder', displayName: 'Mako', kind: 'npc', role: 'Builder', color: 0xa36e50, accent: 0xffc27d, spawn: { x: 15, z: -5 }, chatLines: ['I am testing a smaller building footprint.', 'The block grid makes expansion predictable.'] },
  { id: 'npc.archivist', displayName: 'Sera', kind: 'npc', role: 'Archive Keeper', color: 0x60758b, accent: 0x8ed9e8, spawn: { x: 0, z: 17 }, chatLines: ['Every important object needs a history.', 'Snapshots make experiments safer.'] },
  { id: 'npc.courier', displayName: 'Juno', kind: 'npc', role: 'World Courier', color: 0xb27b48, accent: 0xffd36a, spawn: { x: 8, z: 10 }, chatLines: ['Packages move between districts all day.', 'The bridge route is clear.'] },
  { id: 'animal.grid-wolf', displayName: 'Lumen Wolf', kind: 'animal', role: 'Wildlife · Curious', color: 0x53657a, accent: 0x76eaff, spawn: { x: 16, z: -25 }, speed: .8 },
  { id: 'animal.moss-fox', displayName: 'Moss Fox', kind: 'animal', role: 'Wildlife · Shy', color: 0x8b6650, accent: 0x9cf2c1, spawn: { x: 21, z: -28 }, speed: .65 },
  { id: 'animal.prism-bird', displayName: 'Prism Bird', kind: 'animal', role: 'Wildlife · Flyer', color: 0x6376a5, accent: 0xffb9ee, spawn: { x: -20, z: -25 }, speed: .95 },
  { id: 'animal.tide-deer', displayName: 'Tide Deer', kind: 'animal', role: 'Wildlife · Gentle', color: 0x7f745e, accent: 0x7fe9ff, spawn: { x: 25, z: -22 }, speed: .55 },
];

const gridOriginalObjects = [
  ['grid-wayfinder-lamp', -5, -8],
  ['grid-profile-prism', 5, -8],
  ['grid-creator-bench', 18, -2],
  ['grid-gallery-plinth', -20, -24],
  ['grid-signal-beacon', 0, -7],
] as const;
for (const [objectId, x, z] of gridOriginalObjects) {
  const object = createGridFreeObject(objectId);
  object.position.set(x, 0, z);
  world.scene.add(object);
}

const teleportDefinitions = [
  {
    id: 'gate:civic-to-gallery',
    kind: 'gate' as const,
    displayName: 'Civic Gate · Gallery Row',
    regionId: 'first-light',
    position: { x: 0, y: 0, z: 16 },
    yaw: 0,
    clearanceRadius: 3,
    destinationIds: ['pylon:gallery'],
    access: 'public' as const,
  },
  {
    id: 'pylon:gallery',
    kind: 'pylon' as const,
    displayName: 'Gallery Pylon · Civic Return',
    regionId: 'first-light',
    position: { x: -25, y: 0, z: -26 },
    yaw: Math.PI / 2,
    clearanceRadius: 3,
    destinationIds: ['gate:civic-to-gallery'],
    access: 'public' as const,
  },
  {
    id: 'gate:wilds-to-creator',
    kind: 'gate' as const,
    displayName: 'Wilds Gate · Creator Yard',
    regionId: 'first-light',
    position: { x: 0, y: 0, z: -18 },
    yaw: Math.PI,
    clearanceRadius: 3,
    destinationIds: ['pylon:creator'],
    access: 'public' as const,
  },
  {
    id: 'pylon:creator',
    kind: 'pylon' as const,
    displayName: 'Creator Pylon · Wilds Return',
    regionId: 'first-light',
    position: { x: 25, y: 0, z: -3 },
    yaw: -Math.PI / 2,
    clearanceRadius: 3,
    destinationIds: ['gate:wilds-to-creator'],
    access: 'public' as const,
  },
  {
    id: 'pylon:market',
    kind: 'pylon' as const,
    displayName: 'Market Pylon · Civic Gate',
    regionId: 'first-light',
    position: { x: -25, y: 0, z: 4 },
    yaw: Math.PI / 2,
    clearanceRadius: 3,
    destinationIds: ['gate:civic-to-gallery'],
    access: 'public' as const,
  },
  {
    id: 'pylon:wilds',
    kind: 'pylon' as const,
    displayName: 'Wilds Pylon · Wilds Gate',
    regionId: 'first-light',
    position: { x: 25, y: 0, z: -26 },
    yaw: -Math.PI / 2,
    clearanceRadius: 3,
    destinationIds: ['gate:wilds-to-creator'],
    access: 'public' as const,
  },
] as const;

const teleportVisuals = teleportDefinitions.map(definition => {
  teleportSystem.register(definition);
  const visual = definition.kind === 'gate'
    ? createTeleportGate(definition)
    : createTeleportPylon(definition);
  world.scene.add(visual);
  return visual;
});

const crowdActors = crowdDefinitions.map(definition => new GridCrowdActor(definition));
for (const actor of crowdActors) world.scene.add(actor.group);

const npcChatPairs = [
  ['Mira Vale', 'Elder Vell', 'The market is quiet enough to browse.', 'Good. Artists need space before the crowd arrives.'],
  ['Lyra', 'Mako', 'The Creator Yard connects to the east bridge.', 'And the block grid keeps the next expansion sane.'],
  ['Sera', 'Juno', 'Every important object needs a history.', 'Then I will make sure the courier routes preserve the delivery record.'],
  ['Mira Vale', 'Lyra', 'I just received three new creator listings.', 'Point me to the new ones. I want to see what people are making.'],
] as const;
let npcChatIndex = 0;
let npcChatTimer = 5;


const gridHealth = {
  measurement: true,
  starterZone: true,
  omniSecurity: true,
  sentinelResponse: true,
  gridCode: true,
  teleportation: teleportSystem.all().length === teleportDefinitions.length,
};
const healthStars = Object.values(gridHealth).filter(Boolean).length;
addChatMessage('AURORA', 'World pass: First Light is now organized as connected districts with terrain, bridges, wildlife, and creator space.', 'team');
addChatMessage('ATLAS', 'Simulation pass: NPCs now have needs, utility-based autonomy, memories, relationships, cooldowns, and bounded behavior.', 'team');
addChatMessage('TESSERA', 'Materials pass: the PBR library now catalogs CC0 sources and supplies lightweight starter materials for world and avatars.', 'team');
addChatMessage('WAYPOINT', 'Ecology pass: terrain, water, vegetation, wildlife habitats, and traversal are now treated as one regional system.', 'team');
addChatMessage('LINK', 'Architecture pass: the new systems stay behind replaceable Grid Engine contracts so the renderer and asset pipeline can evolve.', 'team');
addChatMessage('GRID OMNI', 'System health ' + healthStars + '/6 ★ · Grid Measurement active · Teleport network online · First Light starter zone assigned.', 'system');
addChatMessage('AURORA', 'Transit pass: Teleportation Gates and Teleport Pylons are now addressable Grid objects with guarded destinations and cooldowns.', 'team');
addChatMessage('TESSERA', GRID_MODEL_SOURCES.length + ' curated CC0/Grid-original model targets are mapped across buildings, avatars, animals, plants, and trees; live fallbacks keep First Light populated.', 'system');

const automaticHouseScript = `<House id="starter-home" scale="5">
  <Notify value="Starter zone systems online." />
  <Show target="welcome-beacon" />
  <Set target="measurement" value="Grid Measurement" />
</House>`;
try {
  compileGridCode(automaticHouseScript);
} catch (error) {
  console.warn('Automatic Grid Code validation failed.', error);
}
const input = new Input();
const player = new PlayerController(input);
const combatSystem = new CombatSystem();
world.scene.add(combatSystem.root);
combatSystem.register({id:identity.id,faction:'PLAYER',root:player.avatar,maxHealth:100,damage:18,range:2.7,respawnPosition:new THREE.Vector3(0,0,7)});
world.scene.add(player.avatar);

const savedState = persistence.loadPlayerState();
if (savedState) player.restoreTransform(savedState);
else player.restoreTransform({
  x: starterZone.definition.spawn.x,
  y: starterZone.definition.spawn.y,
  z: starterZone.definition.spawn.z,
  yaw: 0,
});
player.setAvatarStyle(identity.avatarStyle);

let cloudIdentity = identity;
const remotePlayers = new Map<string, RemotePlayer>();
const teamAvatars = TEAM_AVATARS.map(definition => new TeamAvatar(definition));
for (const avatar of teamAvatars) world.scene.add(avatar.group);
const teamWork = createTeamWorkSystem(teamAvatars);
world.scene.add(teamWork.root);

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
    ...teleportSystem.all().map(node => ({ id: node.id, x: node.position.x, z: node.position.z, kind: 'teleport' as const })),
  ],
});
hud.appendChild(minimap.element);
const fieldGuide = new FieldGuide();
const qrScanner = new QRScanner();

const windowManager = new WindowManager();
const uiMods = new UIModRegistry(windowManager);

const uiEditButton = document.createElement('button');
uiEditButton.type = 'button';
uiEditButton.className = 'ui-edit-button';
uiEditButton.textContent = '◇ UI';
uiEditButton.title = 'Arrange Grid World interface';
uiEditButton.addEventListener('click', () => {
  const editing = windowManager.toggleEditMode();
  uiEditButton.classList.toggle('active', editing);
  uiEditButton.textContent = editing ? '◇ UI · ARRANGE' : '◇ UI';
});
hud.appendChild(uiEditButton);

const uiResetButton = document.createElement('button');
uiResetButton.type = 'button';
uiResetButton.className = 'ui-reset-button';
uiResetButton.textContent = 'RESET';
uiResetButton.hidden = true;
uiResetButton.addEventListener('click', () => windowManager.resetLayout());
hud.appendChild(uiResetButton);

windowManager.register({
  id: 'grid-chat',
  title: 'Grid Chat',
  element: chatMessages.parentElement!,
  defaultPosition: { x: 0, y: 0 },
  movable: true,
  resizable: true,
});

windowManager.register({
  id: 'world-minimap',
  title: 'World Map',
  element: minimap.element,
  defaultPosition: { x: 0, y: 0 },
  movable: true,
  resizable: true,
});

uiMods.register({
  id: 'core-interface',
  name: 'Grid World Core Interface',
  version: '0.1.0',
  enabledByDefault: true,
  mount: () => undefined,
});

uiEditButton.addEventListener('click', () => {
  uiResetButton.hidden = !windowManager.isEditMode();
});

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

let combatAuthority: GridCombatAuthority | null = null;
const worldEventStream = cloudPersistence ? new GridWorldEventStream(cloudPersistence.getClient()) : null;
let worldEventPollTimer = 0;
let lastRemoteWorldEventId = '';

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
        combatAuthority = new GridCombatAuthority(cloudPersistence.getClient());
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

void cloudReady.then(async () => {
  if (!cloudPersistence) return;
  try {
    const { data, error } = await cloudPersistence.getClient()
      .from('grid_npc_memories')
      .select('id,npc_id,event_type,summary,valence,importance,confidence,memory_at')
      .eq('visibility', 'public')
      .order('memory_at', { ascending: false })
      .limit(120);
    if (error) throw error;
    for (const memory of data ?? []) {
      const actor = crowdActors.find(item => item.definition.id === memory.npc_id);
      actor?.brain.hydrateMemories([{
        id: memory.id,
        eventType: memory.event_type,
        summary: memory.summary,
        valence: Number(memory.valence),
        importance: Number(memory.importance),
        confidence: Number(memory.confidence),
        createdAt: memory.memory_at,
      }]);
    }
    addChatMessage('GRID MEMORY', 'Public NPC memory archive synchronized.', 'system');

    const { data: remoteTeleportNodes, error: teleportError } = await cloudPersistence.getClient()
      .from('grid_teleport_nodes')
      .select('id,node_kind,display_name,region_id,x,y,z,yaw,destination_ids,clearance_radius,access,status,cooldown_seconds')
      .eq('status', 'online');
    if (teleportError) throw teleportError;

    for (const node of remoteTeleportNodes ?? []) {
      if (teleportSystem.get(node.id)) continue;
      const definition = {
        id: node.id,
        kind: node.node_kind as 'gate' | 'pylon',
        displayName: node.display_name,
        regionId: node.region_id,
        position: { x: Number(node.x), y: Number(node.y), z: Number(node.z) },
        yaw: Number(node.yaw),
        clearanceRadius: Number(node.clearance_radius),
        destinationIds: Array.isArray(node.destination_ids) ? node.destination_ids : [],
        access: node.access as 'public' | 'friends' | 'owner',
        status: node.status as 'online' | 'guarded' | 'offline',
        cooldownSeconds: Number(node.cooldown_seconds),
      };
      teleportSystem.register(definition);
      const visual = definition.kind === 'gate'
        ? createTeleportGate(definition)
        : createTeleportPylon(definition);
      world.scene.add(visual);
      teleportVisuals.push(visual);
    }
    if ((remoteTeleportNodes?.length ?? 0) > 0) {
      addChatMessage('GRID TRANSIT', 'Persistent teleport nodes synchronized from Grid Omni World.', 'system');
    }
  } catch (error) {
    console.warn('NPC memory or teleport archive unavailable; local systems remain active.', error);
  }
});

let multiplayerLabel = 'MULTIPLAYER · Connecting…';

function handleTeleportNode(result: ReturnType<InteractionSystem['findTarget']>) {
  if (!result) return false;
  const nodeId = result.object.userData.gridTeleportNodeId as string | undefined;
  if (!nodeId) return false;

  const teleport = teleportSystem.request({
    actorId: cloudIdentity.id,
    nodeId,
    nowSeconds: performance.now() / 1000,
    relationship: 'public',
  });

  if (!teleport.ok || !teleport.destination) {
    const message = teleport.reason === 'cooldown'
      ? 'Teleport gate is recharging.'
      : teleport.reason === 'access-denied'
        ? 'This teleport node is access controlled.'
        : 'Teleport destination is unavailable; Grid Omni is holding the route.';
    prompt.textContent = 'E · ' + message;
    addChatMessage('GRID OMNI', message, 'system');
    audio.play('ui.error');
    return true;
  }

  const destination = teleport.destination;
  const arrival = new THREE.Vector3(destination.position.x, Math.max(0, destination.position.y), destination.position.z);
  const backward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), destination.yaw);
  arrival.addScaledVector(backward, Math.max(2.5, destination.clearanceRadius));
  player.restoreTransform({
    x: arrival.x,
    y: arrival.y,
    z: arrival.z,
    yaw: destination.yaw,
  });
  audio.play('world.portal', 1);
  prompt.textContent = 'E · Arrived at ' + destination.displayName + ' ✓';
  addChatMessage('GRID TRANSIT', 'Arrived at ' + destination.displayName + '. Safe arrival clearance applied.', 'system');
  if (cloudPersistence) {
    cloudPersistence.getClient().from('grid_teleport_events').insert({
      actor_id: cloudIdentity.id,
      source_node_id: teleport.sourceNodeId ?? null,
      destination_node_id: destination.id,
      result: 'teleported',
      metadata: { regionId: destination.regionId, client: 'grid-world-web' },
    }).then(({ error }) => {
      if (error) console.warn('Teleport event archive unavailable.', error);
    });
  }
  presence?.update(player.getTransform()).catch(console.error);
  savePlayer();
  return true;
}

function handleOmniSignal(kind: string, severity: 'info'|'notice'|'warning'|'critical', message: string) {
  const decision = omniGuard.evaluate({ source: 'grid-world-client', kind, severity });
  addChatMessage('GRID OMNI', message + ' ' + decision.userMessage, 'system');
  if (severity === 'warning' || severity === 'critical') {
    for (const sentinel of sentinels) sentinel.respond(player.avatar.position);
  }
  return decision;
}

function setControlStatus() {
  status.textContent = `FIRST LIGHT · ${identity.displayName} · WASD move · Shift sprint · Space jump · E interact · F attack · P PVP/PVE · V camera`;
}

function setMultiplayerStatus(label: string) {
  multiplayerLabel = label;
  status.textContent = `FIRST LIGHT · ${label}`;
}

cloudReady.finally(() => {
  if (multiplayerLabel === 'MULTIPLAYER · Connecting…') setControlStatus();

document.querySelectorAll<HTMLButtonElement>('.grid-dock [data-tool]').forEach(button => {
  button.addEventListener('click', () => {
    const tool = button.dataset.tool;
    if (tool === 'profile') openIdentityPanel();
    else if (tool === 'build') creatorPanel.classList.add('open');
    else if (tool === 'map') minimap.element.classList.toggle('grid-highlight');
    else if (tool === 'field') fieldGuide.open();
    else if (tool === 'qr') qrScanner.open();
    else if (tool === 'settings') openIdentityPanel();
    else addChatMessage('GRID', tool === 'wallet' ? 'Wallet surface opened. Balance and exchange are in prototype mode.' : 'Inventory surface opened. Creator objects will appear here as the inventory service lands.', 'system');
  });
});
});

window.setTimeout(() => handleOmniSignal('starter-zone-ready', 'info', 'Starter zone security presence is active.'), 700);
window.setInterval(() => {
  const watched = omniLayer.pylons[Math.floor(Math.random() * omniLayer.pylons.length)];
  const diagnosis = watched.diagnose();
  if (diagnosis.status === 'clear') addChatMessage('GRID OMNI', watched.group.userData.interactionName + ' · preflight clear.', 'system');
}, 15000);

const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 500);
camera.position.set(0, 3.2, 7);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
app.appendChild(renderer.domElement);
engine.setRenderer(new ThreeGridRenderer(renderer));
void engine.start();

const interaction = new InteractionSystem(camera, world.scene);

const teamTool = document.querySelector<HTMLButtonElement>('[data-tool="team"]');
teamTool?.addEventListener('click', () => teamArea.open());
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
windowManager.register({
  id: 'creator-console',
  title: 'Creator Console',
  element: creatorPanel.querySelector('.creator-card')!,
  defaultPosition: { x: 0, y: 0 },
  movable: true,
  resizable: true,
});

windowManager.register({
  id: 'traveler-profile',
  title: 'Traveler Profile',
  element: identityPanel.querySelector('.identity-card')!,
  defaultPosition: { x: 0, y: 0 },
  movable: true,
  resizable: true,
});



windowManager.setEditMode(false);

function openIdentityPanel() {
  identityName.value = identity.displayName;
  document.querySelectorAll<HTMLButtonElement>('[data-ui-style]').forEach(button => {
    button.classList.toggle('selected', button.dataset.uiStyle === document.documentElement.dataset.uiStyle);
  });
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

document.querySelectorAll<HTMLButtonElement>('[data-ui-style]').forEach(button => {
  button.addEventListener('click', () => {
    const style = button.dataset.uiStyle as UIStyle;
    document.documentElement.dataset.uiStyle = style;
    localStorage.setItem(UI_STYLE_KEY, style);
    document.querySelectorAll('[data-ui-style]').forEach(option => option.classList.toggle('selected', option === button));
  });
});

avatarOptions.addEventListener('click', event => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-avatar]');
  if (!button) return;
  identity = { ...identity, avatarStyle: button.dataset.avatar as typeof identity.avatarStyle };
  player.setAvatarStyle(identity.avatarStyle);
  writeVersioned('grid-world:identity', 1, identity);
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
let creatureCombatSyncTimer = 0;
let creatureCombatStateTimer = 0;
let creatureAttackTimer = 0;

function savePlayer() {
  const transform = player.getTransform();
  const state = {
    ...transform,
    regionId: 'first-light',
    updatedAt: new Date().toISOString(),
  };
  state.regionId = world.regions.findAt(transform.x, transform.z)?.definition.id ?? 'unmapped';
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

  if (event.code === 'KeyP' && !event.repeat) {
    const next=combatSystem.getMode()==='PVP'?'PVE':'PVP';
    if (combatAuthority) {
      combatAuthority.setMode(next).then(result => {
        const applied=result?.mode ?? next;
        combatSystem.setMode(applied);
        if (result?.allowed === false) {
          addChatMessage('COMBAT', 'PVP is restricted to the Grid Arena. Returning to ' + applied + ' mode.', 'system');
          audio.play('ui.error');
        } else {
          addChatMessage('COMBAT', applied + ' mode confirmed by Grid Authority.', 'system');
          audio.play('ui.confirm');
        }
      }).catch(error => {
        console.warn('Authoritative combat mode change failed.', error);
        addChatMessage('COMBAT', 'Combat authority is unavailable; staying in ' + combatSystem.getMode() + ' mode.', 'system');
        audio.play('ui.error');
      });
    } else {
      combatSystem.setMode(next);
      addChatMessage('COMBAT', next + ' mode enabled locally. Cloud authority is unavailable.', 'system');
    }
  }

  if (event.code === 'KeyF' && !event.repeat) {
    const targetId=combatSystem.selectNearest(identity.id,3.8);
    const target = targetId ? world.scene.getObjectByProperty('userData.combatId', targetId) : null;
    const targetFaction = target?.userData.combatFaction;
    if (targetId && targetFaction==='CREATURE' && combatAuthority) {
      combatAuthority.attackCreature(targetId).then(result => {
        if (result?.ok) {
          const creature=result.creature;
          combatSystem.applyAuthoritativeCreatureState(targetId, Number(creature?.health ?? 0), Number(creature?.max_health ?? 100), !result.defeated);
          if (result.defeated) {
            const species=String(target?.userData.species ?? 'creature');
            const defeatedWorld=livingWorld.getSnapshot().world as EcologyWorld;
            questSystem.recordCombatKill(species,defeatedWorld);
            worldConsequences.recordCreatureDefeat(defeatedWorld,species);
            addChatMessage('COMBAT', species.replaceAll('-', ' ') + ' defeated. The field remembers.', 'system');
            questPanel.render();
          }
          combatSystem.applyAuthoritativeHealth(identity.id, Number(result.attacker?.health ?? 100));
          prompt.textContent=result.defeated ? 'F · Creature defeated' : 'F · Strike confirmed';
          audio.play('ui.confirm');
        } else {
          prompt.textContent='F · ' + (result?.error ?? 'No strike');
          audio.play('ui.error');
        }
      }).catch(error => {
        console.warn('Authoritative creature attack failed.', error);
        prompt.textContent='F · Authority unavailable';
        audio.play('ui.error');
      });
    } else if (targetId && combatSystem.getMode()==='PVP' && targetFaction==='PLAYER' && combatAuthority) {
      combatAuthority.attack(targetId).then(result => {
        if (result?.ok) {
          combatSystem.applyAuthoritativeHealth(targetId, Number(result.target?.health ?? 0));
          combatSystem.applyAuthoritativeHealth(identity.id, Number(result.attacker?.health ?? 100));
          prompt.textContent=result.defeated ? 'F · Target defeated' : 'F · Strike confirmed';
          audio.play('ui.confirm');
        } else {
          prompt.textContent='F · ' + (result?.error ?? 'No strike');
          audio.play('ui.error');
        }
      }).catch(error => {
        console.warn('Authoritative attack failed.', error);
        prompt.textContent='F · Authority unavailable';
        audio.play('ui.error');
      });
    } else if (targetId && combatSystem.attack(identity.id,targetId)) {
      prompt.textContent='F · Strike';
      audio.play('ui.confirm');
    } else {
      prompt.textContent='F · No target';
    }
  }

  if (event.code === 'KeyE' && !event.repeat) {
    const result = interaction.interact();
    if (result) {
      if (handleTeleportNode(result)) return;
      const questInteraction = questSystem.interact(
        result.object,
        livingWorld.getSnapshot().world as EcologyWorld,
        livingWorld.getSnapshot().event
      );
      if (questInteraction.handled) {
        prompt.textContent = `E · ${questInteraction.message}`;
        addChatMessage(String(result.name), questInteraction.message, 'team');
        audio.play('ui.confirm');
        questPanel.render();
        return;
      }
      worldConsequences.recordDiscovery(livingWorld.getSnapshot().world as EcologyWorld, 'A traveler interacted with '+result.name+'. The discovery is now part of local history.');
      prompt.textContent = `E · ${String(result.name)} ✓`;
      const npcBrain = result.object.userData.gridNpcBrain as { remember?: (memory: { subjectId?: string; eventType: string; summary: string; valence: number; importance: number; confidence: number }) => void; thought?: () => string } | undefined;
      if (npcBrain?.remember) {
        const npcId = result.object.userData.gridActorId as string | undefined;
        npcBrain.remember({
          subjectId: identity.id,
          eventType: 'player-interaction',
          summary: identity.displayName + ' interacted with me.',
          valence: .45,
          importance: .7,
          confidence: .95,
        });
        addChatMessage(result.name, npcBrain.thought?.() ?? 'I remember meeting you.', 'team');
      }
      const teamAvatarId = result.object.userData.teamAvatarId as string | undefined;
      if (teamAvatarId) {
        const teamAvatar = teamAvatars.find(avatar => avatar.definition.id === teamAvatarId);
        if (teamAvatar) prompt.textContent = `E · ${teamAvatar.definition.displayName} · ${teamAvatar.interact()}`;
      }
      audio.play('ui.confirm');
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
let lastFootstepPosition = player.avatar.position.clone();

function animate(now: number) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  presenceTimer += dt;
  saveTimer += dt;
  worldEventPollTimer += dt;

  if (worldEventStream && worldEventPollTimer >= 4) {
    worldEventStream.poll(12).then(events => {
      if (!events.length) return;
      if (!lastRemoteWorldEventId) { lastRemoteWorldEventId = events[0].id; return; }
      const fresh = [];
      for (const event of events) {
        if (event.id === lastRemoteWorldEventId) break;
        fresh.push(event);
      }
      for (const event of fresh.reverse()) addChatMessage('WORLD EVENT', event.title + ' · ' + event.summary, 'system');
      lastRemoteWorldEventId = events[0].id;
    }).catch(error => console.warn('World event stream unavailable.', error));
    worldEventPollTimer = 0;
  }

  const frame = engine.update(dt);
  player.update(dt);
  if (player.avatar.position.distanceToSquared(lastFootstepPosition) > 0.22) {
    audio.play('world.footstep', firstPerson ? .7 : .45);
    lastFootstepPosition.copy(player.avatar.position);
  }
  world.updateStreaming(player.avatar.position.x, player.avatar.position.z);
  world.update();
  livingWorld.update(dt, player.avatar.position.x, player.avatar.position.z);
  const livingSnapshot = livingWorld.getSnapshot();
  const consequenceSnapshot = worldConsequences.getSnapshot();
  creatureEcology.update(dt, player.avatar.position.x, player.avatar.position.z, livingSnapshot.world as EcologyWorld, livingSnapshot.event, livingSnapshot.phase, consequenceSnapshot);
  const ecologySnapshot = creatureEcology.getSnapshot();

  if (combatAuthority) {
    creatureCombatSyncTimer += dt;
    creatureCombatStateTimer += dt;
    creatureAttackTimer += dt;

    if (creatureCombatSyncTimer >= .65) {
      const creatures = world.scene.children
        .flatMap(root => {
          const found:THREE.Object3D[] = [];
          root.traverse(obj => {
            if (obj.userData.combatFaction === 'CREATURE' && obj.userData.combatId) found.push(obj);
          });
          return found;
        })
        .filter(obj => obj.visible)
        .slice(0, 40)
        .map(obj => ({
          id:String(obj.userData.combatId),
          species:String(obj.userData.species ?? ''),
          x:obj.position.x,
          y:obj.position.y,
          z:obj.position.z,
        }));
      combatAuthority.syncCreatures(creatures).then(result => {
        for (const state of result?.creatures ?? []) {
          combatSystem.applyAuthoritativeCreatureState(state.creature_id, Number(state.health), Number(state.max_health), Number(state.health)>0 && !(state.respawn_at && new Date(state.respawn_at).getTime()>Date.now()));
        }
      }).catch(error => console.warn('Creature combat sync failed.', error));
      creatureCombatSyncTimer=0;
    }

    if (creatureCombatStateTimer >= 1.25) {
      const creatureIds = world.scene.children.flatMap(root => {
        const found:string[]=[];
        root.traverse(obj => { if (obj.userData.combatFaction==='CREATURE' && obj.userData.combatId) found.push(String(obj.userData.combatId)); });
        return found;
      }).slice(0,60);
      combatAuthority.creatureState(creatureIds).then(result => {
        for (const state of result?.creatures ?? []) {
          const respawning=Boolean(state.respawn_at && new Date(state.respawn_at).getTime()>Date.now());
          combatSystem.applyAuthoritativeCreatureState(state.creature_id, Number(state.health), Number(state.max_health), Number(state.health)>0 && !respawning);
        }
      }).catch(error => console.warn('Creature combat state failed.', error));
      creatureCombatStateTimer=0;
    }

    if (creatureAttackTimer >= 1.45 && combatSystem.getMode()==='PVE') {
      const targetId=combatSystem.selectNearest(identity.id,2.75);
      const target=targetId ? world.scene.getObjectByProperty('userData.combatId',targetId) : null;
      if (targetId && target?.userData.combatFaction==='CREATURE') {
        combatAuthority.creatureAttack(targetId).then(result => {
          if (result?.ok) {
            combatSystem.applyAuthoritativeHealth(identity.id, Number(result.attacker?.health ?? 0));
            const species=String(target?.userData.species ?? 'creature').replaceAll('-', ' ');
            addChatMessage('COMBAT', species + ' struck back. The wilds are reacting.', 'system');
          }
        }).catch(() => undefined);
      }
      creatureAttackTimer=0;
    }
  }
  npcSociety.update(dt, player.avatar.position.x, player.avatar.position.z, livingSnapshot.world as EcologyWorld, livingSnapshot.event, livingSnapshot.phase, ecologySnapshot, consequenceSnapshot);
  const societySnapshot = npcSociety.getSnapshot();
  traversalSystem.update(dt);
  combatSystem.syncScene(world.scene);
  combatSystem.update(dt, identity.id);
  const combatSnapshot = combatSystem.getSnapshot();
  questSystem.update(dt, livingSnapshot.world as EcologyWorld, livingSnapshot.event, societySnapshot, player.avatar.position.x, player.avatar.position.z);
  if (combatSnapshot.kills > lastCombatKills) {
    const defeated = combatSnapshot.kills - lastCombatKills;
    lastCombatKills = combatSnapshot.kills;
    addChatMessage('COMBAT', defeated === 1 ? 'Hostile target defeated. The field remembers.' : defeated + ' hostile targets defeated.', 'system');
    questPanel.render();
  }
  relationshipStories.update(dt, livingSnapshot.world as EcologyWorld, livingSnapshot.event, livingSnapshot.phase, societySnapshot, player.avatar.position.x, player.avatar.position.z);
  worldConsequences.update(dt, livingSnapshot.world as EcologyWorld, livingSnapshot.event, livingSnapshot.activity, ecologySnapshot, societySnapshot);
  const consequenceSnapshotAfterUpdate = worldConsequences.getSnapshot();
  if (consequenceSnapshot.history.length > 0) {
    const latestConsequence = consequenceSnapshotAfterUpdate.history.at(-1)!;
    if (latestConsequence.id !== lastConsequenceId) {
      lastConsequenceId = latestConsequence.id;
      if (latestConsequence.kind === 'EVENT_STARTED' || latestConsequence.kind === 'CREATURE_DEFEATED' || latestConsequence.kind === 'ECOLOGY_SHIFT') addChatMessage('GRID HISTORY', latestConsequence.text, 'system');
    }
  }
  const latestStory = relationshipStories.getLatestStory();
  if (dynamicQuestSystem.update(dt, livingSnapshot.world as EcologyWorld, livingSnapshot.event, livingSnapshot.phase, societySnapshot, latestStory, player.avatar.position.x, player.avatar.position.z)) questPanel.render();
  if (latestStory && latestStory.id !== lastStoryId) {
    lastStoryId = latestStory.id;
    addChatMessage('WORLD STORY', latestStory.text, 'system');
  }
  const storySnapshot = relationshipStories.getSnapshot();
  const hudWorldState = document.querySelector<HTMLElement>('#hud-world-state');
  const hudWorldSignal = document.querySelector<HTMLElement>('#hud-world-signal');
  if (hudWorldState) hudWorldState.textContent = livingSnapshot.world + ' · ' + livingSnapshot.phase;
  if (hudWorldSignal) hudWorldSignal.textContent = livingSnapshot.event + ' · ' + livingSnapshot.weather + ' · ' + ecologySnapshot.active + '/' + ecologySnapshot.population + ' CREATURES · ' + societySnapshot.working + ' WORKING · ' + societySnapshot.talking + ' TALKING · ' + storySnapshot.activeStories + ' STORIES · STABILITY ' + Math.round(consequenceSnapshotAfterUpdate.stability*100) + '%';
  artDirector.update(dt, player.avatar.position.x, player.avatar.position.z);
  worldSkins.update(dt, player.avatar.position.x, player.avatar.position.z);
  teamWork.update(dt, frame.elapsedSeconds);
  foundationLayer.update(dt, frame.elapsedSeconds);
  for (const remote of remotePlayers.values()) remote.update(dt);
  for (const avatar of teamAvatars) avatar.update(dt);
  for (const actor of crowdActors) actor.update(dt);
  for (const pylon of omniLayer.pylons) pylon.update(dt);
  const transitTime = performance.now() / 1000;
  for (const visual of teleportVisuals) {
    visual.rotation.y += dt * 0.08;
    const energy = 1 + Math.sin(transitTime * 2.4 + visual.position.x) * .08;
    visual.scale.setScalar(energy);
  }
  npcChatTimer -= dt;
  if (npcChatTimer <= 0) {
    const [speakerA, speakerB, lineA, lineB] = npcChatPairs[npcChatIndex % npcChatPairs.length];
    audio.play('chat.receive', .7);
    const actorA = crowdActors.find(actor => actor.definition.displayName === speakerA);
    const actorB = crowdActors.find(actor => actor.definition.displayName === speakerB);
    if (actorA && actorB) {
      actorA.brain.meet(actorB.definition.id);
      actorB.brain.meet(actorA.definition.id);
      actorA.brain.remember({ subjectId: actorB.definition.id, eventType: 'conversation', summary: lineB, valence: .35, importance: .5, confidence: .9 });
      actorB.brain.remember({ subjectId: actorA.definition.id, eventType: 'conversation', summary: lineA, valence: .35, importance: .5, confidence: .9 });
    }
    addChatMessage(speakerA, lineA, 'team');
    if (actorA) voice.speak(actorA.definition.id, lineA);
    window.setTimeout(() => {
      addChatMessage(speakerB, lineB, 'team');
      if (actorB) voice.speak(actorB.definition.id, lineB);
    }, 900);
    npcChatIndex++;
    npcChatTimer = 9 + Math.random() * 7;
  }
  minimap.update();
  if (presenceTimer >= 0.25) {
    const transform = player.getTransform();
    presence?.update(transform).catch(console.error);
    combatAuthority?.sync(transform, 'first-light').then(result => {
      if (!result) return;
      if (result.state) {
        combatSystem.setMode(result.mode ?? result.state.mode);
        combatSystem.applyAuthoritativeHealth(identity.id, Number(result.state.health));
        if (!result.accepted) {
          player.restoreTransform({
            x: Number(result.state.x),
            y: Number(result.state.y),
            z: Number(result.state.z),
            yaw: Number(result.state.yaw),
          });
        }
      }
    }).catch(error => console.warn('Combat authority sync failed.', error));
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

  engine.render(camera, frame);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  engine.resize(innerWidth, innerHeight, devicePixelRatio);
});
