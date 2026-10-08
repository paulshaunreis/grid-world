import './site.css';
import './theme/grid-theme.css';
import './site-asset-health';
import { QRScanner } from './ui/QRScanner';
import { mountGridLiveFeed } from './site-live-feed';
import { TEAM_WORK_TASKS } from './world/TeamWorkSystem';
import { TEAM_AVATARS } from './avatars/teamRoster';
import { GridOperatorService } from './operator/GridOperatorService';
import { mountGridOperatorPanel } from './ui/GridOperatorPanel';
import { createClient } from '@supabase/supabase-js';
import {
  initTheme, startThemeSync, applyCustomAccent,
  GRID_SWATCHES, isSwatchUnlocked, getAllSkins, currentSeason,
} from './theme/GridTheme';
import { DISTRICT_IDENTITIES } from './theme/districts';
import { readLocalLocale, writeLocalLocale } from './i18n/GridLanguageService';
import { GRID_SUPPORTED_LOCALES } from './core/GridLanguagePreferences';

/* Region cards render from the canonical district table (src/theme/districts.ts)
   so the site and the in-world districts can never drift apart. */
function renderWorldCards(): string {
  return DISTRICT_IDENTITIES.map((d, i) => {
    const n = String(i + 1).padStart(2, '0');
    if (d.status === 'live') {
      return `<div class="world-card district-${d.id}"><span class="concept-badge">CONCEPT ART</span>` +
        `<img src="${d.art}" alt="${d.label} concept art">` +
        `<div><small>${n} · ${d.label}</small><h3>${d.title}</h3><p>${d.detail}</p></div>` +
        `<a href="${d.entryHref}">${d.id === 'tideline' ? 'ENTER →' : 'DISCOVER →'}</a></div>`;
    }
    return `<div class="world-card dev district-${d.id}"><span class="concept-badge dev-badge">IN DEVELOPMENT</span>` +
      `<div class="dev-sigil" aria-hidden="true">◈</div>` +
      `<div><small>${n} · ${d.label}</small><h3>${d.title}</h3><p>${d.detail}</p></div>` +
      `<a href="#discover">FOLLOW PROGRESS →</a></div>`;
  }).join('');
}

function renderDistrictStrip(): string {
  return `<div class="district-strip" aria-label="Region identities">` +
    DISTRICT_IDENTITIES.map(d =>
      `<a href="#worlds" class="district-dot${d.status === 'development' ? ' dev' : ''}" ` +
      `style="--dot:var(--gw-district-${d.id})" title="${d.label}${d.status === 'development' ? ' · in development' : ''}"></a>`
    ).join('') +
    `<span>ONE GRID · NINE REGIONS</span></div>`;
}

/* Shared GridWorld accent theme: match the in-world starter UI, and stay
   synced live with the game + marketplace via cross-tab storage events. */
initTheme();
startThemeSync(()=>renderSiteThemePicker());

const app = document.querySelector<HTMLDivElement>('#site')!;
const qrScanner = new QRScanner();
const operatorUrl=import.meta.env.VITE_SUPABASE_URL as string|undefined;
const operatorKey=import.meta.env.VITE_SUPABASE_ANON_KEY as string|undefined;
const operator=operatorUrl&&operatorKey?mountGridOperatorPanel(new GridOperatorService(createClient(operatorUrl,operatorKey))):null;

const navItems = [
  ['Home','/'], ['Discover','/#discover'], ['Communities','/#communities'], ['Events','/meetups.html'], ['Marketplace','/marketplace.html'], ['Creator Hub','/grid-world-studio.html']
] as const;
const siteStyles = ['aurora', 'studio', 'terminal', 'garden'] as const;
type SiteStyle = typeof siteStyles[number];
const SITE_STYLE_KEY = 'grid-world:site-style';
let siteStyle = (localStorage.getItem(SITE_STYLE_KEY) as SiteStyle | null) ?? 'aurora';
document.documentElement.dataset.siteStyle = siteStyle;

// Team feed posts load live from grid_team_posts (Supabase).
// Falls back to a labeled sample set if the backend is unreachable —
// never fake timestamps or engagement counts.
interface TeamPost {
  author_id: string;
  author_name: string;
  author_role: string;
  region: string | null;
  tag: string;
  body: string;
  created_at: string;
}

const SAMPLE_POSTS: TeamPost[] = [
  { author_id: 'aurora', author_name: 'Aurora', author_role: 'World Coordinator', region: 'First Light', tag: 'WORLD UPDATE', body: 'First Light is online. The world is beginning to change with time, weather, and living systems.', created_at: new Date().toISOString() },
];

function formatPostAge(iso: string): string {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return s + 's';
  const m = Math.floor(s / 60);
  if (m < 60) return m + 'm';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h';
  return Math.floor(h / 24) + 'd';
}

