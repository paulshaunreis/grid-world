import * as THREE from 'three';
import { captureGridAnalytics, disableGridAnalytics, isGridAnalyticsEnabled } from './analytics';
import { mountGridAnalyticsConsent } from './ui/GridAnalyticsConsent';
import { Input } from './core/Input';
import { InteractionSystem } from './core/InteractionSystem';
import { Persistence } from './core/Persistence';
import { SupabasePersistence } from './persistence/SupabasePersistence';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabaseConfigured } from './persistence/config';
import { loadOrCreateIdentity } from './core/PlayerIdentity';
import { writeVersioned } from './core/VersionedStorage';
import { GridWorldSnapshotManager } from './core/GridWorldSnapshotManager';
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
import { installGridAssetHealth } from './core/GridAssetHealthSystem';
import { installGridHealthMonitor } from './core/GridHealthMonitor';
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
import { GridTeleportSystem, createTeleportGate, createTeleportPylon, setTeleportGateState, applyTeleportTraffic } from './engine/GridTeleport';
import { GridLivingWorld } from './world/GridLivingWorld';
import { GRID_MODEL_SOURCES } from './engine/GridModelLibrary';
import { installGridWorldArtDirector } from './world-art-director';
import { createGridFoundationLayer } from './world/GridFoundationLayer';
import { mountTeamArea } from './ui/TeamArea';
import { createWorldSkinDirector } from './world/WorldSkinDirector';
import { createTeamWorkSystem } from './world/TeamWorkSystem';
import { GridSecuritySystem } from './core/GridSecuritySystem';
import { CreatureEcologySystem, type EcologyWorld } from './world/CreatureEcologySystem';
import { NPCSocietySystem } from './world/NPCSocietySystem';
import { hourOfDayFromDayFraction, resolveNpcRoutine, routinePhaseFor } from './npc/NpcDailyRoutine';
import { RelationshipStorySystem } from './world/RelationshipStorySystem';
import { TraversalSystem } from './world/TraversalSystem';
import { QuestSystem } from './world/QuestSystem';
import { CombatSystem } from './world/CombatSystem';
import { DynamicQuestSystem } from './world/DynamicQuestSystem';
import { WorldConsequenceSystem } from './world/WorldConsequenceSystem';
import { mountQuestPanel } from './ui/QuestPanel';
import { WorldResourceSystem } from './world/WorldResourceSystem';
import { mountWorldAtlas } from './ui/WorldAtlas';
import { mountMarketPanel } from './ui/MarketPanel';
import { mountTransitPanel } from './ui/TransitPanel';
import { WorldArchitectureSystem } from './world/WorldArchitectureSystem';
import { WorldEnvironmentSystem } from './world/WorldEnvironmentSystem';
import { GridMatterTerrainSystem } from './world/GridMatterTerrainSystem';
import { GridMineralSystem, GRID_MINERALS, type GridMineralKind } from './world/GridMineralSystem';
import { WorldEvolutionSystem } from './world/WorldEvolutionSystem';
import { EvolutionaryPopulationSystem } from './world/EvolutionaryPopulationSystem';
import { EcologicalWebSystem } from './world/EcologicalWebSystem';
import { EcologicalInteractionSystem } from './world/EcologicalInteractionSystem';
import { getWorld, getWorlds, getWorldConnections, connectWorld, registerNetworkWorld, getWorldCenter, getWorldCapabilities } from './world/GridWorldRegistry';
import { districtAt, WORLD_TO_REGION } from './theme/districtZones';
import { GridChakraSystem } from './world/GridChakraSystem';
import { GridAlchemySystem } from './world/GridAlchemySystem';
import { GridKarmaSystem } from './world/GridKarmaSystem';
import { createWorldFromDescription, connectFactoryWorldToAll } from './world/WorldFactory';
import { mountWorldFactoryPanel } from './ui/WorldFactoryPanel';
import { mountCreatorStudio } from './ui/CreatorStudio';
import { mountGridEconomyPanel } from './ui/GridEconomyPanel';
import { GridAuthService } from './auth/GridAuthService';
import { mountGridAuthPanel } from './ui/GridAuthPanel';
import { GridSocialService } from './social/GridSocialService';
import { GridProfileService } from './social/GridProfileService';
import { GridProfileAuthority } from './social/GridProfileAuthority';
import { GridWorldAuthority } from './social/GridWorldAuthority';
import { GridWorldContentAuthority } from './social/GridWorldContentAuthority';
import { mountGridCommunityPanel } from './ui/GridCommunityPanel';
import { GridVoiceModifierSystem } from './audio/GridVoiceModifierSystem';
import type { GridAgeBand } from './social/GridContentAccess';
import { GridOperatorService } from './operator/GridOperatorService';
import { GridOperatorPresence } from './world/GridOperatorPresence';
import type { WorldPulseHealth, WorldPulseSnapshot } from './world/WorldPulseDiagnostics';
import { GridGuardCommandSystem } from './world/GridGuardCommandSystem';
import { GridGuildSystem } from './social/GridGuildSystem';
import { GridSocialAuthority } from './social/GridSocialAuthority';
import { GridFriendSystem } from './social/GridFriendSystem';
import { GridPartySystem } from './social/GridPartySystem';
import { GridPartyInviteAuthority } from './social/GridPartyInviteAuthority';
import { GridLandmarkAuthority } from './social/GridLandmarkAuthority';
import { GridTeleportInviteAuthority } from './social/GridTeleportInviteAuthority';
import { mountGridTeleportInvitePanel, openTeleportDestinationPicker } from './ui/GridTeleportInvitePanel';
import './ui/grid-teleport-invites.css';
import { mountGridLandmarkInventory } from './ui/GridLandmarkInventory';
import { mountGridTargetProfile, showNPCProfile } from './ui/GridTargetProfile';
import './ui/grid-target-profile.css';

import './ui/grid-landmark-inventory.css';
import { mountGridPartyHud } from './ui/GridPartyHud';
import { mountGridPartyInvitePanel } from './ui/GridPartyInvitePanel';
import { mountTeleportExperience, createTeleportAvatarEffect, teleportPreviewUrl } from './ui/GridTeleportExperience';
import { GridWorldMediaSystem } from './media/GridWorldMediaSystem';
import { GridWorldRecordSystem } from './media/GridWorldRecordSystem';
import { GridShopSystem } from './market/GridShopSystem';
import { GridPawnValuationSystem } from './economy/GridPawnValuationSystem';
import { GridWorldScaleSystem } from './world/GridWorldScaleSystem';
import { GridMonsterSystem } from './games/GridMonsterSystem';
import { GridDuelSystem } from './games/GridDuelSystem';
import { GRID_GAMES } from './games/GridGameCatalog';
import { GridMeetupSafetySystem } from './social/GridMeetupSafetySystem';
import { GridARSafetySystem } from './mobile/GridARSafetySystem';
import { GridHubSystem } from './world/GridHubSystem';
import { GRID_NPC_SHOPS } from './world/GridNPCShopCatalog';
import { GridDigiFoodSystem } from './world/GridDigiFoodSystem';
import { GridCurrencyMarketSystem } from './economy/GridCurrencyMarketSystem';
import { GridArenaSystem } from './games/GridArenaSystem';
import { GridEasyBuildSystem } from './world/GridEasyBuildSystem';
import { GridMaterialDropSystem } from './world/GridMaterialDropSystem';
import { GridTouchController, GridInputModeUI } from './ui/GridTouchController';
import './ui/GridDeviceResponsive.css';
import './ui/grid-effects.css';
import './ui/grid-themes.css';

const app = document.querySelector<HTMLDivElement>('#app')!;
let identity = loadOrCreateIdentity();
let accountAgeBand: GridAgeBand = 'child';
const persistence = new Persistence();
const worldSnapshotManager = new GridWorldSnapshotManager('first-light');
const cloudPersistence = supabaseConfigured ? new SupabasePersistence(SUPABASE_URL!, SUPABASE_PUBLISHABLE_KEY!) : null;
const socialAuthority = supabaseConfigured ? new GridSocialAuthority(cloudPersistence!.getClient()) : null;
const friendSystem = new GridFriendSystem();
const profileService = cloudPersistence ? new GridProfileService(cloudPersistence.getClient()) : null;
const profileAuthority = cloudPersistence ? new GridProfileAuthority(cloudPersistence.getClient()) : null;
const gridWorldAuthority = cloudPersistence ? new GridWorldAuthority(cloudPersistence.getClient()) : null;
const gridWorldContentAuthority = cloudPersistence ? new GridWorldContentAuthority(cloudPersistence.getClient()) : null;
const persistentWorldIds = new Set<string>();
let activePersistentContentWorldId: string | null = null;
let persistentContentSaveTimer = 0;
const partySystem = cloudPersistence ? new GridPartySystem(cloudPersistence.getClient()) : null;
const partyHud = mountGridPartyHud(cloudPersistence?.getClient());
const teleportExperience = mountTeleportExperience();
const teleportInviteAuthority = cloudPersistence ? new GridTeleportInviteAuthority(cloudPersistence.getClient()) : null;
const partyInviteAuthority = cloudPersistence ? new GridPartyInviteAuthority(cloudPersistence.getClient()) : null;
let invitePanel:ReturnType<typeof mountGridTeleportInvitePanel>|null=null;
const teleportPreviewUrlForDestination=(destination:{id:string})=>teleportPreviewUrl(destination as {id:string;displayName:string;regionId:string;position:{x:number;y:number;z:number};yaw:number;clearanceRadius:number});
const landmarkAuthority = cloudPersistence ? new GridLandmarkAuthority(cloudPersistence.getClient(), (item) => {
  void recordGridActivity('LANDMARK_SAVE','Saved destination','Saved '+item.label+' to your '+item.itemType.toLowerCase()+' collection.',String(livingWorld.getSnapshot().world),'first-light',{itemType:item.itemType,label:item.label,landmarkId:item.landmarkId??null});
}) : null;
let landmarkInventoryRoot: HTMLElement | null = null;
if (landmarkAuthority) landmarkInventoryRoot = mountGridLandmarkInventory(landmarkAuthority);
const targetProfilePanel = mountGridTargetProfile();


type HudTheme = 'cyan' | 'violet' | 'magenta' | 'emerald' | 'amber' | 'white' | 'crimson' | 'azure' | 'lime' | 'indigo';
const HUD_THEME_KEY = 'grid-world:hud-theme';
const hudTheme = (localStorage.getItem(HUD_THEME_KEY) as HudTheme | null) ?? 'cyan';
document.documentElement.dataset.hudTheme = hudTheme;
/* Live-sync: if the player changes the website style in another tab,
 * the 3D HUD follows without a reload. (Website accent picker writes
 * this same key via src/theme/accent.ts syncHudTheme.) */
window.addEventListener('storage', (e) => {
  if (e.key !== HUD_THEME_KEY || !e.newValue) return;
  const next = e.newValue as HudTheme;
  const valid: HudTheme[] = ['cyan','violet','magenta','emerald','amber','white','crimson','azure','lime','indigo'];
  if (valid.includes(next)) document.documentElement.dataset.hudTheme = next;
});
type UIStyle = 'luminous' | 'slate' | 'signal' | 'ember';
const UI_STYLE_KEY = 'grid-world:ui-style';
const uiStyle = (localStorage.getItem(UI_STYLE_KEY) as UIStyle | null) ?? 'luminous';
document.documentElement.dataset.uiStyle = uiStyle;

const input = new Input();

const hud = document.createElement('div');
hud.className = 'hud';
hud.innerHTML = `
  <div class="hud-frame hud-frame-top"></div>
  <div class="hud-frame hud-frame-bottom"></div>
  <div class="hud-topbar" aria-label="Grid runtime status">
    <div class="hud-system"><span class="hud-signal"></span><b>GRID ENGINE 0.1</b><small>FIRST LIGHT</small></div>
    <div class="hud-telemetry"><span>WORLD <b id="hud-world-state">ONLINE</b></span><span>TRANSIT <b>READY</b></span><span>OMNI <b>GUARDED</b></span><span>SIGNAL <b id="hud-world-signal">SYNC</b></span></div>
  </div>
  <aside class="hud-concept-card" aria-label="Grid World concept art">
    <img src="/grid-concept-first-light.webp" alt="First Light Grid World concept art">
    <div><b>FIRST LIGHT</b><span>LIVING WORLD · LIVE</span></div>
  </aside>
  <div class="hud-art-deck" aria-label="Grid World visual atlas">
    <img src="/grid-concept-living-wilds.webp" alt="Living Wilds">
    <img src="/grid-concept-civic.webp" alt="Civic">
    <img src="/art/hero-worlds.webp" alt="Many Worlds">
  </div>
  <div class="camera-help" aria-live="polite">ALT+LMB · ORBIT &nbsp; ALT+MMB · PAN &nbsp; ALT+RMB · ZOOM &nbsp; WHEEL · ZOOM &nbsp; M · MOUSELOOK</div>
  <div class="crosshair"><span></span></div>
  <button class="identity-button" id="identity-button" type="button">✦ ${identity.displayName}</button><button class="auth-button" id="auth-button" type="button">JOIN / LOGIN</button>
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
        <button type="button" data-hud="crimson">Crimson</button>
        <button type="button" data-hud="azure">Azure</button>
        <button type="button" data-hud="lime">Lime</button>
        <button type="button" data-hud="indigo">Indigo</button>
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
    <button type="button" data-tool="team"><b>⌂</b><span>TEAM</span></button><button type="button" data-tool="social"><b>◎</b><span>SOCIAL</span></button><button type="button" data-tool="settings"><b>⚙</b><span>SETTINGS</span></button><button type="button" data-tool="operator"><b>◈</b><span>OPERATOR</span></button>
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
  <div class="social-quick" id="social-quick" aria-label="Social quick actions"><button id="social-open" type="button">SOCIAL</button><button id="social-friend" type="button">ADD FRIEND</button><button id="social-message" type="button">MESSAGE</button><button id="social-teleport" type="button">INVITE / TELEPORT</button></div>
`;
app.appendChild(hud);
installGridAssetHealth(document);
installGridHealthMonitor(document.body);
const status = document.querySelector<HTMLDivElement>('#status')!;
const socialQuick = document.querySelector<HTMLDivElement>('#social-quick')!;
const socialFriend = document.querySelector<HTMLButtonElement>('#social-friend')!;
const socialMessage = document.querySelector<HTMLButtonElement>('#social-message')!;
const socialTeleport = document.querySelector<HTMLButtonElement>('#social-teleport')!;
const socialParty = document.createElement('button'); socialParty.id='social-party'; socialParty.type='button'; socialParty.textContent='INVITE PARTY'; socialQuick.appendChild(socialParty);
const partyInviteButton=document.createElement('button'); partyInviteButton.id='grid-party-inbox'; partyInviteButton.type='button'; partyInviteButton.textContent='PARTY INVITES'; Object.assign(partyInviteButton.style,{position:'fixed',right:'24px',top:'116px',zIndex:'80',background:'rgba(5,12,21,.82)',border:'1px solid rgba(116,221,255,.32)',color:'#dff8ff',padding:'8px 10px',font:'700 10px IBM Plex Mono,monospace',cursor:'pointer'}); document.body.appendChild(partyInviteButton);
const partyControlButton=document.createElement('button'); partyControlButton.id='grid-party-control'; partyControlButton.type='button'; partyControlButton.textContent='PARTY CONTROL'; Object.assign(partyControlButton.style,{position:'fixed',right:'24px',top:'156px',zIndex:'80',background:'rgba(5,12,21,.82)',border:'1px solid rgba(120,220,255,.28)',color:'#dff8ff',padding:'8px 10px',font:'700 10px IBM Plex Mono,monospace',cursor:'pointer',display:'none'}); document.body.appendChild(partyControlButton);
const transitInviteButton=document.createElement('button'); transitInviteButton.id='grid-transit-inbox'; transitInviteButton.type='button'; transitInviteButton.textContent='TRANSIT INVITES'; Object.assign(transitInviteButton.style,{position:'fixed',right:'24px',top:'76px',zIndex:'80',background:'rgba(5,12,21,.82)',border:'1px solid rgba(90,225,255,.32)',color:'#dff8ff',padding:'8px 10px',font:'700 10px IBM Plex Mono,monospace',cursor:'pointer'}); document.body.appendChild(transitInviteButton);
const socialOpen = document.querySelector<HTMLButtonElement>('#social-open')!;
let socialTargetUserId:string|null=null;
const chatMessages = document.querySelector<HTMLDivElement>('#chat-messages')!;
const chatCompose = document.querySelector<HTMLFormElement>('#chat-compose')!;
const chatInput = document.querySelector<HTMLInputElement>('#chat-input')!;
const voiceTargetButton = document.querySelector<HTMLButtonElement>('#voice-target')!;
const voice = new GridVoiceSystem();
const audio = new GridAudioSystem();
// Temporary UX mute: avatar movement should be silent while the avatar audio pass is tuned.
const AVATAR_AUDIO_ENABLED = false;
const voiceModifier = new GridVoiceModifierSystem();
let lastProfileActivityWorld:string|null=null;
let lastProfileActivityKills=0;
let lastProfileActivityResourceAt=0;
let lastProfileActivityConsequenceId='';
let lastProfileActivityQuestCompleted=0;
let lastProfileActivityBuildVersion=-1;
let lastProfileActivityPartySize=0;
async function recordGridActivity(kind:string,title:string,body:string,worldId?:string,regionId?:string,metadata:Record<string,unknown>={}) {
  if (!profileAuthority) return;
  try {
    await profileAuthority.recordActivity({kind,title,body,worldId,regionId,metadata});
    reportBackgroundServiceRecovery('profile-activity', 'Profile activity synchronization is back online.');
  } catch (error) {
    reportBackgroundServiceFailure('profile-activity', 'Profile activity synchronization is temporarily unavailable.');
    console.warn('Grid profile activity unavailable.',error);
  }
}