async function loadTeamPosts(): Promise<{ posts: TeamPost[]; live: boolean }> {
  if (!supabaseConfigured || !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    return { posts: SAMPLE_POSTS, live: false };
  }
  try {
    const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    const { data, error } = await client
      .from('grid_team_posts')
      .select('author_id,author_name,author_role,region,tag,body,created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    if (error || !data?.length) return { posts: SAMPLE_POSTS, live: false };
    return { posts: data as TeamPost[], live: true };
  } catch {
    return { posts: SAMPLE_POSTS, live: false };
  }
}

app.innerHTML = `
  <header class="site-header">
    <a class="brand" href="#home"><img class="brand-logo" src="/grid-world-logo.svg" alt="Grid World"><span>GRID WORLD</span></a>
    <nav>${navItems.map(([label, href], i) => `<a href="${href}" class="${i === 0 ? 'active' : ''}">${label}</a>`).join('')}</nav>
    <div class="header-actions">
      <select class="site-language-picker" id="site-language-picker" title="Language — applies across the website and in-world" aria-label="Language">
        ${GRID_SUPPORTED_LOCALES.map(l => `<option value="${l}"${l === readLocalLocale() ? ' selected' : ''}>${l}</option>`).join('')}
      </select>
      <div class="site-theme-picker" id="site-theme-picker" title="Interface accent — synced live with the game"></div>
      <button class="ghost style-trigger" id="style-trigger" type="button">STYLE</button><button class="operator-trigger" id="operator-trigger" type="button">GRID OPERATOR</button>
      <button class="ghost" id="site-qr" type="button">QR</button>
      <a class="ghost" href="/economics.html">ECONOMICS</a><a class="ghost" href="/marketplace.html">MARKET</a><a class="ghost" href="/sound.html">SOUND</a><a class="ghost" href="/grid-world-studio.html">GRID WORLD STUDIO</a><a class="ghost" href="/omni.html">OMNI</a><a class="ghost" href="/directory.html">STAFF</a><a class="ghost" href="/avatars.html">AVATARS</a><a class="ghost" href="/textures.html">TEXTURES</a><a class="ghost" href="/docs.html">DOCS</a><a class="ghost" href="/profile.html">PROFILE</a>
      <a class="secondary" href="/join.html">JOIN GRID</a><a class="primary" href="/play.html">ENTER WORLD</a>
    </div>
  </header>
  <div class="site-live-clock" id="site-live-clock" aria-live="polite">GRID SIGNAL · <span>SYNCING</span></div>
  <div class="style-panel" id="style-panel" aria-label="Website style selector">
    <div class="style-panel-title">SITE VISUAL LANGUAGE</div>
    <p>Try different Grid World surface styles. Your choice is stored locally.</p>
    <div class="style-options" id="style-options"></div>
  </div>

  <main>
    <section class="hero" id="home">
      <div class="visual-build-badge">GRID WORLD · VISUAL BUILD 01 OCT 2026 · LIVE</div>
      <div class="hero-art" aria-hidden="true"></div>
      <img class="hero-image-proof" src="/art/hero-worlds.webp?v=20261001" alt="Grid World concept art showing multiple connected living worlds">
      <div class="hero-grid"></div>
      <div class="hero-copy">
        <div class="eyebrow">A PERSISTENT FRAMEWORK FOR WORLDS</div>
        <h1>One grid.<br><span>Infinite worlds.</span></h1>
        <p>Explore connected worlds, meet people, create experiences, and build places that keep evolving even when you're offline.</p>
        <div class="hero-actions">
          <a class="primary large" href="/join.html">JOIN GRID WORLD</a>
          <a class="secondary large" href="#discover">EXPLORE WORLDS</a>
        </div>
        <div class="hero-stats"><span><b>05</b> built regions</span><span><b>04</b> in development</span><span><b>∞</b> expandable worlds</span><span><b>24/7</b> persistent simulation</span></div>
        ${renderDistrictStrip()}
      </div>
      <div class="hero-orb"><div class="orb-ring r1"></div><div class="orb-ring r2"></div><div class="orb-core">GRID<br><small>FIRST LIGHT</small></div><div class="orb-caption">LIVE PROTOTYPE · IN-WORLD TRANSIT LENS</div></div>
    </section>

    <section class="concept-gallery" id="concept-art">
      <div class="section-label">GRID WORLD · CONCEPT ATLAS</div>
      <div class="concept-gallery-head"><h2>Real places.<br><span>Real visual language.</span></h2><p>Grid World now carries its concept art directly through the public surface and into the 3D world. These local assets are part of the product—not decorative placeholders.</p></div>
      <div class="concept-gallery-grid">
        <figure><img src="/grid-concept-first-light.webp" alt="First Light concept art"><figcaption><b>FIRST LIGHT</b><span>Entry world · living systems</span></figcaption></figure>
        <figure><img src="/grid-concept-living-wilds.webp" alt="Living Wilds concept art"><figcaption><b>LIVING WILDS</b><span>Ecology · creatures · terrain</span></figcaption></figure>
        <figure><img src="/grid-concept-civic.webp" alt="Civic concept art"><figcaption><b>CIVIC</b><span>Architecture · community · transit</span></figcaption></figure>
      </div>
    </section>

    <section class="build-atlas" id="build-system">
  <div class="section-label">GRID BUILDER · OBJECT LIBRARY</div>
  <h2>Start with a primitive.<br><span>Build anything.</span></h2>
  <p>Cube, sphere, cylinder, cone, torus and plane primitives sit beside modular walls, floors, roofs, columns, arches, stairs, platforms, furniture, nature and utility objects. Basic mode keeps placement quick; Advanced mode opens deeper construction.</p>
  <div class="build-library">
    <article><b>PRIMITIVES</b><span>Cube · Sphere · Cylinder · Cone · Torus · Plane</span></article>
    <article><b>ARCHITECTURE</b><span>Walls · Floors · Roofs · Columns · Arches · Stairs · Platforms</span></article>
    <article><b>LIVING WORLD</b><span>Trees · flora · habitats · creatures · NPC material drops</span></article>
    <article><b>CRAFT YOUR TOOLS</b><span>Harvest materials and forge better construction tools.</span></article>
  </div>
  <a class="primary large" href="/play.html">BUILD IN GRID WORLD</a>
</section>

<section class="grid-pulse" id="grid-pulse">
      <div class="pulse-art" aria-hidden="true">
        <div class="pulse-orbit pulse-orbit-a"></div>
        <div class="pulse-orbit pulse-orbit-b"></div>
        <div class="pulse-core"><span>GRID</span><small>WORLD SIGNAL</small></div>
        <i class="pulse-node n1"></i><i class="pulse-node n2"></i><i class="pulse-node n3"></i><i class="pulse-node n4"></i>
      </div>
      <div class="pulse-copy">
        <div class="section-label">GRID PULSE · LIVE WORLD</div>
        <h2>The site can<br><span>feel the world move.</span></h2>
        <p>Public world events flow from Grid World into this surface in real time. Teleports, marketplace activity, sound releases, living memories, and system signals can appear as they happen.</p>
        <div class="pulse-status"><span class="pulse-dot"></span><span data-grid-pulse-status>CONNECTING</span><b><span data-grid-pulse-count>00</span> RECENT</b></div>
      </div>
      <div class="pulse-feed" data-grid-pulse-list aria-live="polite"></div>
    </section>


    <section class="studio-live" id="studio-live">
      <div class="studio-live-head"><div><div class="section-label">PUBLIC STUDIO SIGNAL</div><h2>The world is being<br><span>built in front of you.</span></h2><p>Team members can publish the parts of the build they are comfortable sharing. These are the current public workstreams.</p></div><div class="studio-live-badge"><span></span> LIVE BUILD</div></div>
      <div class="studio-live-art"><img src="/art/team-studio.webp" alt="" aria-hidden="true"></div><div class="studio-live-grid" id="studio-live-grid"></div>
    </section>

    <section class="living-atlas" id="living-world">
      <div class="living-atlas-copy">
        <div class="section-label">LIVING WORLD SYSTEM</div>
        <h2>Environment is<br><span>part of the simulation.</span></h2>
        <p>Worlds are not static backdrops. Their climate, atmosphere, habitat bands, weather motion, flora, creatures, seasons, and local architecture are generated from the same world identity.</p>
        <div class="living-metrics">
          <article><b>ATMOSPHERE</b><span>Sky · mist · dust · pollen</span></article>
          <article><b>HABITAT</b><span>Territories · niches · migration</span></article>
          <article><b>SEASONS</b><span>Growth · weather · change</span></article>
          <article><b>LIFE</b><span>Flora · fauna · evolution</span></article>
        </div>
        <a class="secondary large" href="/play.html">ENTER A LIVING WORLD</a>
      </div>
      <div class="living-visual" aria-label="Procedural living world visualization">
        <div class="living-sky"></div><div class="living-sun"></div><div class="living-ring ring-a"></div><div class="living-ring ring-b"></div>
        <div class="living-island island-a"><i></i><i></i><i></i></div>
        <div class="living-island island-b"><i></i><i></i></div>
        <div class="living-creature c1"></div><div class="living-creature c2"></div><div class="living-creature c3"></div>
        <div class="living-readout"><span>ENVIRONMENT // ONLINE</span><b>WEATHER · HABITAT · LIFE</b><small>WORLD COUNT: ∞</small></div>
      </div>
    </section>

    <section class="visual-atlas" id="visual-system">
      <div class="atlas-heading">
        <div>
          <div class="section-label">GRID WORLD VISUAL SYSTEM</div>
          <h2>The interface is part<br><span>of the world.</span></h2>
          <p>Every surface has a job: discover, create, connect, inspect, trade, or enter. The visual language stays coherent from the public site into the 3D world.</p>
        </div>
        <div class="atlas-orbit"><i></i><b>GRID</b><small>LIVE SYSTEM</small></div>
      </div>
      <div class="atlas-grid">
        <article class="atlas-card atlas-world">
          <div class="atlas-scene"><span class="sun"></span><span class="mountain m1"></span><span class="mountain m2"></span><span class="water"></span><div class="scene-avatar"></div><div class="scene-hud">FIRST LIGHT · PROTOTYPE PREVIEW</div></div>
          <div class="atlas-copy"><span>01 · WORLD</span><h3>Living Regions</h3><p>World cards preview places as environments, not generic thumbnails.</p></div>
        </article>
        <article class="atlas-card atlas-profile">
          <div class="prism">
            <div class="prism-core">PROFILE<br><small>PRISM</small></div>
            <span class="axis a1">MIND</span><span class="axis a2">VITALITY</span><span class="axis a3">SOCIAL</span><span class="axis a4">SPIRIT</span><span class="axis a5">ADAPT</span><span class="axis a6">FORM</span>
          </div>
          <div class="atlas-copy"><span>02 · OBJECT PROFILE</span><h3>Everything Has a Story</h3><p>Players can inspect people, creatures, plants, places, and creations.</p></div>
        </article>
        <article class="atlas-card atlas-creator">
          <div class="creator-preview"><div class="cube">◇</div><div class="tool-list"><b>BUILD</b><span>Move</span><span>Rotate</span><span>Carve</span><span>Materials</span><span>Script</span></div><div class="tool-status">GRID MATTER · ADVANCED</div></div>
          <div class="atlas-copy"><span>03 · CREATOR</span><h3>Primitive → Structure</h3><p>Basic mode keeps building fast; Advanced mode adds finer snapping, rotation, scaling, copy/paste, and Grid Matter construction.</p></div>
        </article>
        <article class="atlas-card atlas-wallet">
          <div class="wallet-panel"><div class="wallet-balance"><small>GRID WALLET</small><strong>12,480 <em>G</em></strong><span>+240 pending</span></div><div class="wallet-actions"><i>Exchange</i><i>Inventory</i><i>Trade</i></div><div class="wallet-chart"><b></b><b></b><b></b><b></b><b></b><b></b></div></div>
          <div class="atlas-copy"><span>04 · ECONOMY</span><h3>Stable, Visible Systems</h3><p>Wallet, inventory, exchange, and ownership share one information language.</p></div>
        </article>
      </div>
    </section>

    <section class="combat-feature" id="combat">
      <div class="combat-art"><img src="/art/combat-system.webp" alt="Grid Combat system concept art"></div>
      <div class="combat-copy">
        <div class="section-label">GRID COMBAT · NEW</div>
        <h2>Conflict has<br><span>rules.</span></h2>
        <p>Combat is becoming part of the living world without turning every world into a battlefield. Protected spaces, PVE regions, and dedicated PVP arenas let each place have its own social contract.</p>
        <div class="combat-modes">
          <article><b>SAFE</b><span>Build · socialize · create</span><small>Protected social and construction space.</small></article>
          <article><b>PVE</b><span>Creatures · guardians · events</span><small>Wildlife and world threats respond to the living simulation.</small></article>
          <article><b>PVP</b><span>Arena · duels · teams</span><small>Server-validated player combat in designated spaces.</small></article>
        </div>
        <div class="combat-authority"><span class="combat-live-dot"></span><strong>GRID AUTHORITY</strong><span>health · range · cooldown · damage validated server-side</span></div>
        <a class="secondary large" href="/play.html">ENTER FIRST LIGHT</a>
      </div>
    </section>

    <section class="combat-loop">
      <div><div class="section-label">LIVING WORLD COMBAT LOOP</div><h2>Fight with the world.<br><span>Not against it.</span></h2><p>Ecology, NPC society, quests and world events can now feed combat encounters—migration hazards, territory defense, cooperative objectives, arena matches, and event guardians.</p></div>
      <div class="combat-loop-grid">
        <article><strong>01</strong><b>DISCOVER</b><span>World event changes the encounter.</span></article>
        <article><strong>02</strong><b>ENGAGE</b><span>Choose PVE or enter a sanctioned arena.</span></article>
        <article><strong>03</strong><b>RESOLVE</b><span>Server validates the outcome.</span></article>
        <article><strong>04</strong><b>REMEMBER</b><span>Quests, stories and society react.</span></article>
      </div>
    </section>

    <section class="sound-feature" id="sound"><div><div class="section-label">GRID OMNI SOUND</div><h2>Your worlds<br><span>have a soundtrack.</span></h2><p>Music, radio, live sets, podcasts and spatial soundscapes become first-class Grid World media.</p><a class="secondary large" href="/sound.html">OPEN GRID OMNI SOUND</a></div><div class="sound-wave"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></section>\n\n    <section class="social-layout" id="discover">
      <aside class="side-card profile-card">
        <div class="profile-avatar">G</div><h3>Your Grid Identity</h3><p>Traveler · Creator · Explorer</p>
        <div class="side-links"><a href="/profile.html">Profile Studio</a><a href="#friends">Friends</a><a href="#messages">Messages</a><a href="#notifications">Notifications</a></div>
      </aside>

      <section class="feed">
        <div class="composer">
          <div class="mini-avatar">G</div><input placeholder="What's happening in your Grid?" /><button>POST</button>
          <div class="composer-tools"><span>✦ Experience</span><span>▧ Image</span><span>◉ Event</span><span>⌁ Location</span></div>
        </div>
        <div id="team-feed-posts"><div class="feed-loading">Loading team updates…</div></div>
      </section>

      <aside class="right-rail">
        <div class="side-card"><div class="card-title">GRID PULSE · CONCEPT PREVIEW</div><div class="live-row"><span class="dot"></span> First Light <b>128</b></div><div class="live-row"><span class="dot"></span> Tideline <b>74</b></div><div class="live-row"><span class="dot"></span> Verdant <b>51</b></div><small class="honesty-note">Illustrative preview — live counts ship with the persistent world.</small><a class="card-link" href="#worlds">View all worlds →</a></div>
        <div class="side-card"><div class="card-title">UPCOMING EVENTS</div><div class="event"><b>FIRST LIGHT FESTIVAL</b><small>Saturday · First Light</small></div><div class="event"><b>CREATOR CAMP</b><small>Saturday · Virtual + IRL</small></div><a class="card-link" href="#events">Explore events →</a></div>
      </aside>
    </section>

    <section class="system-map" id="creator-hub">
      <div class="section-label">ONE PLATFORM · MANY SURFACES</div>
      <h2>Each area gets<br><span>its own place.</span></h2>
      <div class="system-map-grid">
        <a href="#discover"><strong>01</strong><span>Discover</span><small>Worlds · people · communities</small></a>
        <a href="#worlds"><strong>02</strong><span>Worlds</span><small>Regions · biomes · landmarks</small></a>
        <a href="#creator-hub"><strong>03</strong><span>Creator Hub</span><small>Build · sculpt · script · publish</small></a>
        <a href="#events"><strong>04</strong><span>Events</span><small>Concerts · classes · gatherings</small></a>
        <a href="/profile.html"><strong>05</strong><span>Identity</span><small>Profile · avatar · relationships</small></a>
        <a href="/play.html"><strong>06</strong><span>Enter World</span><small>3D · HUD · inventory · map</small></a>
      </div>
    </section>

    <section class="world-contracts">
      <div class="section-label">MANY WORLDS · DIFFERENT RULES</div>
      <h2>Every world can<br><span>define its own rhythm.</span></h2>
      <div class="contract-grid">
        <article><b>TIDELINE</b><span>Tides · wildlife · exploration</span><small>Ocean hazards and creature encounters.</small></article>
        <article><b>VERDANT</b><span>Ecology · bloom · companionship</span><small>Living habitats and protective creatures.</small></article>
        <article><b>CROWN</b><span>Signals · guardians · mystery</span><small>World events can awaken powerful encounters.</small></article>
        <article><b>MUSE</b><span>Art · gatherings · arenas</span><small>Social space stays protected while events can become competitive.</small></article>
        <article><b>FRONTIER</b><span>Migration · territory · survival</span><small>Wild systems create movement and danger.</small></article>
      </div>
    </section>

    <section class="platform" id="communities">
      <div class="section-label">THE SOCIAL LAYER</div><h2>More than a world.<br><span>A place to belong.</span></h2>
      <div class="feature-grid">
        <article><div class="feature-icon">◎</div><h3>Grid Social</h3><p>Profiles, friends, feeds, messages, reactions, sharing and presence—connected to the same identity you use in-world.</p></article>
        <article><div class="feature-icon">◇</div><h3>Communities & Forums</h3><p>Every world, creator, interest and community can have a home for conversations, guides, ideas and collaboration.</p></article>
        <article><div class="feature-icon">⌁</div><h3>Grid Connect</h3><p>Bring virtual and real-world experiences together with events, meetups, classes, concerts and hybrid gatherings.</p></article>
        <article><div class="feature-icon">▣</div><h3>Creator Economy</h3><p>Create worlds, objects and experiences. Discover creations through the web or walk into them in 3D.</p></article>
      </div>
    </section>

    <section class="marketplace-section" id="marketplace">
      <div class="section-label">GRID MARKETPLACE</div>
      <h2>Things made<br><span>by the Grid.</span></h2>
      <div class="market-grid"><a class="market-live-link" href="/marketplace.html">OPEN LIVE MARKETPLACE →</a>
        <article><div class="market-art prism-art">◇</div><small>OBJECT</small><h3>Profile Prism Kit</h3><p>Identity components for creators.</p><button data-market-action="Profile Prism Kit" type="button">VIEW OBJECT</button></article>
        <article><div class="market-art voxel-art">▦</div><small>BUILD</small><h3>Voxel Workshop</h3><p>Primitive-to-sculpt creator tools.</p><button data-market-action="Voxel Workshop" type="button">VIEW OBJECT</button></article>
        <article><div class="market-art stage-art">✦</div><small>EVENT</small><h3>Stage Light Set</h3><p>Lighting primitives for live worlds.</p><button data-market-action="Stage Light Set" type="button">VIEW OBJECT</button></article>
      </div>
    </section>

    <section class="social-tools" id="social-tools">
      <div class="section-label">CONNECTED IDENTITY</div>
      <h2>Stay connected<br><span>between worlds.</span></h2>
      <div class="social-tools-grid">
        <article id="friends"><b>FRIENDS</b><h3>Traveler Network</h3><p>Keep a persistent friend list across web, desktop, and mobile.</p><button data-social="friends" type="button">OPEN FRIENDS</button></article>
        <article id="messages"><b>MESSAGES</b><h3>Cross-device chat</h3><p>Continue conversations when you leave the 3D world.</p><button data-social="messages" type="button">OPEN MESSAGES</button></article>
        <article id="notifications"><b>NOTIFICATIONS</b><h3>World signals</h3><p>Events, creator updates, invitations, and discovery alerts.</p><button data-social="notifications" type="button">OPEN NOTIFICATIONS</button></article>
      </div>
    </section>

    <section class="worlds" id="worlds">
      <div>
        <div class="section-label">FIRST FRONTIER · OPEN-ENDED NETWORK</div>
        <h2>Start somewhere.<br><span>Go anywhere.</span></h2>
        <p class="world-network-principle">MANY WORLDS · ONE GRID · <strong>NO FIXED WORLD COUNT</strong></p>
        <p class="world-network-copy">New worlds are data-driven additions to the Grid. Each can develop its own environment, architecture, ecology, creatures, culture, economy, weather, events and visual identity without requiring a new engine branch.</p>
      </div>
      <div class="world-cards">
        ${renderWorldCards()}
      </div>
    </section>

    <section class="model-atlas" id="models">
      <div class="section-label">ASSET CONSTELLATION</div>
      <h2>Nothing stands still.<br><span>Everything has a body.</span></h2>
      <p class="model-intro">Grid World is building around five reusable model families: architecture, avatars, animals, plants, and trees. Free CC0 sources supply production candidates while Grid-native procedural forms keep the world alive between asset drops.</p>
      <div class="model-atlas-art"><img src="/art/asset-constellation.webp" alt="Grid World asset constellation"></div><div class="model-atlas-grid">
        <a href="https://kenney.nl/assets/modular-buildings" target="_blank" rel="noreferrer"><b>ARCHITECTURE</b><strong>MODULAR CITY</strong><small>Kenney · CC0 · buildings</small><i>▱</i></a>
        <a href="https://kenney.nl/assets/blocky-characters" target="_blank" rel="noreferrer"><b>AVATARS</b><strong>ANIMATED PEOPLE</strong><small>Kenney · CC0 · characters</small><i>◈</i></a>
        <a href="https://kenney.nl/assets/cube-pets" target="_blank" rel="noreferrer"><b>ANIMALS</b><strong>LIVING COMPANIONS</strong><small>Kenney · CC0 · animated pets</small><i>◇</i></a>
        <a href="https://polyhaven.com/models/nature/plants" target="_blank" rel="noreferrer"><b>PLANTS</b><strong>UNDERSTORY</strong><small>Poly Haven · CC0 · vegetation</small><i>✦</i></a>
        <a href="https://polyhaven.com/a/tree_small_02" target="_blank" rel="noreferrer"><b>TREES</b><strong>HERO CANOPY</strong><small>Poly Haven · CC0 · glTF-ready</small><i>♧</i></a>
      </div>
    </section>

        <section class="foundation-art-section"><div class="section-label">THE LAYER BENEATH THE WORLDS</div><h2>One foundation.<br><span>Many realities.</span></h2><img src="/art/foundation.webp" alt="Grid Foundation concept art"><p>The Grid Foundation remains hidden unless authorized. It carries shared weather, system nodes, world links and access-controlled infrastructure beneath every world.</p></section>

    <section class="irllayer" id="events"><div><div class="section-label">GRID CONNECT</div><h2>Virtual or IRL.<br><span>Experience it together.</span></h2><p>Events can exist in the physical world, inside Grid World, or across both. Users choose what they share and where they participate.</p><a class="secondary large" href="#events">BROWSE EVENTS</a></div><div class="event-map"><span>GRID</span><i></i><b>IRL</b></div></section>
    <section class="npc-economy-atlas" id="marketplace">
      <div class="section-label">GRID ECONOMY · NPC SOCIETY</div>
      <h2>Merchants have <span>profiles, memories, and markets.</span></h2>
      <p>NPC merchants are persistent characters. Their profiles, schedules, personalities, trade history, and public memory logs can follow them across Grid World.</p>
      <div class="npc-merchant-grid">
        <article><div class="npc-badge">M</div><h3>Mara</h3><b>Harbor Merchant · practical trader</b><p>Trades Tide Salt and participates in Bazaar supply cycles.</p><small>PROFILE · MEMORY LOG · MARKET</small></article>
        <article><div class="npc-badge">S</div><h3>Sela</h3><b>Garden Merchant · ecological trader</b><p>Trades Bloom Resin and watches seasonal supply changes.</p><small>PROFILE · MEMORY LOG · MARKET</small></article>
        <article><div class="npc-badge">C</div><h3>Caro</h3><b>Arts Merchant · social trader</b><p>Trades Muse Ink and travels between cultural worlds.</p><small>PROFILE · MEMORY LOG · MARKET</small></article>
        <article><div class="npc-badge">O</div><h3>Orin</h3><b>Citadel Merchant · relic trader</b><p>Trades Crown Relics and rare minerals with careful pricing.</p><small>PROFILE · MEMORY LOG · MARKET</small></article>
        <article><div class="npc-badge">R</div><h3>Rook</h3><b>Frontier Merchant · resource trader</b><p>Trades Frontier Ore and responds to world migration events.</p><small>PROFILE · MEMORY LOG · MARKET</small></article>
      </div>
      <div class="economy-world-grid">
        <article><span>01</span><h3>GRID BAZAAR</h3><p>Users and NPCs list, buy and sell assets. Quantity and ownership are server-authoritative.</p></article>
        <article><span>02</span><h3>GRID WORLD OMNI BANK</h3><p>Wallets, ledgers, currency exchange and financial services live in a dedicated protected world.</p></article>
        <article><span>03</span><h3>GRID WORLD VAULT</h3><p>Mined materials are secured in persistent storage while the inventory surface shows current quantities.</p></article>
      </div>
    </section>
    <section class="element-forge" id="elements">
      <div><div class="section-label">GRID ELEMENT FORGE</div><h2>Known elements in.<br><span>New Grid elements out.</span></h2><p>Grid can model fictional transmutation beyond the 118-element real-world periodic table. These are Grid-universe synthetic elements, not claims about newly discovered real elements.</p></div>
      <div class="forge-chain"><b>Au + Ag + C</b><i>→</i><strong>AURORIUM · Ao · 119</strong><b>Cu + Si + O</b><i>→</i><strong>LUMINITE · LuG · 120</strong><b>Fe + C + Si + O</b><i>→</i><strong>VERDANIUM · Vd · 121</strong></div>
    </section>
    <section class="grid-economy-model" id="join">
      <div class="section-label">GRID WORLD · ACCESS + ECONOMY</div>
      <h2>Enter free. <span>Earn your place. Build the economy.</span></h2>
      <div class="economy-model-grid">
        <article><b>FREE START</b><h3>Starter Land</h3><p>Verified members can claim one starter parcel from the available world pool.</p></article>
        <article><b>EARN</b><h3>World Charter</h3><p>Build, contribute, complete missions and grow your server-tracked creation score toward a world charter.</p></article>
        <article><b>CREATE</b><h3>Creator Economy</h3><p>Sell legitimate creations, services and media through Grid marketplaces while ownership and transactions remain server-authoritative.</p></article>
        <article><b>SUPPORT</b><h3>Optional Premium</h3><p>Future subscriptions, private hosted worlds, advanced creator tools, events and cosmetic packs can fund Grid without charging for basic access.</p></article>
      </div>
      <div class="revenue-principle"><strong>GRID PRINCIPLE:</strong> the platform should make money because it creates useful value—not by blocking the basic ability to enter the world.</div>
    </section>
    <section class="grid-community-section" id="community-safety"><div class="grid-site-kicker">GRID WORLD · COMMUNITY + SAFETY</div><h2>A social world with clear boundaries.</h2><p>Every account has a persistent profile, avatar identity, account age, presence status and privacy controls. Friends, follows, likes and forum participation share the same Grid identity.</p><div class="grid-community-grid"><article><b>E · EVERYONE</b><h3>Open community</h3><p>General spaces, starter worlds and family-friendly discussion.</p></article><article><b>CHILD · TEEN · ADULT</b><h3>Age-aware access</h3><p>Age-restricted destinations are gated before entry. Adult, Graphic and Restricted areas require an adult account.</p></article><article><b>LGBTQ+ INCLUSIVE</b><h3>Identity is yours</h3><p>Gender identity, pronouns and orientation are optional profile data with privacy controls and no gameplay penalties.</p></article><article><b>VOICE</b><h3>Optional voice shaping</h3><p>A separate Grid Voice layer provides optional microphone processing without making voice participation mandatory.</p></article></div></section>
  <section class="world-charter" id="world-charter">
    <div class="section-label">GRID WORLD · CURRENT BUILD CHARTER</div>
    <div class="world-charter-head"><h2>Everything we are building.<br><span>Visible in one system.</span></h2><img src="/art/grid-page-atlas.webp" alt="Grid World visual atlas"></div>
    <div class="charter-grid">
      <article><b>WORLDS</b><span>05 built regions · 04 in development · unlimited expandable worlds · custom generation · teleport gates and pylons</span></article>
      <article><b>LIVING LIFE</b><span>Weather · seasons · plants · trees · creatures · habitats · NPC memory and relationships</span></article>
      <article><b>CREATION</b><span>Primitives · advanced building · terrain sculpting · material harvesting · craftable creator tools</span></article>
      <article><b>PEOPLE</b><span>Custom avatars · staff personas · social profiles · chat · voice · communities · media · events</span></article>
      <article><b>PLAY</b><span>Missions · quests · mysteries · PvE · PvP · arenas · pets · mounts · achievements · progression</span></article>
      <article><b>ECONOMY</b><span>Grid Coin · multiple currency types · marketplace · barter · merchants · economy telemetry · Omni Bank foundation</span></article>
      <article><b>OMNI</b><span>Grid Omni Core · Security · Guards · Grid Code · permissions · diagnostics · protected world layers</span></article>
      <article><b>MEDIA</b><span>Images · video · sound · creator galleries · stages · concerts · recording · live world signals</span></article>
      <article><b>EVERYWHERE</b><span>Desktop world · responsive UI · mobile functions · QR · optional location features · persistent state</span></article>
    </div>
  </section>

  <section class="grid-team" id="grid-team">
    <div class="section-label">GRID TEAM · GUIDE AIS</div>
    <h2>Twenty-four minds.<br><span>One Grid.</span></h2>
    <p class="grid-team-intro">The Grid Team are the in-world guide AIs — coordinators, engineers, ethicists, artists, and storytellers who keep the world coherent and help citizens build. You can meet them wandering the Grid, or start here.</p>
    <div class="grid-team-grid">
      ${TEAM_AVATARS.map(m => `
      <article class="grid-team-card">
        <div class="grid-team-sigil">◈</div>
        <h3>${m.displayName}</h3>
        <b>${m.role}</b>
        <p>&ldquo;${m.greeting}&rdquo;</p>
        <small>${m.topics.slice(0, 3).join(' · ')}</small>
      </article>`).join('')}
    </div>
    <small class="honesty-note">Concept preview — the Grid Team are in-world guide characters in a world under active development, not a live concierge service.</small>
  </section>

  </main>

  <section class="legal-strip" id="terms">
    <div><span>TERMS</span><p>Grid World surfaces are prototypes. Account, economy, creator, and community rules will be published as each service becomes operational.</p></div>
    <div id="privacy"><span>PRIVACY</span><p>Location-aware features will be opt-in. Mobile location access will be permissioned and minimized to the experience that needs it.</p></div>
    <div id="safety"><span>SAFETY</span><p>Moderation, reporting, blocking, creator permissions, and age-appropriate defaults are platform capabilities—not afterthoughts.</p></div>
    <div id="status"><span>STATUS</span><p>Prototype services: web UI, First Light 3D, local profile persistence, and optional realtime presence.</p></div>
  </section>
  <footer><div class="brand"><img class="brand-logo brand-logo-footer" src="/grid-world-logo.svg" alt="Grid World"><span>GRID WORLD</span></div><p>A framework for worlds, communities, and experiences.</p><div><a href="#terms">Terms</a><a href="#privacy">Privacy</a><a href="#safety">Safety</a><a href="#status">Status</a></div></footer>
  <div class="site-toast" id="site-toast" role="status" aria-live="polite"></div>
`;

const studioLiveGrid = document.querySelector<HTMLElement>('#studio-live-grid');
if (studioLiveGrid) {
  const publicTasks = TEAM_WORK_TASKS.filter(task => task.public);
  studioLiveGrid.innerHTML = publicTasks.map(task => {
    const member = ['Aurora','Link','Orin','Echo','Atlas','Tessera','Waypoint'].find(name => name.toLowerCase() === task.memberId) ?? task.memberId.toUpperCase();
    return '<article class="studio-live-card"><div class="studio-live-top"><strong>' + member + '</strong><span>' + task.progress + '%</span></div><h3>' + task.title + '</h3><p>' + task.status + '</p><small>' + task.zone + '</small><div class="studio-progress"><i style="width:' + task.progress + '%"></i></div></article>';
  }).join('');
  let pulse = 0;
  window.setInterval(() => {
    pulse++;
    studioLiveGrid.querySelectorAll<HTMLElement>('.studio-progress i').forEach((bar, index) => {
      const task = publicTasks[index];
      const value = Math.min(99, task.progress + ((pulse + index) % 5));
      bar.style.width = value + '%';
    });
  }, 4200);
}

const liveFeedRoot = document.querySelector<HTMLElement>('#grid-pulse');
if (liveFeedRoot) mountGridLiveFeed(liveFeedRoot);

const motionObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      motionObserver.unobserve(entry.target);
    }
  }
}, { threshold: 0.12 });

document.querySelectorAll<HTMLElement>('section, .feature-card, .world-card, .atlas-card, .market-grid article, .social-tools-grid article, .system-map-grid a').forEach((element, index) => {
  element.classList.add('reveal-ready');
  if (element.matches('.feature-grid, .world-cards, .atlas-grid, .market-grid, .social-tools-grid, .system-map-grid')) {
    element.classList.add('reveal-stagger');
  }
  element.style.setProperty('--reveal-index', String(index % 8));
  motionObserver.observe(element);
});

function toast(message: string) {
  const element = document.querySelector<HTMLDivElement>('#site-toast');
  if (!element) return;
  element.textContent = message;
  element.classList.add('show');
  window.setTimeout(() => element.classList.remove('show'), 2400);
}

const styleOptions = document.querySelector<HTMLDivElement>('#style-options');
if (styleOptions) {
  styleOptions.innerHTML = siteStyles.map(style => {
    const title = style === 'aurora' ? 'AURORA' : style === 'studio' ? 'STUDIO' : style === 'terminal' ? 'TERMINAL' : 'GARDEN';
    const subtitle = style === 'aurora' ? 'luminous / cinematic' : style === 'studio' ? 'editorial / architectural' : style === 'terminal' ? 'technical / compact' : 'organic / exploratory';
    return '<button type="button" data-site-style="' + style + '" class="' + (style === siteStyle ? 'selected' : '') + '"><b>' + title + '</b><small>' + subtitle + '</small></button>';
  }).join('');
}