const backgroundServiceFailures = new Set<string>();

function reportBackgroundServiceFailure(key: string, message: string) {
  if (backgroundServiceFailures.has(key)) return;
  backgroundServiceFailures.add(key);
  addChatMessage('GRID SERVICES', message, 'system');
}

function reportBackgroundServiceRecovery(key: string, message: string) {
  if (!backgroundServiceFailures.delete(key)) return;
  addChatMessage('GRID SERVICES', message, 'system');
}

import { filterProfanity, isChildAccount } from './moderation/profanityFilter';

// Session-level: true if the current user is a child OR a child is in the shared space.
// Set via window.__gridChildPresent = true when a child joins.
function childPresent(): boolean {
  if ((window as any).__gridChildPresent === true) return true;
  const dob = (window as any).__gridUserDob as string | undefined;
  return isChildAccount(dob);
}

function addChatMessage(sender: string, message: string, kind: 'player' | 'system' | 'team' = 'player') {
  if (kind !== 'player') audio.play('chat.receive');
  const row = document.createElement('div');
  row.className = 'chat-message chat-' + kind;
  const name = document.createElement('span');
  name.className = 'chat-name';
  name.textContent = sender;
  const text = document.createElement('span');
  text.className = 'chat-text';
  // Paul's rule: mask profanity as !@#$% when a child account is online
  text.textContent = filterProfanity(message, childPresent());
  row.append(name, text);
  chatMessages.appendChild(row);
  while (chatMessages.children.length > 40) chatMessages.firstElementChild?.remove();
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

socialOpen.addEventListener('click',()=>{ if (gridCommunityPanel) gridCommunityPanel.open(); else addChatMessage('SOCIAL','Social Manager is unavailable until account services connect.','system'); });
socialQuick.style.display='none';
addChatMessage('GRID', 'Welcome to First Light. Chat is ready. MIC speaks to the object, NPC, or team member in your crosshair.', 'system');


function setSocialTarget(userId:string|null){socialTargetUserId=userId;socialQuick.style.display=userId?'flex':'none';if(userId)socialFriend.textContent='ADD FRIEND';}
socialFriend.addEventListener('click',async()=>{if(!socialAuthority||!socialTargetUserId)return;try{await socialAuthority.requestFriend(socialTargetUserId);addChatMessage('SOCIAL','Friend request sent.','system');}catch(error){addChatMessage('SOCIAL','Friend request could not be sent.','system');console.warn(error);}});
socialMessage.addEventListener('click',()=>{if(socialTargetUserId){chatInput.focus();chatInput.value='@'+socialTargetUserId+' ';}});
socialParty.addEventListener('click',async()=>{if(!socialTargetUserId||!partyInviteAuthority)return;try{const partyId=(await partySystem?.current())?.[0]?.partyId??await partyInviteAuthority.ensureParty(identity.displayName+' Party');await partyInviteAuthority.create(partyId,socialTargetUserId);addChatMessage('PARTY','Party invitation sent.','system');}catch(error){addChatMessage('PARTY','Party invitation could not be sent.','system');console.warn(error);}});
const partyControlMenu = document.createElement('div');
partyControlMenu.id = 'grid-party-control-menu';
partyControlMenu.className = 'grid-window';
Object.assign(partyControlMenu.style, {
  position:'fixed', right:'24px', top:'196px', zIndex:'81', minWidth:'220px',
  padding:'10px', display:'none', color:'var(--hud-strong)', font:'700 10px IBM Plex Mono,monospace',
});
document.body.appendChild(partyControlMenu);

function closePartyControlMenu() {
  partyControlMenu.style.display = 'none';
  partyControlMenu.replaceChildren();
}

function partyMenuButton(label:string, action:()=>void) {
  const button=document.createElement('button');
  button.type='button';
  button.textContent=label;
  Object.assign(button.style,{
    display:'block',width:'100%',margin:'4px 0',padding:'8px 10px',
    background:'rgba(5,12,21,.82)',border:'1px solid rgba(var(--hud-rgb),.22)',
    color:'var(--hud-strong)',font:'700 10px IBM Plex Mono,monospace',cursor:'pointer',textAlign:'left',
  });
  button.addEventListener('click',()=>{ closePartyControlMenu(); void action(); });
  partyControlMenu.appendChild(button);
}

async function openPartyControlMenu() {
  if(!partySystem)return;
  try {
    const members=await partySystem.current();
    const self=members.find(m=>m.userId===cloudIdentity.id);
    if(!self)return;
    closePartyControlMenu();
    partyControlMenu.style.display='block';

    if(self.role==='LEADER'){
      partyMenuButton('TRANSIT · CHOOSE DESTINATION',async()=>{
        const destinations=teleportSystem.all().filter(x=>x.status!=='offline').map(x=>({id:x.id,displayName:x.displayName,regionId:x.regionId,position:{...x.position},yaw:x.yaw,clearanceRadius:x.clearanceRadius}));
        const landmarks=landmarkAuthority?await landmarkAuthority.list().catch(()=>[]):[];
        openTeleportDestinationPicker(destinations,landmarks,async destination=>{
          await partySystem.setDestination(self.partyId,{id:destination.id,name:destination.displayName,previewImageUrl:teleportPreviewUrlForDestination(destination)});
          await partySystem.activateDestination(self.partyId);
          addChatMessage('PARTY','Group route locked: '+destination.displayName+'.','system');
          void partyDestinationTick();
        });
      });
      partyMenuButton('TRANSFER LEADERSHIP',async()=>{
        closePartyControlMenu();
        partyControlMenu.style.display='block';
        const eligible=members.filter(member=>member.userId!==self.userId);
        if(!eligible.length){addChatMessage('PARTY','No other party member is available for leadership transfer.','system');closePartyControlMenu();return;}
        partyMenuButton('← BACK',()=>openPartyControlMenu());
        eligible.forEach(member=>partyMenuButton('TRANSFER TO · '+member.userId.slice(0,8),async()=>{
          await partySystem.transferLeadership(self.partyId,member.userId);
          addChatMessage('PARTY','Leadership transferred to '+member.userId.slice(0,8)+'.','system');
        }));
      });
      partyMenuButton('KICK MEMBER',async()=>{
        closePartyControlMenu();
        partyControlMenu.style.display='block';
        const eligible=members.filter(member=>member.userId!==self.userId);
        if(!eligible.length){addChatMessage('PARTY','There are no other party members to remove.','system');closePartyControlMenu();return;}
        partyMenuButton('← BACK',()=>openPartyControlMenu());
        eligible.forEach(member=>partyMenuButton('REMOVE · '+member.userId.slice(0,8),async()=>{
          await partySystem.kick(self.partyId,member.userId);
          addChatMessage('PARTY',member.userId.slice(0,8)+' was removed from the party.','system');
        }));
      });
      partyMenuButton('LEAVE PARTY',async()=>{
        await partySystem.leave(self.partyId);
        addChatMessage('PARTY','Party dissolved or leadership passed to the next member.','system');
      });
    }else{
      partyMenuButton('LEAVE PARTY',async()=>{
        await partySystem.leave(self.partyId);
        addChatMessage('PARTY','You left the party.','system');
      });
    }
  } catch(error) {
    closePartyControlMenu();
    addChatMessage('PARTY','Party action was rejected by Grid authority.','system');
    console.warn(error);
  }
}
partyControlButton.onclick=()=>void openPartyControlMenu();
document.addEventListener('pointerdown',event=>{
  const target=event.target as Node;
  if(partyControlMenu.style.display!=='none' && !partyControlMenu.contains(target) && target!==partyControlButton) closePartyControlMenu();
});
const partyInvitePanel=partyInviteAuthority&&cloudPersistence
  ? mountGridPartyInvitePanel(partyInviteAuthority,cloudPersistence.getClient(),()=>{
      addChatMessage('PARTY','Invitation accepted. You are now linked to the party roster.','system');
      void partySystem?.current().then(members=>partyHud.update(members,Object.fromEntries(regionCollaborators.map(p=>[p.id,p.displayName])))).catch(()=>undefined);
    })
  : null;
partyInviteButton.onclick=()=>partyInvitePanel?.open();
const refreshPartyInvites=async()=>{
  if(!partyInviteAuthority)return;
  try{const rows=await partyInviteAuthority.pending();partyInviteButton.textContent=rows.length?'PARTY INVITES · '+rows.length:'PARTY INVITES';}
  catch{partyInviteButton.textContent='PARTY INVITES';}
};
void refreshPartyInvites();
window.setInterval(()=>void refreshPartyInvites(),10000);

let lastPartyDestinationKey='';
async function partyDestinationTick(){
  if(!partySystem||!cloudPersistence)return;
  try{
    const members=await partySystem.current();
    const self=members.find(m=>m.userId===cloudIdentity.id);
    if(!self)return;
    partyControlButton.style.display='block';
    const destination=await partySystem.destination(self.partyId);
    if(!destination?.destinationId || destination.status!=='active' || !destination.setAt)return;
    const key=self.partyId+':'+destination.destinationId+':'+destination.setAt;
    if(key===lastPartyDestinationKey)return;
    lastPartyDestinationKey=key;
    const target=teleportSystem.get(destination.destinationId);
    if(!target || target.status==='offline'){addChatMessage('PARTY','Party route is unavailable at this client.','system');return;}
    teleportExperience.show(target,'departing');
    createTeleportAvatarEffect(player.avatar,850);
    audio.play('world.portal',.8);
    const arrival=new THREE.Vector3(target.position.x,Math.max(0,target.position.y),target.position.z);
    const backward=new THREE.Vector3(0,0,1).applyAxisAngle(new THREE.Vector3(0,1,0),target.yaw);
    arrival.addScaledVector(backward,Math.max(2.5,target.clearanceRadius));
    window.setTimeout(()=>{
      player.restoreTransform({x:arrival.x,y:arrival.y,z:arrival.z,yaw:target.yaw});
      teleportExperience.show(target,'arriving');
      createTeleportAvatarEffect(player.avatar,700);
      addChatMessage('PARTY','Party transit complete: '+target.displayName+'.','system');
      audio.play('world.portal',1);
    },850);
  }catch(error){reportBackgroundServiceFailure('party-transit','Party transit synchronization is temporarily unavailable.');console.warn('Party transit sync unavailable.',error);}
}
socialTeleport.addEventListener('click',async()=>{if(!socialTargetUserId||!cloudPersistence)return;const destinations=teleportSystem.all().filter(x=>x.status!=='offline').map(x=>({id:x.id,displayName:x.displayName,regionId:x.regionId,position:{...x.position},yaw:x.yaw,clearanceRadius:x.clearanceRadius}));const landmarks=landmarkAuthority?await landmarkAuthority.list().catch(()=>[]):[];openTeleportDestinationPicker(destinations,landmarks,async destination=>{try{const inviteId=await teleportInviteAuthority?.create(socialTargetUserId!,{id:destination.id,displayName:destination.displayName,previewImageUrl:teleportPreviewUrlForDestination(destination)});addChatMessage('SOCIAL','Teleport invitation sent for '+destination.displayName+'.','system');void invitePanel?.refresh();console.debug('teleport invite',inviteId);}catch(error){addChatMessage('SOCIAL','Teleport invitation could not be sent.','system');console.warn(error);}});});

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
  if (/\b(operator|guide|grid operator)\b/i.test(transcript)) { operatorPresence.openGuide(); void operatorPresence.ask(transcript.replace(/\b(operator|guide|grid operator)\b/ig, '').trim() || 'What should I know about my current mission?'); } else respondToVoiceTarget(transcript);
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

const gridSecurity = new GridSecuritySystem();
const world = new World();
const foundationLayer = createGridFoundationLayer();
world.scene.add(foundationLayer.root);
const teamArea = mountTeamArea();
const questButton = document.createElement('button'); questButton.className='toolbar-button'; questButton.textContent='QUESTS'; questButton.type='button'; questButton.addEventListener('click',()=>questPanel.open()); document.body.appendChild(questButton);
const artDirector = installGridWorldArtDirector(world.scene);
const worldSkins = createWorldSkinDirector();
const worldArchitecture = new WorldArchitectureSystem();
const worldEnvironment = new WorldEnvironmentSystem();
world.scene.add(worldEnvironment.root);
world.scene.add(worldSkins.root);
world.scene.add(worldArchitecture.root);
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
npcSociety.setTransitTrafficRecorder((source, destination, queueDepth) => {
  const sourceNode = 'world-gate:' + source.toLowerCase();
  const destinationNode = 'world-gate:' + destination.toLowerCase();
  if (sourceNode && destinationNode) teleportSystem.recordTraffic(sourceNode, destinationNode);
  addChatMessage('GRID TRANSIT', source + ' → ' + destination + ' · NPC route completed · queue ' + queueDepth + '.', 'system');
  void cloudPersistence?.getClient().rpc('grid_record_transit', { p_source_world: source, p_destination_world: destination, p_departures: 1, p_arrivals: 1, p_queue_depth: queueDepth });
});
npcSociety.setTeleportDestinationResolver((actorId, source, destination) => {
  const sourceNodeId = 'world-gate:' + source.toLowerCase();
  const destinationNodeId = 'world-gate:' + destination.toLowerCase();
  const result = teleportSystem.request({
    actorId,
    nodeId: sourceNodeId,
    destinationId: destinationNodeId,
    nowSeconds: performance.now() / 1000,
    relationship: 'public',
  });
  return result.ok ? result.destination ?? null : null;
});
npcSociety.setTransitPresentation((actorId, root, destination, phase) => {
  const distance = root.position.distanceTo(player.avatar.position);
  if (distance > 42) return;
  teleportExperience.show(destination, phase);
  if (phase === 'arriving') createTeleportAvatarEffect(root, 850);
});
const relationshipStories = new RelationshipStorySystem();
const traversalSystem = new TraversalSystem();
const questSystem = new QuestSystem(identity.id);
const dynamicQuestSystem = new DynamicQuestSystem(questSystem);
const worldConsequences = new WorldConsequenceSystem();
const worldEvolution = new WorldEvolutionSystem();
const evolutionaryPopulations = new EvolutionaryPopulationSystem();
const ecologicalWeb = new EcologicalWebSystem();
const ecologicalInteractions = new EcologicalInteractionSystem();
world.scene.add(ecologicalWeb.root);
world.scene.add(ecologicalInteractions.root);
const worldResources = new WorldResourceSystem();
const gridMinerals = new GridMineralSystem();
const gridChakras = new GridChakraSystem();
const gridAlchemy = new GridAlchemySystem();
const gridKarma = new GridKarmaSystem();
world.scene.add(gridMinerals.root);
async function persistFactoryWorld(result: ReturnType<typeof createWorldFromDescription>) {
  if (!gridWorldAuthority) return false;
  try {
    await cloudReady;
    const saved = await gridWorldAuthority.create(result.world);
    if (!saved) return false;
    persistentWorldIds.add(result.world.id);
    await recordGridActivity(
      'WORLD_CREATE',
      'Created a world',
      'Created ' + result.world.label + ' from Creator Studio and saved it to the Grid World registry.',
      result.world.id,
      'first-light',
      { worldId: result.world.id, name: result.world.label, description: result.world.description, inferredTags: result.inferredTags, persistent: true },
    );
    addChatMessage('WORLD REGISTRY', result.world.label + ' is now persistent and available for re-entry.', 'system');
    return true;
  } catch (error) {
    reportBackgroundServiceFailure('world-registry-save','World registry persistence is temporarily unavailable; the new world remains active locally.');
    console.warn('Persistent world save unavailable; runtime world remains active.', error);
    addChatMessage('WORLD REGISTRY', result.world.label + ' is active locally, but cloud persistence is unavailable.', 'system');
    return false;
  }
}

async function hydratePersistentWorlds() {
  if (!gridWorldAuthority) return;
  try {
    await cloudReady;
    const rows = await gridWorldAuthority.listPublic();
    for (const row of rows) {
      const definition = GridWorldAuthority.toDefinition(row);
      persistentWorldIds.add(definition.id);
      const world = registerNetworkWorld(definition);
      for (const other of getWorlds()) {
        if (other.id === world.id) continue;
        connectWorld(world.id, other.id);
        connectWorld(other.id, world.id);
      }
      registerWorldTransitNode(definition);
      teleportSystem.syncWorldConnections();
      worldArchitecture.rebuild();
      worldEnvironment.rebuild();
      creatureEcology.registerWorld(definition);
      worldResources.registerWorld(definition);
      gridMinerals.registerWorld(definition);
      npcSociety.registerWorld(definition);
      worldEvolution.registerWorld(definition.id);
      evolutionaryPopulations.registerWorld(definition.id);
      ecologicalWeb.registerWorld(definition.id);
    }
    if (rows.length) addChatMessage('WORLD REGISTRY', rows.length + ' persistent world' + (rows.length === 1 ? '' : 's') + ' synchronized for re-entry.', 'system');
    reportBackgroundServiceRecovery('world-registry','Persistent world registry is back online.');
  } catch (error) {
    reportBackgroundServiceFailure('world-registry','Persistent world registry is temporarily unavailable; local worlds remain available.');
    console.warn('Persistent world registry unavailable; continuing with local worlds.', error);
  }
}

const createFactoryWorld = (name: string, description: string) => {
  const result = createWorldFromDescription({ name, description });
  connectFactoryWorldToAll(result);
  registerWorldTransitNode(result.world);
  teleportSystem.syncWorldConnections();
  worldArchitecture.rebuild();
  worldEnvironment.rebuild();
  creatureEcology.registerWorld(result.world);
  worldResources.registerWorld(result.world);
  gridMinerals.registerWorld(result.world);
  void Promise.resolve(cloudPersistence?.getClient().rpc('grid_seed_world_minerals', { p_world_id: result.world.id })).then(response => { if (response?.error) throw response.error; syncGridMinerals(); reportBackgroundServiceRecovery('world-minerals', 'World mineral services are updating again.'); }).catch(error => { reportBackgroundServiceFailure('world-minerals', 'World mineral services are temporarily unavailable.'); console.warn('World mineral seed unavailable.', error); });
  npcSociety.registerWorld(result.world);
  worldEvolution.registerWorld(result.world.id);
  evolutionaryPopulations.registerWorld(result.world.id);
  ecologicalWeb.registerWorld(result.world.id);
  addChatMessage('WORLD FACTORY', result.world.label + ' joined the Grid · ' + result.inferredTags.join(' · '), 'system');
  return result;
};

const worldFactoryPanel = mountWorldFactoryPanel({
  onCreate: createFactoryWorld,
});


let marketPanel: ReturnType<typeof mountMarketPanel> | null = null;
const questPanel = mountQuestPanel(questSystem);
const guardCommandSystem = new GridGuardCommandSystem();
const guildSystem = new GridGuildSystem();
world.scene.add(guildSystem.root);
const worldMediaSystem = new GridWorldMediaSystem();
const worldRecordSystem = new GridWorldRecordSystem();
const shopSystem = new GridShopSystem();
const pawnValuationSystem = new GridPawnValuationSystem();
const worldScaleSystem = new GridWorldScaleSystem();
const monsterSystem = new GridMonsterSystem();
const duelSystem = new GridDuelSystem();
const meetupSafetySystem = new GridMeetupSafetySystem();
const arSafetySystem = new GridARSafetySystem();
const hubSystem = new GridHubSystem();
const digiFoodSystem = new GridDigiFoodSystem();
const currencyMarketSystem = new GridCurrencyMarketSystem();
const arenaSystem = new GridArenaSystem();
const easyBuildSystem = new GridEasyBuildSystem();
const materialDropSystem = new GridMaterialDropSystem();
const recoveredWorld = worldSnapshotManager.recover();
if (recoveredWorld?.data?.builds) easyBuildSystem.restore(recoveredWorld.data.builds);
const touchSurface=document.body; const gridTouchController=new GridTouchController(input,touchSurface); const inputModeUI=new GridInputModeUI(input,document.body);
world.scene.userData.gridMediaFormats = GridWorldMediaSystem.SUPPORTED_FORMATS;
world.scene.userData.worldRecorder = worldRecordSystem;
world.scene.userData.guildNetwork = guildSystem;
world.scene.userData.shopNetwork = shopSystem;
world.scene.userData.pawnValuation = pawnValuationSystem;
world.scene.userData.worldScale = worldScaleSystem.scale(livingWorld.getSnapshot().world as string);
world.scene.userData.gridGames = GRID_GAMES;
world.scene.userData.monsterSystem = monsterSystem;
world.scene.userData.duelSystem = duelSystem;
world.scene.userData.meetupSafety = meetupSafetySystem;
world.scene.userData.arSafety = arSafetySystem;
world.scene.add(monsterSystem.root, duelSystem.root, hubSystem.root, arenaSystem.root, easyBuildSystem.root, materialDropSystem.root);
world.scene.userData.easyBuild = easyBuildSystem;
world.scene.userData.materialDrops = materialDropSystem;
easyBuildSystem.mountPanel(document.body);

function mountBuildRegionStatus() {
  const panel = document.createElement('section');
  panel.id = 'grid-build-region-status';
  panel.setAttribute('aria-live','polite');
  panel.innerHTML = '<strong>GRID BUILD REGION</strong><span data-region-state>Connecting…</span><span data-region-role></span><span data-region-collaborators>COLLABORATORS · 0</span><button type="button" data-region-manage hidden>MANAGE REGION</button>';
  Object.assign(panel.style,{position:'fixed',right:'18px',bottom:'18px',zIndex:'80',display:'grid',gap:'6px',padding:'10px 12px',minWidth:'240px',fontFamily:'IBM Plex Mono,monospace',fontSize:'11px',letterSpacing:'.08em',background:'rgba(8,12,24,.88)',border:'1px solid rgba(120,220,255,.35)',borderRadius:'8px',color:'#dff7ff',backdropFilter:'blur(8px)'});
  document.body.appendChild(panel);
  return {
    set(state:string,role:string,canManage=false,onManage?:()=>void){
      const s=panel.querySelector('[data-region-state]'); const r=panel.querySelector('[data-region-role]'); const b=panel.querySelector<HTMLButtonElement>('[data-region-manage]');
      if(s)s.textContent=state; if(r)r.textContent=role?'ROLE · '+role.toUpperCase():'';
      if(b){ b.hidden=!canManage; b.onclick=onManage??null; Object.assign(b.style,{background:'transparent',border:'1px solid rgba(120,220,255,.35)',color:'inherit',padding:'5px 7px',font:'inherit',cursor:'pointer'}); }
    }
  };
}

const buildRegionStatus = mountBuildRegionStatus();
world.scene.userData.npcShopCatalog = GRID_NPC_SHOPS;
world.scene.userData.digiFoodSystem = digiFoodSystem;
world.scene.userData.currencyMarket = currencyMarketSystem;
world.scene.userData.arenas = arenaSystem;
hubSystem.defaults(livingWorld.getSnapshot().world as string);
arenaSystem.defaults(livingWorld.getSnapshot().world as string);
world.scene.add(guardCommandSystem.root);
const operatorService = cloudPersistence ? new GridOperatorService(cloudPersistence.getClient()) : null;
const worldPulseHealth = (failureKeys: string[], online: boolean): WorldPulseHealth => {
  if (!online) return 'OFFLINE';
  return failureKeys.some(key => backgroundServiceFailures.has(key)) ? 'DEGRADED' : 'ONLINE';
};
const getWorldPulse = (): WorldPulseSnapshot => {
  const snap = livingWorld.getSnapshot();
  const society = npcSociety.getSnapshot();
  const consequences = worldConsequences.getSnapshot();
  const traffic = teleportSystem.trafficSnapshot();
  const activeMissions = questSystem.getQuests().filter(x => x.status === 'ACTIVE' || x.status === 'TURN_IN').length;
  const worldTraffic = traffic.filter(node => teleportSystem.get(node.nodeId)?.worldId === snap.world);
  const transitTraffic = worldTraffic.reduce((sum, node) => sum + node.activity, 0);
  return {
    world: String(snap.world),
    event: String(snap.event),
    phase: String(snap.phase),
    season: String(snap.season),
    weather: String(snap.weather),
    temperatureC: Number(snap.temperatureC),
    humidity: Number(snap.humidity),
    activity: Number(snap.activity),
    ecology: Number(snap.ecology),
    npcPopulation: Number(society.population),
    npcActive: Number(society.active),
    npcWorking: Number(society.working),
    npcTalking: Number(society.talking),
    activeMissions,
    transitNodes: worldTraffic.length,
    transitTraffic,
    consequenceStability: Number(consequences.stability),
    consequencePressure: Number(consequences.pressure),
    persistence: worldPulseHealth(['world-content-save','world-content-restore','world-registry'], Boolean(cloudPersistence)),
    transit: worldPulseHealth(['party-transit','transit-invites'], true),
    cloud: worldPulseHealth(['cloud-persistence','cloud-state'], Boolean(cloudPersistence)),
    lastUpdatedAt: Date.now(),
  };
};
const operatorPresence = new GridOperatorPresence(
  operatorService,
  voice,
  questSystem,
  () => { const snap = livingWorld.getSnapshot(); return { world: String(snap.world), event: String(snap.event) }; },
  (sender, message) => addChatMessage(sender, message, 'system'),
  getWorldPulse,
);
const operatorButton = document.querySelector<HTMLButtonElement>('[data-tool="operator"]');
operatorButton?.addEventListener('click', () => operatorPresence.toggle());
const enterWorldFromAtlas = (worldId:string) => {
  const currentWorld = String(livingWorld.getSnapshot().world);
  if (worldId === currentWorld) {
    addChatMessage('GRID TRANSIT', 'You are already in ' + (getWorld(worldId)?.label ?? worldId) + '.', 'system');
    return;
  }
  const sourceNodeId = 'world-gate:' + currentWorld.toLowerCase();
  const destinationId = 'world-gate:' + worldId.toLowerCase();
  const sourceNode = teleportSystem.get(sourceNodeId);
  const destinationNode = teleportSystem.get(destinationId);
  if (!sourceNode || !destinationNode) {
    addChatMessage('GRID TRANSIT', 'That world is not currently linked into the live transit network.', 'system');
    audio.play('ui.error');
    return;
  }
  const result = teleportSystem.request({
    actorId: cloudIdentity.id,
    nodeId: sourceNodeId,
    destinationId,
    nowSeconds: performance.now() / 1000,
    relationship: 'public',
    ageBand: accountAgeBand,
  });
  if (!result.ok || !result.destination) {
    addChatMessage('GRID TRANSIT', 'Grid Omni could not authorize that route: ' + result.reason + '.', 'system');
    audio.play('ui.error');
    return;
  }
  const destination = result.destination;
  teleportExperience.show(destination, 'departing');
  createTeleportAvatarEffect(player.avatar, 850);
  teleportSystem.recordTraffic(sourceNodeId, destination.id);
  addChatMessage('GRID TRANSIT', 'Route locked: ' + destination.displayName + '. Destination preview loaded; transit engaged.', 'system');
  audio.play('world.portal', .8);
  window.setTimeout(() => {
    const arrival = new THREE.Vector3(destination.position.x, Math.max(0, destination.position.y), destination.position.z);
    const backward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), destination.yaw);
    arrival.addScaledVector(backward, Math.max(2.5, destination.clearanceRadius));
    player.restoreTransform({ x: arrival.x, y: arrival.y, z: arrival.z, yaw: destination.yaw });
    teleportExperience.show(destination, 'arriving');
    createTeleportAvatarEffect(player.avatar, 700);
    audio.play('world.portal', 1);
    addChatMessage('GRID TRANSIT', 'Arrived at ' + destination.displayName + '. Persistent world re-entry complete.', 'system');
    void recordGridActivity('WORLD_VISIT', 'Entered world', 'Entered persistent world ' + destination.displayName + ' from the Grid Atlas.', worldId, 'first-light', { worldId, persistent: true, reentry: true });
    if (cloudPersistence) {
      void cloudPersistence.getClient().from('grid_teleport_events').insert({
        actor_id: cloudIdentity.id,
        source_node_id: sourceNodeId,
        destination_node_id: destination.id,
        result: 'teleported',
      });
    }
  }, 850);
};

const worldAtlas = mountWorldAtlas(
  () => ({
    world: (livingWorld.getSnapshot().world as EcologyWorld),
    event: livingWorld.getSnapshot().event,
    consequences: worldConsequences.getSnapshot(),
    resources: worldResources.getSnapshot(),
    inventory: worldResources.getInventory(),
    market: marketQuotes,
    transit: teleportSystem.trafficSnapshot(),
  }),
  enterWorldFromAtlas,
);
marketPanel = mountMarketPanel(() => worldResources.getInventory(), () => marketQuotes, () => combatAuthority);
const gridEconomyPanel = mountGridEconomyPanel(() => combatAuthority);
const gridSocialService = cloudPersistence ? new GridSocialService(cloudPersistence.getClient()) : null;
const gridCommunityPanel = gridSocialService ? mountGridCommunityPanel(gridSocialService, voiceModifier, { displayName: identity.displayName, id: identity.id, createdAt: identity.createdAt }, gridWorldContentAuthority ? { authority: gridWorldContentAuthority, getWorldId: () => String(livingWorld.getSnapshot().world) } : undefined) : null;
void gridSocialService?.setPresence(false).catch(()=>undefined);
const gridAuthPanel = cloudPersistence ? mountGridAuthPanel(new GridAuthService(cloudPersistence.getClient()), profile => {
  identity = { ...identity, id: profile.id, displayName: profile.display_name, createdAt: profile.account_created_at || identity.createdAt };
  void cloudPersistence?.getClient().from('grid_account_social').select('age_band').eq('user_id', profile.id).maybeSingle().then(({data})=>{ if(data?.age_band==='child'||data?.age_band==='teen'||data?.age_band==='adult') accountAgeBand=data.age_band; });
  cloudIdentity = { ...cloudIdentity, id: profile.id, displayName: profile.display_name };
  writeVersioned('grid-world:identity', 1, identity);
  player.setAvatarAppearance(identity.avatarStyle, identity.avatarCustomization);
  updatePlayerNameplate(profile.display_name);
  identityButton.textContent = '✦ ' + (profile.handle || profile.display_name);
  gridCommunityPanel?.setIdentity({displayName:profile.display_name,id:profile.id,createdAt:profile.account_created_at||identity.createdAt});
  gridCommunityPanel?.close();
  const joinAuthButton = document.querySelector<HTMLButtonElement>('#auth-button');
  if (authButton) authButton.textContent = 'ACCOUNT';
  void presence?.setIdentity(cloudIdentity, player.getTransform());
  void gridSocialService?.setPresence(true).catch(()=>undefined);
  addChatMessage('GRID IDENTITY', profile.handle + ' is now connected to the Grid.', 'system');
}, selection => {
  identity = { ...identity, avatarStyle: selection.style, avatarCustomization: selection.customization };
  writeVersioned('grid-world:identity', 1, identity);
  player.setAvatarAppearance(selection.style, selection.customization);
}) : null;
const authButton = document.querySelector<HTMLButtonElement>('#auth-button');
authButton?.addEventListener('click', async () => {
  if (!gridAuthPanel) {
    addChatMessage('ACCOUNT', 'Account services are not available in this build.', 'system');
    return;
  }
  if (!cloudPersistence) {
    addChatMessage('ACCOUNT', 'Account services are temporarily unavailable. You can keep exploring locally.', 'system');
    audio.play('ui.error');
    return;
  }
  try {
    const auth = new GridAuthService(cloudPersistence.getClient());
    const user = await auth.currentUser();
    gridAuthPanel.open(user ? 'profile' : 'login');
  } catch (error) {
    console.warn('Account service unavailable.', error);
    addChatMessage('ACCOUNT', 'Account services could not be reached. Local exploration remains available.', 'system');
    audio.play('ui.error');
  }
});

const authRoute = new URLSearchParams(window.location.search).get('auth');
if (gridAuthPanel && (authRoute === 'join' || authRoute === 'login')) {
  requestAnimationFrame(() => gridAuthPanel?.open(authRoute === 'join' ? 'join' : 'login'));
}