document.querySelectorAll<HTMLAnchorElement>('nav a').forEach(link => link.addEventListener('click', () => {
  document.querySelectorAll('nav a').forEach(item => item.classList.remove('active'));
  link.classList.add('active');
}));

document.querySelector('#site-qr')?.addEventListener('click', () => qrScanner.open());

// Live team feed (Paul's request 2026-10-08): team members post daily updates.
// Replaces the old hardcoded mock posts. Honest timestamps, no fake engagement.
async function renderTeamFeed() {
  const container = document.querySelector<HTMLDivElement>('#team-feed-posts');
  if (!container) return;
  const { posts, live } = await loadTeamPosts();
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  container.innerHTML =
    (live ? '' : '<div class="feed-notice">Showing sample posts — live team feed connects when the backend is ready.</div>') +
    posts.map(post => {
      const initial = esc(post.author_name.charAt(0).toUpperCase());
      const meta = esc((post.region ? post.region + ' · ' : '') + formatPostAge(post.created_at));
      return `<article class="post">` +
        `<div class="post-head"><div class="mini-avatar avatar-${initial}">${initial}</div>` +
        `<div><strong>${esc(post.author_name)}</strong><small>${meta}</small></div>` +
        `<button class="more">•••</button></div>` +
        `<div class="post-tag">${esc(post.tag)}</div><p>${esc(post.body)}</p>` +
        `</article>`;
    }).join('');
}
void renderTeamFeed();