const transitPanel = mountTransitPanel();
let merchantRefreshTimer = 0;
let mineralSyncTimer = 0;
async function syncGridMinerals() {
  if (!cloudPersistence) return;
  try {
    const client = cloudPersistence.getClient();
    const { data, error } = await client.from('grid_mineral_deposits').select('id,world_id,mineral_kind,remaining,capacity,position_x,position_y,position_z');
    if (error) throw error;
    if (data) gridMinerals.syncServerDeposits(data as any);
    reportBackgroundServiceRecovery('mineral-sync','Resource deposits are back in sync.');
  } catch (error) {
    reportBackgroundServiceFailure('mineral-sync','Resource deposit data is temporarily unavailable; local exploration remains available.');
    console.warn('Grid mineral sync unavailable.', error);
  }
}
void syncGridMinerals();
async function refreshMerchantMarket(){
  if(!combatAuthority) return;
  try {
    const result = await combatAuthority.marketMerchants();
    const merchants = (result as any)?.merchants ?? [];
    for(const m of merchants) {
      const existing = marketQuotes.find((q:any)=>q.item_id===m.resource_kind);
      if(existing) { existing.unit_price = Number(m.buy_price); existing.demand = Number(m.demand ?? 1); }
    }
    reportBackgroundServiceRecovery('merchant-market','Merchant market data is back online.');
  } catch (error) {
    reportBackgroundServiceFailure('merchant-market','Merchant market data is temporarily unavailable; existing market data remains available.');
    console.warn('Merchant market refresh unavailable.', error);
  }
}
let lastStoryId = '';
let lastCombatKills = 0;
let lastConsequenceId = '';
let resourceInteractLatched = false;
let materialDropInteractLatched = false;
let npcMaterialDropTimer = 0;
let lastNpcMemoryAt = 0;
world.scene.add(livingWorld.root);
world.scene.add(creatureEcology.root);
world.scene.add(npcSociety.root);
world.scene.add(relationshipStories.root);
world.scene.add(traversalSystem.root);
world.scene.add(questSystem.root);
world.scene.add(dynamicQuestSystem.root);
world.scene.add(worldConsequences.root);
world.scene.add(worldEvolution.root);
world.scene.add(evolutionaryPopulations.root);
world.scene.add(worldResources.root);
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
    worldId: 'CITADEL',
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
    worldId: 'ARTS',
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
    worldId: 'WILDS',
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
    worldId: 'HARBOR',
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
    worldId: 'GARDENS',
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
    worldId: 'WILDS',
    regionId: 'first-light',
    position: { x: 25, y: 0, z: -26 },
    yaw: -Math.PI / 2,
    clearanceRadius: 3,
    destinationIds: ['gate:wilds-to-creator'],
    access: 'public' as const,
  },
] as const;

const teleportInviteAuthorityReady=teleportInviteAuthority;
if(teleportInviteAuthorityReady){
  invitePanel=mountGridTeleportInvitePanel(teleportInviteAuthorityReady,(invite)=>{
    const node=teleportSystem.get(invite.destinationId);
    if(!node){addChatMessage('GRID TRANSIT','That destination is no longer online.','system');return;}
    const destination={id:node.id,displayName:node.displayName,regionId:node.regionId,position:{...node.position},yaw:node.yaw,clearanceRadius:node.clearanceRadius};
    teleportExperience.show(destination,'departing'); createTeleportAvatarEffect(player.avatar,850); audio.play('world.portal',.8);
    window.setTimeout(()=>{const arrival=new THREE.Vector3(destination.position.x,Math.max(0,destination.position.y),destination.position.z);const backward=new THREE.Vector3(0,0,1).applyAxisAngle(new THREE.Vector3(0,1,0),destination.yaw);arrival.addScaledVector(backward,Math.max(2.5,destination.clearanceRadius));player.restoreTransform({x:arrival.x,y:arrival.y,z:arrival.z,yaw:destination.yaw});teleportExperience.show(destination,'arriving');createTeleportAvatarEffect(player.avatar,700);audio.play('world.portal',1);addChatMessage('GRID TRANSIT','Accepted invitation. Arrived at '+destination.displayName+'.','system');},850);
  });
  transitInviteButton.onclick=()=>invitePanel?.open();
  void teleportInviteAuthorityReady.pending().then(rows=>{if(rows.length)transitInviteButton.textContent='TRANSIT INVITES · '+rows.length;reportBackgroundServiceRecovery('transit-invites','Transit invitations are updating again.');}).catch(()=>{transitInviteButton.textContent='TRANSIT INVITES · UNAVAILABLE';reportBackgroundServiceFailure('transit-invites','Transit invitations are temporarily unavailable.');});
  window.setInterval(()=>void teleportInviteAuthorityReady.pending().then(rows=>{transitInviteButton.textContent=rows.length?'TRANSIT INVITES · '+rows.length:'TRANSIT INVITES';reportBackgroundServiceRecovery('transit-invites','Transit invitations are updating again.');}).catch(()=>{transitInviteButton.textContent='TRANSIT INVITES · UNAVAILABLE';reportBackgroundServiceFailure('transit-invites','Transit invitations are temporarily unavailable.');}),10000);
}

const teleportVisuals = teleportDefinitions.map(definition => {
  teleportSystem.register(definition);
  const visual = definition.kind === 'gate'
    ? createTeleportGate(definition)
    : createTeleportPylon(definition);
  world.scene.add(visual);
  return visual;
});

// Every world gets a native transit gate. The same path is reused when a world is created at runtime.
const registerWorldTransitNode = (worldDefinition: ReturnType<typeof getWorlds>[number]) => {
  const nodeId = 'world-gate:' + worldDefinition.id.toLowerCase();
  const destinations = getWorldConnections(worldDefinition.id).map(connection => 'world-gate:' + connection.destination.toLowerCase());
  if (!teleportSystem.get(nodeId)) {
    const definition = {
      id: nodeId,
      kind: 'gate' as const,
      displayName: worldDefinition.label + ' · World Gate',
      regionId: 'grid-world',
      position: { x: worldDefinition.center.x, y: worldDefinition.center.y, z: worldDefinition.center.z },
      yaw: 0,
      clearanceRadius: 3,
      destinationIds: destinations,
      access: 'public' as const,
      worldId: worldDefinition.id,
    };
    teleportSystem.register(definition);
    // Built-in worlds already have custom gate/pylon visuals; reuse those instead of duplicating them.
    if (!teleportVisuals.some(v => v.userData.worldId === worldDefinition.id)) {
      const visual = createTeleportGate(definition);
      world.scene.add(visual);
      teleportVisuals.push(visual);
    }
  }
  teleportSystem.syncWorldConnections();
};

for (const worldDefinition of getWorlds()) registerWorldTransitNode(worldDefinition);

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

const player = new PlayerController(input);
const combatSystem = new CombatSystem();
world.scene.add(combatSystem.root);
combatSystem.register({id:identity.id,faction:'PLAYER',root:player.avatar,maxHealth:100,damage:18,range:2.7,respawnPosition:new THREE.Vector3(0,0,7)});
world.scene.add(player.avatar);

const playerNameplateCanvas = document.createElement('canvas');
playerNameplateCanvas.width = 512;
playerNameplateCanvas.height = 128;
const playerNameplateContext = playerNameplateCanvas.getContext('2d')!;
const playerNameplateTexture = new THREE.CanvasTexture(playerNameplateCanvas);
const playerNameplate = new THREE.Sprite(new THREE.SpriteMaterial({ map: playerNameplateTexture, transparent: true, depthWrite: false }));
playerNameplate.scale.set(3.2, 0.8, 1);
playerNameplate.position.set(0, 2.45, 0);
player.avatar.add(playerNameplate);
function updatePlayerNameplate(displayName: string) {
  playerNameplateContext.clearRect(0, 0, 512, 128);
  playerNameplateContext.fillStyle = 'rgba(7, 17, 31, 0.78)';
  playerNameplateContext.roundRect(8, 24, 496, 76, 18);
  playerNameplateContext.fill();
  playerNameplateContext.font = 'bold 42px system-ui, sans-serif';
  playerNameplateContext.textAlign = 'center';
  playerNameplateContext.textBaseline = 'middle';
  playerNameplateContext.fillStyle = '#eef8ff';
  playerNameplateContext.fillText(displayName, 256, 62);
  playerNameplateTexture.needsUpdate = true;
}
updatePlayerNameplate(identity.displayName);

const savedState = persistence.loadPlayerState();
if (savedState) player.restoreTransform(savedState);
else player.restoreTransform({
  x: starterZone.definition.spawn.x,
  y: starterZone.definition.spawn.y,
  z: starterZone.definition.spawn.z,
  yaw: 0,
});
player.setAvatarAppearance(identity.avatarStyle, identity.avatarCustomization);

let cloudIdentity = identity;
let cloudAuthenticated = false;
let cloudBuildVersion = -1;
let buildRealtimeChannel: ReturnType<SupabasePersistence['subscribeBuildChanges']> | null = null;
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
  getDistrictLabel: () => {
    try {
      const worldId = String(livingWorld.getSnapshot().world ?? '');
      const regionId = WORLD_TO_REGION[worldId];
      if (!regionId) return null;
      const center = getWorldCenter(worldId);
      const d = districtAt(
        regionId,
        player.avatar.position.x,
        player.avatar.position.z,
        center?.x ?? 0,
        center?.z ?? 0,
      );
      return d ? d.name : null;
    } catch {
      return null;
    }
  },
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
  uiResetButton.hidden = !editing;
});
hud.appendChild(uiEditButton);

const uiResetButton = document.createElement('button');
uiResetButton.type = 'button';
uiResetButton.className = 'ui-reset-button';
uiResetButton.textContent = 'RESET';
uiResetButton.hidden = true;
uiResetButton.addEventListener('click', () => windowManager.resetLayout());
hud.appendChild(uiResetButton);

// Mount the existing major panels into the shared window system. This keeps
// profile, party, social, quests, economy and creator surfaces movable without
// creating a second layout manager.
const registerPanel = (id: string, title: string, selector: string, movable = true) => {
  const element = document.querySelector<HTMLElement>(selector);
  if (!element) return;
  windowManager.register({ id, title, element, defaultPosition: { x: 0, y: 0 }, movable, resizable: true });
};

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

hud.appendChild(uiResetButton);

let presence: SupabasePresence | null = null;
let currentBuildRole = 'viewer';
let regionCollaborators: Array<{id:string;displayName:string;role?:string;activeObjectId?:string}> = [];

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
    onSnapshot: players => {
      regionCollaborators = players.map(p => ({ id:p.id, displayName:p.displayName, role:p.regionRole, activeObjectId:p.activeObjectId }));
      const active = regionCollaborators.filter(p => p.activeObjectId).length;
      const summary = regionCollaborators.length ? `COLLABORATORS · ${regionCollaborators.length}${active ? ` · BUILDING ${active}` : ''}` : 'COLLABORATORS · 0';
      document.querySelector<HTMLElement>('[data-region-collaborators]')?.replaceChildren(document.createTextNode(summary));
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
  presence.connect(player.getTransform()).then(() => {
    reportBackgroundServiceRecovery('presence-connect','Realtime presence is back online.');
  }).catch(error => {
    reportBackgroundServiceFailure('presence-connect','Realtime presence is temporarily unavailable; continuing in local mode.');
    console.warn('Realtime presence unavailable; continuing in local mode.', error);
    status.textContent = 'FIRST LIGHT · MULTIPLAYER · Unavailable';
    presence = null;
  });
}

let combatAuthority: GridCombatAuthority | null = null;
type MarketQuote = {world:string;item_id:string;unit_price:number;currency_id:string;scarcity:number;demand:number};
let marketQuotes:MarketQuote[] = [];
let persistentTransitFlow = 0;
let persistentTransitByWorld:Record<string,number> = {};
let lastTransitPoll = 0;
let lastPartyPoll = 0;
let lastPartyDestinationPoll = 0;
let lastVitalsPublish = 0;
async function refreshPersistentTransit(){
  if(!cloudPersistence) return;
  try {
    const { data, error } = await cloudPersistence.getClient().from('grid_transit_traffic').select('source_world,destination_world,departures,arrivals,queue_depth,updated_at');
    if (error) throw error;
    if(!data) return;
    const now=Date.now();
    persistentTransitByWorld={};
    persistentTransitFlow=data.reduce((sum:any,row:any)=>{ const age=(now-Date.parse(row.updated_at))/60000; const freshness=Math.max(0,1-age/15); const flow=(Number(row.departures||0)+Number(row.arrivals||0)+Number(row.queue_depth||0)*.5)*freshness; const world=String(row.destination_world||row.source_world||''); persistentTransitByWorld[world]=(persistentTransitByWorld[world]||0)+flow; return sum+flow; },0);
    for(const key of Object.keys(persistentTransitByWorld)) persistentTransitByWorld[key]=Math.min(10,persistentTransitByWorld[key]);
    persistentTransitFlow=Math.min(10,persistentTransitFlow);
    reportBackgroundServiceRecovery('persistent-transit','Transit traffic data is back online.');
  } catch {
    reportBackgroundServiceFailure('persistent-transit','Transit traffic data is temporarily unavailable; world transit remains available.');
  }
}
async function refreshMarketQuotes() {
  if (!combatAuthority) return;
  const items:[string,string][] = [
    ['HARBOR','TIDE_SALT'],['GARDENS','BLOOM_RESIN'],['CITADEL','CROWN_RELIC'],['ARTS','MUSE_INK'],['WILDS','FRONTIER_ORE']
  ];
  try {
    const results = await Promise.all(items.map(([world,item]) => combatAuthority!.marketQuote(world,item,1)));
    marketQuotes = results.filter((r): r is NonNullable<typeof r> => !!r && !!r.ok).map(r => ({
      world:String((r as any).world ?? ''),
      item_id:String((r as any).item_id ?? ''),
      unit_price:Number((r as any).unit_price ?? 0),
      currency_id:String((r as any).currency_id ?? ''),
      scarcity:Number((r as any).scarcity ?? 1),
      demand:Number((r as any).demand ?? 1),
    }));
    reportBackgroundServiceRecovery('market-quotes','Market quote service is back online.');
  } catch (error) {
    reportBackgroundServiceFailure('market-quotes','Market quotes are temporarily unavailable; marketplace actions remain available.');
    console.warn('Market quote refresh unavailable.', error);
  }
}
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
          cloudAuthenticated = true;
          authenticated = true;
        } else {
          console.warn('Anonymous auth unavailable; presence will use the local visitor identity.');
          buildRegionStatus.set('LOCAL · CLOUD UNAVAILABLE', 'owner');
        }
      } catch (error) {
        buildRegionStatus.set('LOCAL · CLOUD UNAVAILABLE', 'owner');
        reportBackgroundServiceFailure('cloud-persistence','Cloud persistence is temporarily unavailable; local exploration and realtime presence remain available.');
        console.warn('Cloud persistence unavailable; continuing with realtime presence.', error);
      }

      if (authenticated) {
        easyBuildSystem.setOwnerUserId(cloudIdentity.id);
        await syncBuildAccessRole(String(livingWorld.getSnapshot().world));
        combatAuthority = new GridCombatAuthority(cloudPersistence.getClient());
        void refreshMarketQuotes();
        presence?.setIdentity(cloudIdentity);
        try {
          const cloudState = await cloudPersistence.load(cloudIdentity);
          if (cloudState) player.restoreTransform(cloudState);
          const region = await cloudPersistence.ensureBuildRegion('first-light', 'first-light', 'collaborative');
          buildRegionStatus.set('LIVE · '+region.accessMode.toUpperCase(),'');
          const buildAccess = await cloudPersistence.getBuildAccess(region.worldId, region.regionId);
          currentBuildRole = buildAccess?.role ?? 'viewer';
          buildRegionStatus.set(buildAccess?.canBuild ? 'LIVE · BUILD ENABLED' : 'LIVE · VIEW ONLY', currentBuildRole, Boolean(buildAccess?.canManage), () => {
            const panel = document.createElement('div');
            panel.id='grid-region-manager';
            panel.innerHTML='<strong>REGION MANAGEMENT</strong><span>OWNER / MANAGER CONTROLS</span><label>User ID <input data-member-user placeholder="auth user id"></label><label>Role <select data-member-role><option value="viewer">Viewer</option><option value="builder">Builder</option><option value="manager">Manager</option></select></label><button data-member-save>GRANT ACCESS</button><button data-member-close>CLOSE</button>';
            Object.assign(panel.style,{position:'fixed',right:'18px',bottom:'150px',zIndex:'81',display:'grid',gap:'8px',padding:'14px',width:'270px',fontFamily:'IBM Plex Mono,monospace',fontSize:'11px',background:'rgba(5,9,20,.96)',border:'1px solid rgba(120,220,255,.45)',borderRadius:'8px',color:'#dff7ff'});
            document.body.appendChild(panel);
            panel.querySelector<HTMLButtonElement>('[data-member-save]')?.addEventListener('click',async()=>{const userId=(panel.querySelector<HTMLInputElement>('[data-member-user]')?.value??'').trim();const role=(panel.querySelector<HTMLSelectElement>('[data-member-role]')?.value??'builder') as 'viewer'|'builder'|'manager';if(!userId)return;try{await cloudPersistence?.setBuildMember(region.worldId,region.regionId,userId,role);buildRegionStatus.set('ACCESS GRANTED · '+role.toUpperCase(),buildAccess?.role??'manager',true);}catch(error){console.warn('Region membership update failed.',error);buildRegionStatus.set('ACCESS UPDATE FAILED',buildAccess?.role??'manager',true);}});
            panel.querySelector<HTMLButtonElement>('[data-member-close]')?.addEventListener('click',()=>panel.remove());
          });
          const remoteBuilds = await cloudPersistence.loadBuilds(cloudIdentity, region.worldId, region.regionId);
          if (remoteBuilds.length) easyBuildSystem.restore(remoteBuilds.map(build => ({ objectId: build.objectId, id: build.definitionId, position: build.position, rotation: build.rotation, scale: build.scale, ownerUserId: build.ownerUserId })));
          buildRealtimeChannel = cloudPersistence.subscribeBuildChanges(region.worldId, region.regionId, (build, type) => {
            if (!build) return;
            easyBuildSystem.applyRemoteBuild({ ...build, ownerUserId: build.ownerUserId ?? '' }, type);
          });
          cloudBuildVersion = Number(easyBuildSystem.root.userData.buildStateVersion ?? 0);
          reportBackgroundServiceRecovery('cloud-state','Cloud world state is back online.');
        } catch (error) {
          buildRegionStatus.set('LOCAL · CLOUD STATE UNAVAILABLE', 'owner');
          reportBackgroundServiceFailure('cloud-state','Cloud world state is temporarily unavailable; local build state remains active.');
          console.warn('Cloud state unavailable; continuing with realtime presence.', error);
        }
      }
      return authenticated;
    })()
  : Promise.resolve(false);

if (!cloudPersistence) buildRegionStatus.set('LOCAL · CLOUD UNAVAILABLE', 'owner');

void hydratePersistentWorlds();

// Render locally first. Cloud persistence is optional and must never prevent the 3D world from booting.
const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 500);
camera.position.set(0, 3.2, 7);

let renderer: THREE.WebGLRenderer;
let webglAvailable = true;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.domElement.setAttribute('aria-label', 'Grid World 3D viewport');
  app.appendChild(renderer.domElement);
  engine.setRenderer(new ThreeGridRenderer(renderer));
  void engine.start();
} catch (error) {
  webglAvailable = false;
  console.warn('Grid World WebGL boot failed; starting visual fallback.', error);
  const fallback = document.createElement('canvas');
  fallback.className = 'grid-webgl-fallback';
  fallback.setAttribute('aria-label', 'Grid World visual fallback');
  fallback.width = Math.max(1, innerWidth * Math.min(devicePixelRatio, 2));
  fallback.height = Math.max(1, innerHeight * Math.min(devicePixelRatio, 2));
  app.appendChild(fallback);
  renderer = {
    domElement: fallback,
    setSize: () => undefined,
    setPixelRatio: () => undefined,
    shadowMap: { enabled: false },
  } as unknown as THREE.WebGLRenderer;

  const ctx = fallback.getContext('2d');
  if (ctx) {
    let tick = 0;
    const drawFallback = () => {
      const dpr = Math.min(devicePixelRatio, 2);
      const w = innerWidth;
      const h = innerHeight;
      fallback.width = Math.max(1, Math.floor(w * dpr));
      fallback.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, '#071426');
      sky.addColorStop(0.52, '#10283b');
      sky.addColorStop(1, '#040a11');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(92,220,255,.12)';
      ctx.lineWidth = 1;
      const horizon = h * .58;
      for (let x = -w; x < w * 2; x += 70) {
        ctx.beginPath(); ctx.moveTo(w / 2, horizon); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = horizon; y < h; y += 36 + (y - horizon) * .025) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(113,231,255,.35)';
      ctx.beginPath(); ctx.arc(w * .5, horizon - 80, 74 + Math.sin(tick) * 5, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * .5, horizon - 80, 112 + Math.cos(tick) * 8, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#dffcff';
      ctx.font = '700 15px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GRID ENGINE 0.1 · FIRST LIGHT', w * .5, horizon - 7);
      ctx.font = '600 9px "IBM Plex Mono", monospace';
      ctx.fillStyle = 'rgba(210,245,255,.58)';
      ctx.fillText('WEBGL UNAVAILABLE · VISUAL FALLBACK ACTIVE', w * .5, horizon + 13);
      tick += .02;
      requestAnimationFrame(drawFallback);
    };
    drawFallback();
  }
}

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
    reportBackgroundServiceRecovery('npc-archive','NPC memory and persistent transit archives are back online.');
  } catch (error) {
    reportBackgroundServiceFailure('npc-archive','NPC memory or persistent transit archives are temporarily unavailable; local NPC behavior and local transit remain active.');
    console.warn('NPC memory or teleport archive unavailable; local systems remain active.', error);
  }
});

let multiplayerLabel = 'MULTIPLAYER · Connecting…';

function handleTeleportNode(result: ReturnType<InteractionSystem['findTarget']>) {
  if (!result) return false;
  const nodeId = result.object.userData.gridTeleportNodeId as string | undefined;
  if (!nodeId) return false;

  const destinations = teleportSystem.destinations(nodeId, 'public', accountAgeBand);
  if (!destinations.length) {
    prompt.textContent = 'E · No destinations available';
    addChatMessage('GRID OMNI', 'This transit node has no available destinations.', 'system');
    audio.play('ui.error');
    return true;
  }

  const sourceVisual = teleportVisuals.find(v => v.userData.gridTeleportNodeId === nodeId);
  if (sourceVisual) setTeleportGateState(sourceVisual, 'selecting');
  void transitPanel.choose(result.name, destinations).then(destinationId => {
    if (!destinationId) {
      if (sourceVisual) setTeleportGateState(sourceVisual, 'idle');
      prompt.textContent = 'E · Transit cancelled';
      return;
    }

    if (!gridSecurity.allow('TELEPORT_REQUEST', cloudIdentity.id)) {
      if (sourceVisual) setTeleportGateState(sourceVisual, 'idle');
      prompt.textContent = 'E · Transit request rate-limited';
      addChatMessage('GRID OMNI', 'Transit request rate-limited by Grid Security.', 'system');
      return;
    }

    const teleport = teleportSystem.request({
      actorId: cloudIdentity.id,
      nodeId,
      destinationId,
      nowSeconds: performance.now() / 1000,
      relationship: 'public',
      ageBand: accountAgeBand,
    });

    if (!teleport.ok || !teleport.destination) {
      const message = teleport.reason === 'cooldown'
        ? 'Transit gate is recharging.'
        : teleport.reason === 'access-denied'
          ? 'This transit node is access controlled.'
          : teleport.reason === 'age-restricted'
          ? 'This destination is age-restricted for your account.'
          : 'Selected destination is unavailable; Grid Omni is holding the route.';
      if (sourceVisual) setTeleportGateState(sourceVisual, 'idle');
      prompt.textContent = 'E · ' + message;
      addChatMessage('GRID OMNI', message, 'system');
      audio.play('ui.error');
      return;
    }

    const destination = teleport.destination;
    teleportExperience.show(destination,'departing');
    createTeleportAvatarEffect(player.avatar,850);
    teleportSystem.recordTraffic(teleport.sourceNodeId ?? nodeId, destination.id);
    const arrival = new THREE.Vector3(destination.position.x, Math.max(0, destination.position.y), destination.position.z);
    const backward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), destination.yaw);
    arrival.addScaledVector(backward, Math.max(2.5, destination.clearanceRadius));

    if (sourceVisual) setTeleportGateState(sourceVisual, 'transit', destination.displayName);
    prompt.textContent = 'E · Entering ' + destination.displayName + '…';
    addChatMessage('GRID TRANSIT', 'Route locked: ' + destination.displayName + '. Gate transit engaged.', 'system');
    audio.play('world.portal', .8);

    window.setTimeout(() => {
      player.restoreTransform({
        x: arrival.x,
        y: arrival.y,
        z: arrival.z,
        yaw: destination.yaw,
      });
      teleportExperience.show(destination,'arriving');
      createTeleportAvatarEffect(player.avatar,700);
      audio.play('world.portal', 1);
      if (sourceVisual) setTeleportGateState(sourceVisual, 'idle');
      prompt.textContent = 'E · Arrived at ' + destination.displayName + ' ✓';
      addChatMessage('GRID TRANSIT', 'Arrived at ' + destination.displayName + '. Safe arrival clearance applied.', 'system');
      if (cloudPersistence) {
        cloudPersistence.getClient().from('grid_teleport_events').insert({
          actor_id: cloudIdentity.id,
          source_node_id: teleport.sourceNodeId ?? null,
          destination_node_id: destination.id,
          result: 'teleported',
        });
      }
    }, 850);
  });

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
  status.textContent = `FIRST LIGHT · ${identity.displayName} · WASD move · Shift sprint · Space jump · E interact · F attack · P PVP/PVE · mouse camera`;
}

function setMultiplayerStatus(label: string) {
  multiplayerLabel = label;
  status.textContent = `FIRST LIGHT · ${label}`;
}

let analyticsSessionStarted = false;
let analyticsInteractionCaptured = false;
let analyticsInteractionHookInstalled = false;
const openGridAnalyticsSettings = mountGridAnalyticsConsent((allowed) => {
  if (!allowed) {
    disableGridAnalytics();
    return;
  }
  if (!isGridAnalyticsEnabled()) return;
  if (!analyticsSessionStarted) {
    captureGridAnalytics('grid_world_session_started');
    analyticsSessionStarted = true;
  }
  if (!analyticsInteractionHookInstalled) {
    analyticsInteractionHookInstalled = true;
    renderer.domElement.addEventListener('pointerdown', () => {
      if (analyticsInteractionCaptured || !isGridAnalyticsEnabled()) return;
      analyticsInteractionCaptured = true;
      captureGridAnalytics('grid_world_first_interaction');
    });
  }
});

cloudReady.finally(() => {
  if (multiplayerLabel === 'MULTIPLAYER · Connecting…') setControlStatus();

document.querySelectorAll<HTMLButtonElement>('.grid-dock [data-tool]').forEach(button => {
  button.addEventListener('click', () => {
    const tool = button.dataset.tool;
    if (tool === 'profile') openIdentityPanel();
    else if (tool === 'build') easyBuildSystem.open();
    else if (tool === 'map') worldAtlas.open();
    else if (tool === 'field') fieldGuide.open();
    else if (tool === 'qr') qrScanner.open();
    else if (tool === 'team') teamArea.open();
    else if (tool === 'social') gridCommunityPanel?.open();
    else if (tool === 'settings') openGridAnalyticsSettings();
    else if (tool === 'inventory') openLandmarkInventory();
    else if (tool === 'wallet') gridEconomyPanel.open();
    else addChatMessage('GRID', tool + ' surface opened.', 'system');
  });
});
});

window.setTimeout(() => handleOmniSignal('starter-zone-ready', 'info', 'Starter zone security presence is active.'), 700);
window.setInterval(() => {
  const watched = omniLayer.pylons[Math.floor(Math.random() * omniLayer.pylons.length)];
  const diagnosis = watched.diagnose();
  if (diagnosis.status === 'clear') addChatMessage('GRID OMNI', watched.group.userData.interactionName + ' · preflight clear.', 'system');
}, 15000);

const gridMatterTerrain = new GridMatterTerrainSystem(camera, renderer.domElement);
world.scene.add(gridMatterTerrain.root);

async function savePersistentWorldContent(worldId: string) {
  if (!gridWorldContentAuthority || !persistentWorldIds.has(worldId) || !cloudAuthenticated) return;
  try {
    const npcState = npcSociety.exportPersistentState(worldId);
    const creatureState = creatureEcology.exportPersistentState(worldId);
    const questState = questSystem.exportState();
    const builds = easyBuildSystem.serialize().map(build => ({
      objectId: build.objectId,
      definitionId: build.id,
      position: build.position,
      rotation: build.rotation,
      scale: build.scale,
      ownerUserId: build.ownerUserId || cloudIdentity.id,
    }));
    await gridWorldContentAuthority.save({
      worldId,
      builds,
      terrain: gridMatterTerrain.serializeWorld(worldId),
      quests: {},
      consequences: worldConsequences.exportState(),
      npcState: [npcState as unknown as Record<string, unknown>],
      creatureState: [creatureState as unknown as Record<string, unknown>],
      metadata: { savedAt: new Date().toISOString(), version: 2 },
    });
    await gridWorldContentAuthority.savePlayerState(
      worldId,
      questState as unknown as Record<string, unknown>,
      Array.isArray(questState.interacted) ? questState.interacted as string[] : [],
      { savedAt: new Date().toISOString(), version: 2 },
    );
    reportBackgroundServiceRecovery('world-content-save','World changes are saving to the Grid again.');
  } catch (error) {
    reportBackgroundServiceFailure('world-content-save','World changes could not be saved to the Grid; local changes remain active until persistence recovers.');
    console.warn('Persistent world content save unavailable.', error);
  }
}

async function syncBuildAccessRole(worldId: string) {
  if (!cloudAuthenticated || !persistentWorldIds.has(worldId) || !gridWorldContentAuthority) {
    easyBuildSystem.setAccessRole('owner');
    return;
  }
  try {
    const role = await gridWorldContentAuthority.getRole(worldId);
    easyBuildSystem.setAccessRole(role);
    if (!role) addChatMessage('GRID BUILDER', 'You have no build permissions in this world.', 'system');
  } catch (error) {
    easyBuildSystem.setAccessRole('viewer');
    reportBackgroundServiceFailure('build-access', 'Build permissions are temporarily unavailable; build mode is held in view-only mode.');
    console.warn('Build role lookup unavailable.', error);
  }
}

async function loadPersistentWorldContent(worldId: string) {
  if (!gridWorldContentAuthority || !persistentWorldIds.has(worldId)) return;
  try {
    const [content, playerState] = await Promise.all([
      gridWorldContentAuthority.load(worldId),
      gridWorldContentAuthority.loadPlayerState(worldId),
    ]);
    gridMatterTerrain.setActiveWorld(worldId);
    gridMatterTerrain.restoreWorld(worldId, content?.terrain ?? []);
    easyBuildSystem.restore(content?.builds ?? []);
    if (content?.consequences) worldConsequences.importState(content.consequences);
    if (content?.npcState?.[0]) npcSociety.importPersistentState(content.npcState[0], worldId);
    if (content?.creatureState?.[0]) creatureEcology.importPersistentState(content.creatureState[0], worldId);
    if (playerState?.quests) questSystem.importState(playerState.quests);
    activePersistentContentWorldId = worldId;
    await syncBuildAccessRole(worldId);
    addChatMessage('WORLD STATE', 'Restored persistent content for ' + (getWorld(worldId)?.label ?? worldId) + '.', 'system');
    reportBackgroundServiceRecovery('world-content-restore','Persistent world content is back online.');
  } catch (error) {
    reportBackgroundServiceFailure('world-content-restore','Persistent world content could not be restored; this world is running with local state.');
    console.warn('Persistent world content restore unavailable.', error);
  }
}

async function syncPersistentWorldContent(worldId: string) {
  if (activePersistentContentWorldId === worldId) return;
  if (activePersistentContentWorldId) await savePersistentWorldContent(activePersistentContentWorldId);
  activePersistentContentWorldId = null;
  if (persistentWorldIds.has(worldId)) await loadPersistentWorldContent(worldId);
  else { easyBuildSystem.restore([]); await syncBuildAccessRole(worldId); }
}

easyBuildSystem.attach(camera, world.scene, renderer.domElement);

const creatorStudio = mountCreatorStudio({
  terrain: {
    setMode: mode => gridMatterTerrain.setMode(mode),
    setEnabled: enabled => gridMatterTerrain.setEnabled(enabled),
    setBrushRadius: radius => gridMatterTerrain.setBrushRadius(radius),
    setBrushStrength: strength => gridMatterTerrain.setBrushStrength(strength),
  },
  onCreateWorld: (name, description) => {
    const result = createFactoryWorld(name, description);
    void persistFactoryWorld(result);
  },
  onMessage: message => addChatMessage('CREATOR STUDIO', message, 'system'),
  security: gridSecurity,
  subjectId: identity.id,
});

const interaction = new InteractionSystem(camera, world.scene);

const prompt = document.querySelector<HTMLDivElement>('#interaction-prompt')!;

async function openLandmarkInventory(){
  if(!landmarkAuthority){addChatMessage('LANDMARKS','Saved destinations require Grid account services.','system');return;}
  if(!landmarkInventoryRoot || !document.body.contains(landmarkInventoryRoot)) landmarkInventoryRoot=mountGridLandmarkInventory(landmarkAuthority);
}