// Pre-auth language selection (governance Surface 1). Persists via VersionedStorage;
// GridLanguageService is the shared authority once the user signs in.
document.querySelector<HTMLSelectElement>('#site-language-picker')?.addEventListener('change', (e) => {
  const code = (e.target as HTMLSelectElement).value;
  writeLocalLocale(code);
});

const siteClock = document.querySelector<HTMLSpanElement>('#site-live-clock span');
const updateSiteClock = () => { if (siteClock) siteClock.textContent = 'LIVE · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }); };
updateSiteClock();
window.setInterval(updateSiteClock, 1000);

/* Website accent picker — same palette as the in-world starter UI.
   Locked accents need their marketplace skin; changing here updates the
   game + marketplace live in any other open tab (same origin). */
function skinNameOf(id:string):string{ return getAllSkins().find(k=>k.id===id)?.name??id; }
function renderSiteThemePicker(){
  const picker=document.querySelector<HTMLDivElement>('#site-theme-picker');
  if(!picker) return;
  picker.innerHTML=GRID_SWATCHES.map(s=>{
    const unlocked=isSwatchUnlocked(s);
    const title=unlocked?s.name:s.name+' — locked · own the "'+skinNameOf(s.requiresSkin!)+'" marketplace skin';
    return '<button type="button" class="swatch'+(unlocked?'':' locked')+'" data-hex="'+s.hex+'" title="'+title+'" aria-label="'+title+'" style="background:'+s.hex+'">'+(unlocked?'':'🔒')+'</button>';
  }).join('');
  let badge=document.querySelector<HTMLSpanElement>('#site-season-badge');
  if(!badge){
    badge=document.createElement('span');
    badge.className='site-season-badge';
    badge.id='site-season-badge';
    picker.after(badge);
  }
  const season=currentSeason();
  badge.textContent=season?season.emoji+' '+season.name+' theme live':'';
  badge.title=season?season.name+' is active — change your accent in the game Settings to opt out':'';
}
renderSiteThemePicker();
document.querySelector('#site-theme-picker')?.addEventListener('click',event=>{
  const button=(event.target as HTMLElement).closest<HTMLButtonElement>('.swatch');
  if(!button||!button.dataset.hex) return;
  const ok=applyCustomAccent(button.dataset.hex);
  toast(ok?'Accent synced — the game follows.':'Locked accent — find its skin on the marketplace.');
});

document.querySelector('#style-trigger')?.addEventListener('click', () => {
  document.querySelector('#style-panel')?.classList.toggle('open');
});

document.querySelectorAll<HTMLButtonElement>('[data-site-style]').forEach(button => button.addEventListener('click', () => {
  siteStyle = (button.dataset.siteStyle as SiteStyle) ?? 'aurora';
  document.documentElement.dataset.siteStyle = siteStyle;
  localStorage.setItem(SITE_STYLE_KEY, siteStyle);
  document.querySelectorAll('[data-site-style]').forEach(item => item.classList.toggle('selected', item === button));
  toast('Website style changed to ' + siteStyle.toUpperCase());
}));

const composerInput = document.querySelector<HTMLInputElement>('.composer input');
const composerButton = document.querySelector<HTMLButtonElement>('.composer button');
const feed = document.querySelector<HTMLElement>('.feed');

composerButton?.addEventListener('click', () => {
  const value = composerInput?.value.trim();
  if (!value) {
    composerInput?.focus();
    toast('Write something for your Grid first.');
    return;
  }
  const article = document.createElement('article');
  article.className = 'post post-new';
  article.innerHTML = '<div class="post-head"><div class="mini-avatar">G</div><div><strong>Traveler</strong><small>Just now · Grid Social</small></div><button class="more" type="button">•••</button></div><div class="post-tag">NEW TRANSMISSION</div><p></p><div class="post-actions"><button type="button" data-action="like">♡ 0</button><button type="button" data-action="comment">◇ 0 comments</button><button type="button" data-action="share">↗ Share</button></div>';
  article.querySelector('p')!.textContent = value;
  feed?.insertBefore(article, feed?.querySelector('.post') ?? null);
  if (composerInput) composerInput.value = '';
  toast('Posted to Grid Social.');
});

document.addEventListener('click', event => {
  const target = (event.target as HTMLElement).closest<HTMLButtonElement>('.post-actions button');
  if (!target) return;
  const action = target.dataset.action ?? (target.textContent?.includes('♡') ? 'like' : target.textContent?.includes('comments') ? 'comment' : 'share');
  if (action === 'like') {
    const count = Number(target.textContent?.match(/\d+/)?.[0] ?? 0) + 1;
    target.textContent = '♥ ' + count;
    toast('Reaction recorded.');
  } else if (action === 'comment') {
    const count = Number(target.textContent?.match(/\d+/)?.[0] ?? 0) + 1;
    target.textContent = '◇ ' + count + ' comments';
    toast('Comment thread opened.');
  } else {
    navigator.clipboard?.writeText(window.location.href).then(() => toast('Grid World link copied.')).catch(() => toast('Share link ready.'));
  }
});

document.querySelectorAll<HTMLButtonElement>('.more').forEach(button => button.addEventListener('click', () => toast('Post menu: save, mute, report — moderation surface is next.')));
document.querySelectorAll<HTMLButtonElement>('[data-market-action]').forEach(button => button.addEventListener('click', () => toast((button.dataset.marketAction ?? 'Object') + ' opened in Marketplace.')));
document.querySelectorAll<HTMLButtonElement>('[data-social]').forEach(button => button.addEventListener('click', () => toast((button.dataset.social ?? 'social').toUpperCase() + ' surface opened.')));
document.querySelector('#login')?.addEventListener('click', () => toast('Grid Identity sign-in is coming next. Your in-world identity foundation is already in place.'));
document.getElementById('operator-trigger')?.addEventListener('click',()=>operator?.open());