async function teleportToSavedLandmark(item:{label?:string;itemType?:string;metadata?:Record<string,unknown>}){
  const metadata=item.metadata??{};
  const worldId=String(metadata.worldId??'');
  const p=metadata.position;
  if(!worldId || !p || typeof p!=='object'){addChatMessage('GRID TRANSIT','This saved destination has incomplete route data.','system');return;}
  const pos=p as {x?:unknown;y?:unknown;z?:unknown;yaw?:unknown};
  const x=Number(pos.x),y=Number(pos.y),z=Number(pos.z),yaw=Number(pos.yaw??0);
  if(![x,y,z,yaw].every(Number.isFinite)){addChatMessage('GRID TRANSIT','This saved destination has invalid coordinates.','system');return;}
  const currentWorld=String(livingWorld.getSnapshot().world??'');
  const label=item.label??'Saved destination';
  const preview={id:'waypoint:'+worldId.toLowerCase(),displayName:label,regionId:String(metadata.regionId??'first-light'),position:{x,y,z},yaw,clearanceRadius:2};
  if(currentWorld!==worldId){
    const worldNode=teleportSystem.get('world-gate:'+worldId.toLowerCase());
    const sourceNode=teleportSystem.get('world-gate:'+currentWorld.toLowerCase());
    if(!sourceNode||!worldNode){addChatMessage('GRID TRANSIT','The saved world is not currently linked into the live transit network.','system');return;}
    const route=teleportSystem.request({actorId:cloudIdentity.id,nodeId:sourceNode.id,destinationId:worldNode.id,nowSeconds:performance.now()/1000,relationship:'public',ageBand:accountAgeBand});
    if(!route.ok||!route.destination){addChatMessage('GRID TRANSIT','Grid Omni could not authorize the saved route: '+route.reason+'.','system');audio.play('ui.error');return;}
    const destination=route.destination;
    teleportExperience.show(destination,'departing');createTeleportAvatarEffect(player.avatar,850);teleportSystem.recordTraffic(sourceNode.id,destination.id);
    addChatMessage('GRID TRANSIT','Saved destination selected: '+label+'. Entering '+destination.displayName+'.','system');audio.play('world.portal',.8);
    window.setTimeout(()=>{player.restoreTransform({x:destination.position.x,y:Math.max(0,destination.position.y),z:destination.position.z,yaw:destination.yaw});window.setTimeout(()=>{player.restoreTransform({x,y,z,yaw});teleportExperience.show(preview,'arriving');createTeleportAvatarEffect(player.avatar,700);prompt.textContent='E · Arrived at '+label+' ✓';addChatMessage('GRID TRANSIT','Arrived at saved '+(item.itemType??'WAYPOINT').toLowerCase()+': '+label+'.','system');audio.play('world.portal',1);},120);},850);
    return;
  }
  teleportExperience.show(preview,'departing');createTeleportAvatarEffect(player.avatar,850);addChatMessage('GRID TRANSIT','Saved destination selected: '+label+'. Transit engaged.','system');audio.play('world.portal',.8);
  window.setTimeout(()=>{player.restoreTransform({x,y,z,yaw});teleportExperience.show(preview,'arriving');createTeleportAvatarEffect(player.avatar,700);prompt.textContent='E · Arrived at '+label+' ✓';addChatMessage('GRID TRANSIT','Arrived at saved '+(item.itemType??'WAYPOINT').toLowerCase()+': '+label+'.','system');audio.play('world.portal',1);},850);
}

window.addEventListener('grid:landmark-create-current',(event)=>{
  if(!landmarkAuthority)return;
  const detail=(event as CustomEvent<{label?:string}>).detail;
  const label=String(detail?.label??'').trim();
  if(!label)return;
  const worldId=String(livingWorld.getSnapshot().world??'FIRST-LIGHT');
  const regionId=WORLD_TO_REGION[worldId]??'first-light';
  const position={x:player.avatar.position.x,y:player.avatar.position.y,z:player.avatar.position.z,yaw:player.heading};
  void landmarkAuthority.createWaypoint({label:label.trim(),itemType:'WAYPOINT',worldId,regionId,position,previewImageUrl:teleportPreviewUrl({id:'world-gate:'+worldId.toLowerCase(),displayName:label.trim(),regionId,position:{x:position.x,y:position.y,z:position.z},yaw:position.yaw??0,clearanceRadius:2}),description:'Saved from the Grid World traveler at the current location.',tags:['saved','waypoint',worldId.toLowerCase()]})
    .then(result=>{window.dispatchEvent(new CustomEvent('grid:landmark-created',{detail:result.item}));addChatMessage('LANDMARKS','Saved '+label.trim()+' to your waypoint inventory.','system');})
    .catch(error=>{addChatMessage('LANDMARKS','Could not save this destination. Sign in to persist landmarks.','system');console.warn('Landmark creation failed.',error);});
});
window.addEventListener('grid:landmark-select',(event)=>{
  const item=(event as CustomEvent).detail as {label?:string;itemType?:string;metadata?:Record<string,unknown>}|undefined;
  if(!item)return;
  void recordGridActivity('LANDMARK_USE','Landmark selected','Selected '+(item.label??'a saved destination')+' from the '+(item.itemType??'LANDMARK').toLowerCase()+' inventory.',String(livingWorld.getSnapshot().world),'first-light',{itemType:item.itemType??'LANDMARK',label:item.label??''});
  void teleportToSavedLandmark(item);
});

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
const gridSessionAuth = cloudPersistence ? new GridAuthService(cloudPersistence.getClient()) : null;
if (gridSessionAuth) {
  void gridSessionAuth.profile().then(profile => {
    if (!profile) return;
    identity = { ...identity, id: profile.id, displayName: profile.display_name, avatarStyle: profile.avatar_style, avatarCustomization: profile.avatar_customization };
    cloudIdentity = { ...cloudIdentity, id: profile.id, displayName: profile.display_name };
    writeVersioned('grid-world:identity', 1, identity);
    player.setAvatarAppearance(identity.avatarStyle, identity.avatarCustomization);
    updatePlayerNameplate(profile.display_name);
    identityButton.textContent = '✦ ' + (profile.handle || profile.display_name);
    const button = document.querySelector<HTMLButtonElement>('#auth-button');
    if (button) button.textContent = 'ACCOUNT';
    void presence?.setIdentity(cloudIdentity, player.getTransform());
  }).catch(error => { reportBackgroundServiceFailure('account-refresh', 'Account synchronization is temporarily unavailable.'); console.warn('Account profile refresh unavailable.', error); });
}

const avatarOptions = document.querySelector<HTMLDivElement>('#avatar-options')!;
const hudOptions = document.querySelector<HTMLDivElement>('#hud-options')!;
registerPanel('party-hud', 'Party Link', '.grid-party-hud');
registerPanel('field-guide', 'Field Guide', '.field-guide');
registerPanel('quest-journal', 'Mission Journal', '.gw-quest-panel');
registerPanel('team-workshop', 'Team Workshop', '.gw-team-panel');
registerPanel('social-panel', 'Grid Social', '.grid-social-card');
registerPanel('economy-panel', 'Grid Omni Economy', '.grid-economy-card');
registerPanel('target-profile', 'Grid Profile', '.grid-target-profile-card');

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

window.addEventListener('grid:open-identity', () => openIdentityPanel());

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
  presence?.update(player.getTransform()).then(() => reportBackgroundServiceRecovery('presence-sync', 'Presence synchronization is back online.')).catch(error => { reportBackgroundServiceFailure('presence-sync', 'Presence synchronization is temporarily unavailable.'); console.warn('Presence update failed.', error); });
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
  presence?.update(player.getTransform()).then(() => reportBackgroundServiceRecovery('presence-sync', 'Presence synchronization is back online.')).catch(error => { reportBackgroundServiceFailure('presence-sync', 'Presence synchronization is temporarily unavailable.'); console.warn('Presence update failed.', error); });
  closeIdentityPanel();
}

creatorButton.addEventListener('click', () => creatorStudio.open());
document.querySelector<HTMLButtonElement>('#creator-close')!.addEventListener('click', () => creatorPanel.classList.remove('open'));
creatorPanel.addEventListener('click', event => { if (event.target === creatorPanel) creatorPanel.classList.remove('open'); });
identityButton.addEventListener('click', () => { if (cloudPersistence) { const auth = new GridAuthService(cloudPersistence.getClient()); void auth.currentUser().then(user => user ? openIdentityPanel() : gridAuthPanel?.open('join')); } else openIdentityPanel(); });
identityCancel.addEventListener('click', closeIdentityPanel);
identitySave.addEventListener('click', saveIdentityName);
identityName.addEventListener('keydown', event => {
  if (event.key === 'Enter') saveIdentityName();
  if (event.key === 'Escape') closeIdentityPanel();
});
setControlStatus();

let firstPerson = false;
let cameraYaw = 0;
let cameraPitch = 0.32;
let cameraPanX = 0;
let cameraPanY = 0;
let cameraPanning = false;
let cameraDistance = 7;
let cameraInitialized = false;
let presenceTimer = 0;
let socialPresenceTimer = 0;
let saveTimer = 0;
let creatureCombatSyncTimer = 0;
let creatureCombatStateTimer = 0;
let creatureCombatAiTimer = 0;
let creatureAttackTimer = 0;
let lastCreatureThreatAt = 0;

function savePlayer() {
  const transform = player.getTransform();
  const state = {
    ...transform,
    regionId: 'first-light',
    updatedAt: new Date().toISOString(),
  };
  state.regionId = world.regions.findAt(transform.x, transform.z)?.definition.id ?? 'unmapped';
  persistence.savePlayerState(state);
  if (cloudPersistence) cloudPersistence.save(cloudIdentity, state).then(() => reportBackgroundServiceRecovery('cloud-player-save', 'Cloud player persistence is back online.')).catch(error => { reportBackgroundServiceFailure('cloud-player-save', 'Cloud player persistence is temporarily unavailable. Local recovery remains active.'); console.warn('Cloud player persistence unavailable; local recovery remains active.', error); });
  if (cloudPersistence && cloudAuthenticated) {
    const buildVersion = Number(easyBuildSystem.root.userData.buildStateVersion ?? 0);
    if (buildVersion !== cloudBuildVersion) {
      if (lastProfileActivityBuildVersion >= 0 && buildVersion !== lastProfileActivityBuildVersion) {
        void recordGridActivity('BUILD','Created or changed a build','Updated a structure or object in First Light.',''+livingWorld.getSnapshot().world,'first-light',{buildVersion});
      }
      lastProfileActivityBuildVersion = buildVersion;
      const builds = easyBuildSystem.serialize().map(build => ({ objectId: build.objectId, definitionId: build.id, position: build.position as [number,number,number], rotation: build.rotation as [number,number,number], scale: build.scale as [number,number,number], ownerUserId: typeof (build as any).ownerUserId === 'string' ? (build as any).ownerUserId : cloudIdentity.id }));
      cloudPersistence.saveBuilds(cloudIdentity, 'first-light', 'first-light', builds).then(() => {
        cloudBuildVersion = buildVersion;
        reportBackgroundServiceRecovery('cloud-build-save', 'Cloud build persistence is back online.');
      }).catch(error => {
        reportBackgroundServiceFailure('cloud-build-save', 'Cloud build persistence is temporarily unavailable. Local build changes remain active.');
        console.warn('Cloud build persistence unavailable; local recovery remains active.', error);
      });
    }
  }
  presence?.update(transform, { regionRole: currentBuildRole, activeObjectId: easyBuildSystem.getSelectedObjectId() }).then(() => reportBackgroundServiceRecovery('presence-sync', 'Presence synchronization is back online.')).catch(error => { reportBackgroundServiceFailure('presence-sync', 'Presence synchronization is temporarily unavailable.'); console.warn('Presence update failed.', error); });
}

// Second Life-style camera: Alt+LMB orbit, Alt+MMB pan, Alt+RMB zoom, wheel zoom, M mouselook.
let cameraGestureButton: number | null = null;
renderer.domElement.addEventListener('pointerdown', event => {
  if (!event.altKey || (event.button !== 0 && event.button !== 1 && event.button !== 2)) return;
  cameraGestureButton = event.button;
  renderer.domElement.setPointerCapture(event.pointerId);
  event.preventDefault();
});
renderer.domElement.addEventListener('pointermove', event => {
  if (cameraGestureButton === null) return;
  const rotateSensitivity = event.shiftKey ? 0.004 : 0.008;
  if (cameraGestureButton === 0) {
    cameraYaw -= event.movementX * rotateSensitivity;
    cameraPitch -= event.movementY * rotateSensitivity;
    cameraPitch = THREE.MathUtils.clamp(cameraPitch, -0.85, 1.15);
  } else if (cameraGestureButton === 1) {
    const panSensitivity = event.shiftKey ? 0.004 : 0.008;
    cameraPanX -= event.movementX * panSensitivity * Math.max(1, cameraDistance * 0.35);
    cameraPanY += event.movementY * panSensitivity * Math.max(1, cameraDistance * 0.35);
    cameraPanX = THREE.MathUtils.clamp(cameraPanX, -12, 12);
    cameraPanY = THREE.MathUtils.clamp(cameraPanY, -8, 8);
  } else if (cameraGestureButton === 2) {
    cameraDistance = THREE.MathUtils.clamp(cameraDistance + event.movementY * 0.04, 2.2, 16);
  }
});
renderer.domElement.addEventListener('pointerup', event => {
  if (cameraGestureButton === event.button) cameraGestureButton = null;
  try { renderer.domElement.releasePointerCapture(event.pointerId); } catch {}
});
renderer.domElement.addEventListener('pointercancel', () => { cameraGestureButton = null; });
renderer.domElement.addEventListener('contextmenu', event => event.preventDefault());
renderer.domElement.addEventListener('wheel', event => {
  cameraDistance = THREE.MathUtils.clamp(cameraDistance + event.deltaY * 0.012, 2.2, 16);
  if (cameraDistance <= 2.2 && event.deltaY < 0 && !firstPerson) {
    firstPerson = true;
    cameraDistance = 0.05;
    void renderer.domElement.requestPointerLock();
    status.textContent = 'MOUSELOOK · MOUSE AIM · WASD WALK';
  }
  event.preventDefault();
}, { passive: false });

addEventListener('mousemove', event => {
  if (document.pointerLockElement !== renderer.domElement) return;
  const sensitivity = 0.0025;
  cameraYaw -= event.movementX * sensitivity;
  cameraPitch -= event.movementY * sensitivity;
  cameraPitch = THREE.MathUtils.clamp(cameraPitch, -0.85, 1.15);
  player.setHeading(cameraYaw);
});

addEventListener('keydown', event => {
  if (event.repeat) return;
  if (event.key.toLowerCase() === 'm') {
    firstPerson = !firstPerson;
    if (firstPerson) {
      cameraDistance = 0.05;
      void renderer.domElement.requestPointerLock();
      status.textContent = 'MOUSELOOK · MOUSE AIM · WASD WALK · MOUSE WHEEL ZOOM';
    } else {
      document.exitPointerLock?.();
      cameraDistance = 7;
      status.textContent = 'THIRD PERSON · ALT+LMB ORBIT · ALT+MMB PAN · ALT+RMB ZOOM · WHEEL ZOOM · WASD / ARROWS WALK';
    }
  }
  if (event.key === 'Escape') {
    document.exitPointerLock?.();
    firstPerson = false;
    cameraDistance = 7;
    cameraPanX = 0;
    cameraPanY = 0;
    cameraPitch = 0.32;
    cameraYaw = player.heading;
    cameraPanning = false;
    status.textContent = 'THIRD PERSON · ALT+LMB ORBIT · ALT+MMB PAN · ALT+RMB ZOOM · WHEEL ZOOM · WASD / ARROWS WALK';
  }
});

addEventListener('keydown', event => {
  if (document.activeElement === chatInput || document.activeElement === identityName) return;
  if (event.code === 'KeyP' && !event.repeat) {
    // P opens profiles when targeting an NPC or remote player (see the
    // profile keydown handler below) — never toggle combat at the same time.
    const profileTarget = interaction.findTarget();
    if (profileTarget && (profileTarget.object.userData.npcProfile || profileTarget.object.userData.remotePlayerId)) return;
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
          if (result.defeated) {
            combatSystem.recordAuthoritativeKill(targetId);
          }
          combatSystem.applyAuthoritativeCreatureState(targetId, Number(creature?.health ?? 0), Number(creature?.max_health ?? 100), !result.defeated);
          if (result.defeated) {
            const species=String(target?.userData.species ?? 'creature');
            const defeatedWorld=livingWorld.getSnapshot().world as EcologyWorld;
            questSystem.recordCombatKill(species,defeatedWorld);
            worldConsequences.recordCreatureDefeat(defeatedWorld,species);
            addChatMessage('COMBAT', species.replaceAll('-', ' ') + ' defeated. The field remembers. Materials may have dropped.', 'system');
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
          if(result.defeated) combatSystem.recordAuthoritativeDefeat(targetId);
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
        addChatMessage(String(result.name), String(questInteraction.message ?? ''), 'team');
        audio.play('ui.confirm');
        questPanel.render();
        return;
      }
      worldConsequences.recordDiscovery(livingWorld.getSnapshot().world as EcologyWorld, 'A traveler interacted with '+result.name+'. The discovery is now part of local history.');
      gridKarma.record(identity.id, 'DISCOVER');
      prompt.textContent = `E · ${String(result.name)} ✓`;
      const npcBrain = result.object.userData.gridNpcBrain as { remember?: (memory: { subjectId?: string; eventType: string; summary: string; valence: number; importance: number; confidence: number }) => void; thought?: () => string } | undefined;
      const npcId = (result.object.userData.gridActorId as string | undefined) ?? String(result.object.userData.interactionName ?? result.name ?? '');
      if (result.object.userData.merchant === true && marketPanel) {
        marketPanel.open();
        gridEconomyPanel.openNpc(String(result.object.userData.npcProfileId ?? ('npc.merchant.' + String(result.name).toLowerCase())));
        prompt.textContent = 'E · Merchant Exchange';
        audio.play('ui.confirm');
        if (npcId && combatAuthority) {
          void combatAuthority.npcMemoryRead(npcId, 16).then(memoryResult => {
            const memories = memoryResult?.memories ?? [];
            const mine = memories.filter(m => String(m.subject_id ?? '') === identity.id);
            const tradeCount = mine.filter(m => String(m.event_type ?? '').toUpperCase() === 'MARKET_TRADE').length;
            const last = mine[0]?.summary ? String(mine[0].summary) : '';
            let line = tradeCount >= 3
              ? 'I know you. You have traded with me more than once.'
              : tradeCount > 0
                ? 'I remember our last trade. The exchange helped my stall.'
                : 'You are new to my stall. Let us see what the world has brought you.';
            if (last && tradeCount > 0) line += ' ' + last;
            addChatMessage(String(result.name), line, 'team');
          }).catch(error => { reportBackgroundServiceFailure('npc-memory', 'NPC memory services are temporarily unavailable.'); console.warn('Persistent NPC memory unavailable.', error); });
        }
      }
      if (npcBrain?.remember) {
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
      if (npcId && combatAuthority && performance.now() - lastNpcMemoryAt > 2500) {
        lastNpcMemoryAt = performance.now();
        void combatAuthority.npcMemoryWrite({
          npc_id: npcId,
          subject_type: 'player',
          subject_id: identity.id,
          event_type: 'player-interaction',
          summary: identity.displayName + ' interacted with me in First Light.',
          valence: .45,
          importance: .7,
          confidence: .95,
          visibility: 'public',
        }).then(() => combatAuthority?.npcMemoryRead(npcId, 6)).then(memoryResult => {
          const latest = memoryResult?.memories?.[0];
          if (latest?.summary) addChatMessage(String(result.name), String(latest.summary), 'team');
          reportBackgroundServiceRecovery('npc-memory', 'NPC memory services are back online.');
        }).catch(error => { reportBackgroundServiceFailure('npc-memory', 'NPC memory services are temporarily unavailable.'); console.warn('Persistent NPC memory unavailable.', error); });
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

addEventListener('keydown', (event) => {
  if (event.code !== 'KeyP' || event.repeat) return;
  const target = interaction.findTarget();
  if (!target) return;
  const profile = target.object.userData.npcProfile as import('./world/NPCProfile').NPCProfileRecord | undefined;
  const getRelationships = target.object.userData.relationships as (() => Array<{kind?:string;otherId?:string;affinity?:number;trust?:number}>) | undefined;
  if (profile) {
    showNPCProfile(profile, getRelationships?.() ?? []);
    prompt.textContent = 'P · PROFILE OPEN';
    audio.play('ui.focus');
    return;
  }
  const remoteId = target.object.userData.remotePlayerId ? String(target.object.userData.remotePlayerId) : null;
  if (!remoteId || !profileService) return;
  void profileService.get(remoteId).then(async publicProfile => {
    if (!publicProfile) return;
    const state=await profileService.connectionState(remoteId);
    showNPCProfile({
      id:publicProfile.id,
      displayName:publicProfile.displayName,
      role:'PLAYER',
      archetype:'player',
      world:publicProfile.worldId ?? 'UNKNOWN',
      gender:'unspecified',
      level:1,
      experience:0,
      traits:[publicProfile.online?'ONLINE':'OFFLINE'],
      skills:{},
      occupation:{title:'Grid Citizen',progression:0},
      home:{world:publicProfile.worldId ?? 'UNKNOWN',x:0,y:0,z:0},
      memories:[],
      relationshipIds:[],
      factionIds:[],
      inventory:[],
      certificates:[],
      tags:publicProfile.handle ? ['@'+publicProfile.handle] : []
    },[],{
      onFriend:()=>void socialAuthority?.requestFriend(remoteId).then(()=>addChatMessage('SOCIAL','Friend request sent.','system')).catch(()=>addChatMessage('SOCIAL','Friend request could not be sent.','system')),
      onFollow:()=>void gridSocialService?.toggleConnection(remoteId,'follow').then(active=>addChatMessage('SOCIAL',active?'Now following '+publicProfile.displayName+'.':'Unfollowed '+publicProfile.displayName+'.','system')).catch(()=>addChatMessage('SOCIAL','Follow action could not be completed.','system')),
      onMessage:()=>{chatInput.focus();chatInput.value='@'+(publicProfile.handle??remoteId)+' ';}, onPublicProfile:()=>{ const handle=publicProfile.handle??remoteId; window.open('/profile.html?handle='+encodeURIComponent(handle),'_blank','noopener,noreferrer'); }
    });
    prompt.textContent = 'P · PROFILE OPEN';
    if(state.friend) addChatMessage('SOCIAL','You are already friends with '+publicProfile.displayName+'.','system');
  }).catch(()=>addChatMessage('SOCIAL','Public profile is unavailable right now.','system'));
});
addEventListener('beforeunload', savePlayer);
addEventListener('beforeunload', () => { presence?.disconnect().catch(() => undefined); });

let last = performance.now();
let lastFootstepPosition = player.avatar.position.clone();

function animate(now: number) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  presenceTimer += dt;
  socialPresenceTimer += dt;
  if (socialPresenceTimer >= 30) {
    socialPresenceTimer = 0;
    void gridSocialService?.setPresence(true)
      .then(() => reportBackgroundServiceRecovery('social-presence', 'Social presence synchronization is back online.'))
      .catch(error => {
        reportBackgroundServiceFailure('social-presence', 'Social presence synchronization is temporarily unavailable.');
        console.warn('Social presence refresh unavailable.', error);
      });
  }
  saveTimer += dt;
  worldEventPollTimer += dt;

  if (combatAuthority && Math.floor(now / 1000) % 20 === 0 && Math.floor((now - dt*1000) / 1000) % 20 !== 0) {
    void combatAuthority.marketTick().then(() => refreshMerchantMarket()).then(() => reportBackgroundServiceRecovery('market-sync','Merchant market synchronization is back online.')).catch(() => reportBackgroundServiceFailure('market-sync','Merchant market synchronization is temporarily unavailable.'));
  }

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
    }).then(() => reportBackgroundServiceRecovery('world-events','World event updates are back online.')).catch(error => { reportBackgroundServiceFailure('world-events','World event updates are temporarily unavailable.'); console.warn('World event stream unavailable.', error); });
    worldEventPollTimer = 0;
  }

  const frame = engine.update(dt);
  if (document.pointerLockElement === renderer.domElement) {
    const moveInput = input.moveVector();
    if (Math.abs(moveInput.x) > .01 || Math.abs(moveInput.y) > .01) player.setHeading(cameraYaw);
  }
  player.update(dt);
  if (AVATAR_AUDIO_ENABLED && player.avatar.position.distanceToSquared(lastFootstepPosition) > 0.22) {
    audio.play('world.footstep', firstPerson ? .7 : .45);
    lastFootstepPosition.copy(player.avatar.position);
  }
  world.updateStreaming(player.avatar.position.x, player.avatar.position.z);
  world.update();
  for (const visual of teleportVisuals) {
    const signal = teleportSystem.trafficSnapshot().find(item => item.nodeId === visual.userData.gridTeleportNodeId);
    applyTeleportTraffic(visual, signal?.activity ?? 0);
  }
  livingWorld.update(dt, player.avatar.position.x, player.avatar.position.z, worldConsequences.getSnapshot(), worldEvolution.get(livingWorld.getSnapshot().world as EcologyWorld));
    merchantRefreshTimer += dt;
    mineralSyncTimer += dt;
    if (mineralSyncTimer >= 8) { mineralSyncTimer = 0; void syncGridMinerals(); }
    if(merchantRefreshTimer > 12) { merchantRefreshTimer = 0; void refreshMerchantMarket(); }
  const livingSnapshot = livingWorld.getSnapshot();
  const questSnapshot = questSystem.getSnapshot();
  if (questSnapshot.completed > lastProfileActivityQuestCompleted) {
    const completed = questSnapshot.completed - lastProfileActivityQuestCompleted;
    lastProfileActivityQuestCompleted = questSnapshot.completed;
    void recordGridActivity('QUEST_COMPLETE','Quest completed','Completed '+completed+' quest'+(completed===1?'':'s')+' in '+String(livingSnapshot.world)+'.',String(livingSnapshot.world),'first-light',{completed,totalCompleted:questSnapshot.completed,reward:questSnapshot.reward});
  }
  gridChakras.update(dt, []);
  const activeWorldId = String(livingSnapshot.world);
  const worldCapabilities = getWorldCapabilities(activeWorldId);
  gridMatterTerrain.setActiveWorld(activeWorldId);
  gridMatterTerrain.setWorldCapabilityEnabled(worldCapabilities.terrainSculpting ?? true);
  easyBuildSystem.setWorldCapabilityEnabled(worldCapabilities.building ?? true);
  gridMatterTerrain.rebuild();
  if (activePersistentContentWorldId !== activeWorldId) void syncPersistentWorldContent(activeWorldId);
  if (persistentWorldIds.has(activeWorldId)) {
    persistentContentSaveTimer += dt;
    if (persistentContentSaveTimer >= 20) { persistentContentSaveTimer = 0; void savePersistentWorldContent(activeWorldId); }
  }
  gridMinerals.update(dt, livingSnapshot.world as EcologyWorld);
  const consequenceSnapshot = worldConsequences.getSnapshot();
  creatureEcology.update(dt, player.avatar.position.x, player.avatar.position.z, livingSnapshot.world as EcologyWorld, livingSnapshot.event, livingSnapshot.phase, consequenceSnapshot, undefined, { weather: livingSnapshot.weather, temperatureC: livingSnapshot.temperatureC, windX: livingSnapshot.windX, windZ: livingSnapshot.windZ, season: livingSnapshot.season });
  const ecologySnapshot = creatureEcology.getSnapshot();

  if (combatAuthority) {
    creatureCombatSyncTimer += dt;
    creatureCombatStateTimer += dt;
    creatureCombatAiTimer += dt;
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
      }).then(() => reportBackgroundServiceRecovery('creature-combat', 'Creature combat services are back online.')).catch(error => { reportBackgroundServiceFailure('creature-combat', 'Creature combat services are temporarily unavailable.'); console.warn('Creature combat sync failed.', error); });
      creatureCombatSyncTimer=0;
    }

    if (creatureCombatAiTimer >= 0.85) {
      combatAuthority.tickCreatures().then(result => {
        for (const state of result?.creatures ?? []) {
          const object = world.scene.getObjectByProperty('userData.combatId', state.creature_id);
          if (object) {
            object.position.set(Number(state.x), Number(state.y), Number(state.z));
            object.userData.serverAiState = state.ai_state;
            object.userData.serverTargetUserId = state.target_user_id ?? null;
          }
          const respawning=Boolean(state.respawn_at && new Date(state.respawn_at).getTime()>Date.now());
          combatSystem.applyAuthoritativeCreatureState(
            state.creature_id,
            Number(state.health),
            Number(state.max_health),
            Number(state.health)>0 && !respawning
          );
          if (state.ai_state === 'ATTACK' && state.target_user_id === identity.id && performance.now() - lastCreatureThreatAt > 5000) {
            addChatMessage('WORLD', 'A nearby creature is reacting to your presence.', 'system');
            lastCreatureThreatAt = performance.now();
          }
        }
      }).then(() => reportBackgroundServiceRecovery('creature-ai', 'Creature AI services are back online.')).catch(error => { reportBackgroundServiceFailure('creature-ai', 'Creature AI services are temporarily unavailable.'); console.warn('Server creature AI tick failed.', error); });
      creatureCombatAiTimer=0;
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
      }).then(() => reportBackgroundServiceRecovery('creature-combat-state', 'Creature combat state is back online.')).catch(error => { reportBackgroundServiceFailure('creature-combat-state', 'Creature combat state is temporarily unavailable.'); console.warn('Creature combat state failed.', error); });
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
        }).catch(error => { reportBackgroundServiceFailure('creature-combat', 'Creature combat services are temporarily unavailable.'); console.warn('Creature combat retaliation unavailable.', error); });
      }
      creatureAttackTimer=0;
    }
  }
  // Day-cycle for NPCs: fraction of the real-world 24h day, matching the living-world phase clock.
  const npcDayFraction = ((((Date.now() / 1000) % 86400) + 86400) % 86400) / 86400;
  npcSociety.update(dt, player.avatar.position.x, player.avatar.position.z, livingSnapshot.world as EcologyWorld, livingSnapshot.event, livingSnapshot.phase, ecologySnapshot, consequenceSnapshot, npcDayFraction);
  if (lastProfileActivityWorld !== String(livingSnapshot.world)) {
    const enteredWorld = String(livingSnapshot.world);
    lastProfileActivityWorld = enteredWorld;
    void recordGridActivity('WORLD_VISIT','Entered '+enteredWorld,'Explored '+enteredWorld+' in the living Grid.',enteredWorld,'first-light',{event:livingSnapshot.event,phase:livingSnapshot.phase});
  }
  const latestPlayerConsequence = worldConsequences.getRecentHistory().filter(item => item.kind === 'PLAYER_DISCOVERY').at(-1);
  if (latestPlayerConsequence && latestPlayerConsequence.id !== lastProfileActivityConsequenceId) {
    lastProfileActivityConsequenceId = latestPlayerConsequence.id;
    void recordGridActivity('DISCOVERY','Discovery recorded',latestPlayerConsequence.text,String(latestPlayerConsequence.world),'first-light',{consequenceId:latestPlayerConsequence.id,event:latestPlayerConsequence.event});
  }
  guardCommandSystem.ensureDefaults(String(livingSnapshot.world));
  npcMaterialDropTimer += dt;
  const societySnapshot = npcSociety.getSnapshot();
  if (npcMaterialDropTimer >= 37 && societySnapshot.working) {
    npcMaterialDropTimer = 0;
    const worker = npcSociety.getWorkingCitizens().find(n=>n.world===livingSnapshot.world);
    if (worker) materialDropSystem.createDrop(worker.id,'NPC',String(livingSnapshot.world),worker.position.clone().add(new THREE.Vector3(.25,.15,.25)),worker.id.length + Math.round(performance.now()));
  }
  traversalSystem.update(dt);
  combatSystem.syncScene(world.scene);
  combatSystem.update(dt, identity.id);
  const combatSnapshot = combatSystem.getSnapshot();
  if (partySystem && performance.now()/1000-lastPartyPoll>3) { lastPartyPoll=performance.now()/1000; void partySystem.current().then(members=>{partyHud.update(members, Object.fromEntries(regionCollaborators.map(p=>[p.id,p.displayName]))); partyControlButton.style.display=members.some(m=>m.userId===cloudIdentity.id)?'block':'none'; if (members.length !== lastProfileActivityPartySize) { if (lastProfileActivityPartySize > 0 || members.length > 1) void recordGridActivity('PARTY','Party roster changed',members.length > 1 ? 'Party now has '+members.length+' members.' : 'Party roster returned to solo.',String(livingSnapshot.world),'first-light',{partySize:members.length}); lastProfileActivityPartySize=members.length; }}).then(()=>reportBackgroundServiceRecovery('party-roster','Party roster synchronization is back online.')).catch(()=>reportBackgroundServiceFailure('party-roster','Party roster synchronization is temporarily unavailable.')); }
  if (partySystem && performance.now()/1000-lastPartyDestinationPoll>1) { lastPartyDestinationPoll=performance.now()/1000; void partyDestinationTick(); }
  if (presence && performance.now()/1000-lastVitalsPublish>1) { lastVitalsPublish=performance.now()/1000; void presence.update(player.getTransform(), { health:combatSnapshot.playerHealth, maxHealth:combatSnapshot.playerMaxHealth, regionRole:currentBuildRole }); }
  questSystem.update(dt, livingSnapshot.world as EcologyWorld, livingSnapshot.event, societySnapshot, player.avatar.position.x, player.avatar.position.z);
  if (combatSnapshot.kills > lastCombatKills) {
    const defeated = combatSnapshot.kills - lastCombatKills;
    lastCombatKills = combatSnapshot.kills;
    void recordGridActivity('COMBAT','Combat victory','Defeated '+defeated+' hostile target'+(defeated===1?'':'s')+' in '+String(livingSnapshot.world)+'.',String(livingSnapshot.world),'first-light',{kills:combatSnapshot.kills,defeated});
    for (let dropIndex=0; dropIndex<defeated; dropIndex++) {
      materialDropSystem.createDrop('creature-'+combatSnapshot.kills+'-'+dropIndex,'CREATURE',String(livingSnapshot.world),player.avatar.position.clone().add(new THREE.Vector3((Math.random()-.5)*1.6,.35,(Math.random()-.5)*1.6)),combatSnapshot.kills+dropIndex);
    }
    addChatMessage('COMBAT', defeated === 1 ? 'Hostile target defeated. The field remembers. Materials may have dropped.' : defeated + ' hostile targets defeated. Materials may have dropped.', 'system');
    questPanel.render();
  }
  relationshipStories.update(dt, livingSnapshot.world as EcologyWorld, livingSnapshot.event, livingSnapshot.phase, societySnapshot, player.avatar.position.x, player.avatar.position.z);
  if (performance.now()/1000-lastTransitPoll>10) { lastTransitPoll=performance.now()/1000; void refreshPersistentTransit(); }
  worldConsequences.update(dt, livingSnapshot.world as EcologyWorld, livingSnapshot.event, livingSnapshot.activity, ecologySnapshot, societySnapshot, Date.now()/1000, persistentTransitFlow);
  npcSociety.applyTransitInfluence(persistentTransitByWorld);
  for(const [transitWorld,flow] of Object.entries(persistentTransitByWorld)) worldConsequences.recordTransitSurge(transitWorld as EcologyWorld,flow);
  worldEvolution.update(dt, livingSnapshot, worldConsequences.getSnapshot());
  ecologicalWeb.update(dt, livingSnapshot, worldEvolution.get(livingSnapshot.world as EcologyWorld));
  ecologicalInteractions.update(dt, livingSnapshot.world as EcologyWorld);
  evolutionaryPopulations.update(dt, livingSnapshot, worldEvolution.get(livingSnapshot.world as EcologyWorld), ecologicalWeb.getWorldSnapshot(livingSnapshot.world as EcologyWorld));
  worldConsequences.recordEcologyPulse(
    livingSnapshot.world as EcologyWorld,
    ecologicalInteractions.getSnapshot(),
    evolutionaryPopulations.getAll().filter(population => population.world === livingSnapshot.world).map(population => ({ speciesId: population.speciesId, population: population.population, generation: population.generation })),
    livingSnapshot.season,
    Date.now()/1000,
  );
  for (const emergent of evolutionaryPopulations.consumeEmergentSpecies()) {
    worldConsequences.recordNewSpecies(livingSnapshot.world as EcologyWorld, emergent.name, emergent.generation);
  }
  worldConsequences.update(0, livingSnapshot.world as EcologyWorld, livingSnapshot.event, livingSnapshot.activity, ecologySnapshot, societySnapshot, Date.now()/1000, persistentTransitFlow);
  const evolutionState = worldEvolution.get(livingSnapshot.world as EcologyWorld);
  const ecologicalWebSnapshot = ecologicalWeb.getAll().filter(population => population.world === livingSnapshot.world);
  const consequenceSnapshotForResources = worldConsequences.getSnapshot();
  const nearestResource = worldResources.getSnapshot().filter(node => node.world === livingSnapshot.world).sort((a,b) => a.position.distanceTo(player.avatar.position)-b.position.distanceTo(player.avatar.position))[0];
  const resourceNear = !!nearestResource && nearestResource.position.distanceTo(player.avatar.position) < 2.2;
  const nearestMineral = gridMinerals.getSnapshot()
    .filter(node => node.world === livingSnapshot.world && node.remaining > 0)
    .sort((a,b) => a.position.distanceTo(player.avatar.position) - b.position.distanceTo(player.avatar.position))[0];
  const mineralNear = !!nearestMineral && nearestMineral.position.distanceTo(player.avatar.position) < 2.2;
  const resourceDown = input.isDown('KeyE');
  const nearestMaterialDrop = materialDropSystem.getSnapshot().filter(drop => drop.worldId === String(livingSnapshot.world)).sort((a,b)=>a.position.distanceTo(player.avatar.position)-b.position.distanceTo(player.avatar.position))[0];
  const materialDropNear = !!nearestMaterialDrop && nearestMaterialDrop.position.distanceTo(player.avatar.position) < 2.2;
  if (materialDropNear && !mineralNear && !resourceNear) prompt.textContent = resourceDown ? 'E · Collect ' + nearestMaterialDrop!.material : 'E · Collect ' + nearestMaterialDrop!.material;
  if (!resourceDown) materialDropInteractLatched=false;
  if (nearestMaterialDrop && materialDropNear && resourceDown && !materialDropInteractLatched && !mineralNear && !resourceNear) {
    materialDropInteractLatched=true;
    const drop=materialDropSystem.collect(nearestMaterialDrop.id);
    if (drop) {
      const builder=world.scene.userData.easyBuild as GridEasyBuildSystem;
      builder.addMaterials({[drop.material]:drop.amount});
      addChatMessage('MATERIALS','+'+drop.amount+' '+drop.material+' · usable for construction tools and crafted objects.','system');
    }
  }
  if (mineralNear) prompt.textContent = resourceDown ? 'E · Mine ' + nearestMineral!.kind : 'E · Mine ' + nearestMineral!.kind;
  if (resourceNear && !mineralNear) prompt.textContent = resourceDown ? 'E · Gather' : 'E · Gather';
  if (!resourceDown) resourceInteractLatched = false;
  if (nearestMineral && mineralNear && resourceDown && !resourceInteractLatched) {
    resourceInteractLatched = true;
    if (!gridSecurity.allow('MINING_REQUEST', identity.id)) {
      addChatMessage('GRID OMNI', 'Mining request rate-limited by Grid Security.', 'system');
      return;
    }
    const requested = 1;
    if (cloudPersistence) {
      void Promise.resolve(cloudPersistence.getClient().rpc('grid_mine_mineral', {
        p_deposit_id: nearestMineral.id,
        p_amount: requested,
      })).then(({ data, error }) => {
        if (error) throw error;
        const result = Array.isArray(data) ? data[0] : data;
        if (result?.ok) {
          gridMinerals.applyAuthoritativeResult(nearestMineral.id, Number(result.gathered), Number(result.remaining));
          const definition = GRID_MINERALS[result.mineral_kind as GridMineralKind];
          addChatMessage('MINING', 'Mined +' + result.gathered + ' ' + (definition?.name ?? result.mineral_kind) + ' · deposit remaining ' + result.remaining + '.', 'system');
        } else {
          addChatMessage('MINING', 'No mineral extracted. The deposit may be depleted or the request was rejected.', 'system');
        }
      }).catch(() => addChatMessage('MINING', 'Mining authority unavailable. No mineral was awarded.', 'system'));
    } else {
      const mined = gridMinerals.collectLocal(nearestMineral.id, requested);
      if (mined.ok) {
        addChatMessage('MINING', 'Local preview mining: +' + mined.amount + ' ' + mined.kind + '.', 'system');
      }
    }
  }
  if (nearestResource && resourceNear && resourceDown && !resourceInteractLatched) {
    resourceInteractLatched = true;
    if (combatAuthority) {
      void combatAuthority.gatherResource(nearestResource.id).then(result => {
          const resource = (result as any)?.resource as { kind?: string; amount?: number } | undefined;
          if ((result as any)?.ok && resource?.kind && resource.amount) {
            worldResources.collect(nearestResource.id, Number(resource.amount));
            worldConsequences.recordResourceGathered(livingSnapshot.world as EcologyWorld, resource.kind as any, Number(resource.amount));
            addChatMessage('RESOURCE', 'Gathered +' + resource.amount + ' ' + resource.kind.replaceAll('_',' ') + ' · secured to inventory.', 'system');
          } else if ((result as any)?.error) {
            addChatMessage('RESOURCE', String((result as any).error).replaceAll('_',' '), 'system');
          }
        }).catch(() => addChatMessage('RESOURCE', 'Server resource service unavailable.', 'system'));
    } else {
      const gathered = worldResources.collect(nearestResource.id, 8);
      if (gathered.ok && gathered.kind) {
        worldConsequences.recordResourceGathered(livingSnapshot.world as EcologyWorld, gathered.kind, gathered.amount);
        addChatMessage('RESOURCE', 'Gathered +' + gathered.amount + ' ' + gathered.kind.replaceAll('_',' ') + '.', 'system');
      }
    }
  }
  worldResources.update(dt, livingSnapshot.world as EcologyWorld, livingSnapshot.event, consequenceSnapshotForResources);
  const consequenceSnapshotAfterUpdate = worldConsequences.getSnapshot();
  if (consequenceSnapshot.history.length > 0) {
    const latestConsequence = consequenceSnapshotAfterUpdate.history.at(-1)!;
    if (latestConsequence.id !== lastConsequenceId) {
      lastConsequenceId = latestConsequence.id;
      if (latestConsequence.kind === 'EVENT_STARTED' || latestConsequence.kind === 'CREATURE_DEFEATED' || latestConsequence.kind === 'ECOLOGY_SHIFT') addChatMessage('GRID HISTORY', latestConsequence.text, 'system');
    }
  }
  const latestStory = relationshipStories.getLatestStory();
  const latestConsequenceForQuest = worldConsequences.getSnapshot().history.at(-1) ?? null;
  if (dynamicQuestSystem.update(dt, livingSnapshot.world as EcologyWorld, livingSnapshot.event, livingSnapshot.phase, societySnapshot, latestStory, player.avatar.position.x, player.avatar.position.z, latestConsequenceForQuest)) questPanel.render();
  if (latestStory && latestStory.id !== lastStoryId) {
    lastStoryId = latestStory.id;
    addChatMessage('WORLD STORY', latestStory.text, 'system');
  }
  const storySnapshot = relationshipStories.getSnapshot();
  const hudWorldState = document.querySelector<HTMLElement>('#hud-world-state');
  const hudWorldSignal = document.querySelector<HTMLElement>('#hud-world-signal');
  if (hudWorldState) hudWorldState.textContent = livingSnapshot.world + ' · ' + livingSnapshot.phase + ' · ' + livingSnapshot.season;
  if (hudWorldSignal) hudWorldSignal.textContent = livingSnapshot.eventFlavor + ' · ' + livingSnapshot.weather + ' · ' + Math.round(livingSnapshot.temperatureC) + '°C · HUM ' + Math.round(livingSnapshot.humidity*100) + '% · ' + ecologySnapshot.active + '/' + ecologySnapshot.population + ' CREATURES · ' + societySnapshot.working + ' WORKING · ' + societySnapshot.talking + ' TALKING · ' + storySnapshot.activeStories + ' STORIES · STABILITY ' + Math.round(consequenceSnapshotAfterUpdate.stability*100) + '% · ECO GEN ' + evolutionState.generation + ' · EVOLUTION ' + (evolutionaryPopulations.get(livingSnapshot.world as EcologyWorld)?.generation ?? 1) + ' · FOOD WEB ' + ecologicalWebSnapshot.map(population => population.role + ' ' + Math.round(population.health*100) + '%').join(' / ');
  artDirector.update(dt, player.avatar.position.x, player.avatar.position.z);
  worldSkins.update(dt, player.avatar.position.x, player.avatar.position.z);
  // World-scoped render systems receive the same active-world context as simulation systems.
  // This prevents generated architecture/environment layers from leaking across worlds.
  worldArchitecture.update(dt, player.avatar.position.x, player.avatar.position.z);
  worldEnvironment.update(dt, player.avatar.position.x, player.avatar.position.z);
  teamWork.update(dt, frame.elapsedSeconds);
  foundationLayer.update(dt, frame.elapsedSeconds);
  // Keep scene actors world-scoped as well. Simulation already carries the active-world
  // identity; this prevents remote/crowd visuals from bleeding into another world.
  const nearestWorldIdAt = (x:number, z:number) => {
    let nearest = Infinity;
    let nearestId = activeWorldId;
    for (const candidate of getWorlds()) {
      const distance = Math.hypot(x - candidate.center.x, z - candidate.center.z);
      if (distance < nearest) { nearest = distance; nearestId = candidate.id; }
    }
    return nearestId;
  };
  for (const remote of remotePlayers.values()) {
    remote.update(dt);
    remote.group.visible = nearestWorldIdAt(remote.group.position.x, remote.group.position.z) === activeWorldId;
  }
  for (const avatar of teamAvatars) avatar.update(dt, player.avatar.position);
  for (const actor of crowdActors) {
    actor.update(dt, { routinePhase: routinePhaseFor(resolveNpcRoutine(), hourOfDayFromDayFraction(npcDayFraction)) });
    actor.group.visible = nearestWorldIdAt(actor.group.position.x, actor.group.position.z) === activeWorldId;
  }
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
    if (socialAuthority) void friendSystem.refresh(socialAuthority).then(() => reportBackgroundServiceRecovery('friend-sync', 'Friend relationship synchronization is back online.')).catch(error => { reportBackgroundServiceFailure('friend-sync', 'Friend relationship synchronization is temporarily unavailable.'); console.warn('Friend relationship sync failed.', error); });
    const transform = player.getTransform();
    presence?.update(transform).then(() => reportBackgroundServiceRecovery('presence-sync', 'Presence synchronization is back online.')).catch(error => {
      reportBackgroundServiceFailure('presence-sync', 'Presence synchronization is temporarily unavailable.');
      console.warn('Presence update failed.', error);
    });
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
    }).then(() => reportBackgroundServiceRecovery('combat-authority', 'Combat services are back online.')).catch(error => { reportBackgroundServiceFailure('combat-authority', 'Combat services are temporarily unavailable.'); console.warn('Combat authority sync failed.', error); });
    presenceTimer = 0;
  }
  if (saveTimer >= 2) {
    savePlayer();
    saveTimer = 0;
  }
  worldSnapshotManager.tick(dt * 1000, () => ({
    player: { ...player.getTransform(), regionId: 'first-light' },
    world: livingWorld.getSnapshot(),
    builds: easyBuildSystem.serialize(),
    health: { savedAt: new Date().toISOString() },
  }));

  if (!cameraInitialized) {
    cameraYaw = player.heading;
    cameraInitialized = true;
  }
  const distance = firstPerson ? 0.05 : cameraDistance;
  const height = firstPerson ? 1.55 : 3.2;
  const pivot = new THREE.Vector3(
    player.avatar.position.x,
    player.avatar.position.y + (firstPerson ? 1.55 : 1.15),
    player.avatar.position.z
  );
  const cameraOffset = new THREE.Vector3(
    Math.sin(cameraYaw) * distance,
    Math.sin(cameraPitch) * distance + (firstPerson ? 0 : 0.8),
    Math.cos(cameraYaw) * distance
  );
  const cameraTarget = pivot.clone().add(cameraOffset);
  cameraTarget.x += cameraPanX;
  cameraTarget.y += cameraPanY;
  camera.position.lerp(cameraTarget, 1 - Math.pow(0.001, dt));
  // Third-person camera looks back toward the avatar; mouselook looks through the avatar's eyes.
  // The previous implementation looked in the same direction as the camera offset,
  // placing the target behind the camera and producing an apparently blank world.
  const lookTarget = pivot.clone();
  lookTarget.x += cameraPanX;
  lookTarget.y += cameraPanY;
  if (firstPerson) {
    lookTarget.add(new THREE.Vector3(
      Math.sin(cameraYaw) * 8,
      Math.sin(cameraPitch) * 8,
      Math.cos(cameraYaw) * 8
    ));
  }
  camera.lookAt(lookTarget);

  const targetObject = interaction.findTarget();
  const targetUserId = targetObject?.object.userData.remotePlayerId ? String(targetObject.object.userData.remotePlayerId) : null;
  setSocialTarget(targetUserId);
  prompt.classList.toggle('visible', Boolean(targetObject));
  if (targetObject) prompt.textContent = `E · ${targetObject.name}`;

  if (webglAvailable) engine.render(camera, frame);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

addEventListener('beforeunload', () => { void gridSocialService?.setPresence(false).catch(()=>undefined); buildRealtimeChannel?.unsubscribe(); });

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  engine.resize(innerWidth, innerHeight, devicePixelRatio);
});