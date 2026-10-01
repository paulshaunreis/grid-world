import './site.css';
import './site-asset-health';
import { QRScanner } from './ui/QRScanner';
import { mountGridLiveFeed } from './site-live-feed';
import { TEAM_WORK_TASKS } from './world/TeamWorkSystem';
import { GridOperatorService } from './operator/GridOperatorService';
import { mountGridOperatorPanel } from './ui/GridOperatorPanel';
import { createClient } from '@supabase/supabase-js';
import { GridSocialAuthority } from './social/GridSocialAuthority';
import { mountGridSocialPanel } from './ui/GridSocialPanel';

const app = document.querySelector<HTMLDivElement>('#site')!;
const qrScanner = new QRScanner();
const operatorUrl=import.meta.env.VITE_SUPABASE_URL as string|undefined;
const operatorKey=import.meta.env.VITE_SUPABASE_ANON_KEY as string|undefined;
const operator=operatorUrl&&operatorKey?mountGridOperatorPanel(new GridOperatorService(createClient(operatorUrl,operatorKey))):null;
const socialClient=operatorUrl&&operatorKey?createClient(operatorUrl,operatorKey):null;
const social= socialClient ? mountGridSocialPanel(new GridSocialAuthority(socialClient)) : null;

const navItems = [
  ['Home','/'], ['Discover','/#discover'], ['Communities','/#communities'], ['Events','/meetups.html'], ['Marketplace','/marketplace.html'], ['Creator Hub','/grid-world-studio.html']
] as const;
const siteStyles = ['aurora', 'studio', 'terminal', 'garden'] as const;
type SiteStyle = typeof siteStyles[number];
const SITE_STYLE_KEY = 'grid-world:site-style';
let siteStyle = (localStorage.getItem(SITE_STYLE_KEY) as SiteStyle | null) ?? 'aurora';
document.documentElement.dataset.siteStyle = siteStyle;

const posts = [
  { avatar: 'A', name: 'Aurora', meta: 'First Light · 12m', text: 'First Light is online. The world is beginning to change with time, weather, and living systems.', tag: 'WORLD UPDATE', likes: 42, comments: 8 },
  { avatar: 'L', name: 'Link', meta: 'Creator Hub · 31m', text: 'Grid Script is designed to make creation powerful without handing creators unrestricted code execution.', tag: 'CREATION', likes: 27, comments: 5 },
  { avatar: 'R', name: 'Rey', meta: 'Community · 1h', text: 'What should we build next? A floating city, a giant forest, or something nobody has imagined yet?', tag: 'DISCUSSION', likes: 64, comments: 19 },
];

app.innerHTML = `
  <header class="site-header">
    <a class="brand" href="#home"><img class="brand-logo" src="/grid-world-logo.svg" alt="Grid World"><span>GRID WORLD</span></a>
    <nav>${navItems.map(([label, href], i) => `<a href="${href}" class="${i === 0 ? 'active' : ''}">${label}</a>`).join('')}</nav>
    <div class="header-actions">
      <button class="ghost style-trigger" id="style-trigger" type="button">STYLE</button><button class="operator-trigger" id="operator-trigger" type="button">GRID OPERATOR</button><button class="ghost" id="social-trigger" type="button">SOCIAL</button>
      <button class="ghost" id="site-qr" type="button">QR</button>
      <a class="ghost" href="/economics.html">ECONOMICS</a><a class="ghost" href="/marketplace.html">MARKET</a><a class="ghost" href="/sound.html">SOUND</a><a class="ghost" href="/grid-world-studio.html">GRID WORLD STUDIO</a><a class="ghost" href="/omni.html">OMNI</a><a class="ghost" href="/directory.html">STAFF</a><a class="ghost" href="/avatars.html">AVATARS</a><a class="ghost" href="/textures.html">TEXTURES</a><a class="ghost" href="/docs.html">DOCS</a><a class="ghost" href="/profile.html">PROFILE</a><a class="ghost" href="/social.html">SOCIAL</a>
      <a class="secondary" href="/join.html">JOIN GRID</a><a class="primary" href="/play.html">ENTER WORLD</a>
    </div>
  </header>
` + `
  <div class="site-live-clock" id="site-live-clock" aria-live="polite">GRID SIGNAL · <span>SYNCING</span></div>
  <div class="style-panel" id="style-panel" aria-label="Website style selector">
    <div class="style-panel-title">SITE VISUAL LANGUAGE</div>
    <p>Try different Grid World surface styles. Your choice is stored locally.</p>
    <div class="style-options" id="style-options"></div>
  </div>
  <main>
    <section class="hero" id="home">
      <div class="visual-build-badge">GRID WORLD · VISUAL BUILD 01 OCT 2026 · LIVE</div>
      <div class="hero-art" aria-hidden="true"></div><img class="hero-image-proof" src="/art/hero-worlds.svg?v=20261001" alt="Grid World concept art showing multiple connected living worlds"><div class="hero-grid"></div>
      <div class="hero-copy"><div class="eyebrow">A PERSISTENT FRAMEWORK FOR WORLDS</div><h1>One grid.<br><span>Infinite worlds.</span></h1><p>Explore connected worlds, meet people, create experiences, and build places that keep evolving even when you're offline.</p><div class="hero-actions"><a class="primary large" href="/join.html">JOIN GRID WORLD</a><a class="secondary large" href="/play.html">ENTER AS GUEST</a><a class="secondary large" href="#discover">EXPLORE WORLDS</a></div><div class="hero-stats"><span><b>09</b> starter regions</span><span><b>∞</b> expandable worlds</span><span><b>24/7</b> persistent simulation</span></div></div>
    </section>
    <section class="social-tools" id="communities"><div class="section-label">GRID SOCIAL · ONE CONNECTION LAYER</div><h2>Friends, guilds,<br><span>communities and NPCs.</span></h2><div class="social-tools-grid">
      <article><b>FRIENDS</b><h3>Personal connections</h3><p>Requests, accepted friends, blocking, presence and future messaging stay separate from organization permissions.</p><button type="button" data-social="friends">OPEN SOCIAL</button></article>
      <article><b>GROUPS + GUILDS</b><h3>Organized communities</h3><p>Private, invite-only and public organizations with independent membership and roles.</p><button type="button" data-social="guilds">OPEN COMMUNITIES</button></article>
      <article><b>TEAMS + STORES</b><h3>Work and commerce</h3><p>Teams coordinate work; stores represent persistent commercial spaces without changing friendship permissions.</p><button type="button" data-social="teams">OPEN NETWORK</button></article>
      <article><b>NPC ORGANIZATIONS</b><h3>Society has structure</h3><p>NPCs can belong to organizations, hold roles and participate in world society without being treated as user accounts.</p><button type="button" data-social="npcs">OPEN NPC SOCIETY</button></article>
    </div></section>
    <section class="build-atlas" id="build-system"><div class="section-label">GRID BUILDER · OBJECT LIBRARY</div><h2>Start with a primitive.<br><span>Build anything.</span></h2><p>Cube, sphere, cylinder, cone, torus and plane primitives sit beside modular walls, floors, roofs, columns, arches, stairs, platforms, furniture, nature and utility objects.</p><div class="build-library"><article><b>PRIMITIVES</b><span>Cube · Sphere · Cylinder · Cone · Torus · Plane</span></article><article><b>ARCHITECTURE</b><span>Walls · Floors · Roofs · Columns · Arches · Stairs · Platforms</span></article><article><b>LIVING WORLD</b><span>Trees · flora · habitats · creatures · NPC material drops</span></article><article><b>CRAFT YOUR TOOLS</b><span>Harvest materials and forge better construction tools.</span></article></div><a class="primary large" href="/play.html">BUILD IN GRID WORLD</a></section>
  </main>
  <section class="legal-strip" id="terms"><div><span>TERMS</span><p>Grid World surfaces are prototypes. Account, economy, creator, and community rules will be published as each service becomes operational.</p></div><div id="privacy"><span>PRIVACY</span><p>Location-aware features will be opt-in. Mobile location access will be permissioned and minimized.</p></div><div id="safety"><span>SAFETY</span><p>Moderation, reporting, blocking, creator permissions, and age-appropriate defaults are platform capabilities.</p></div><div id="status"><span>STATUS</span><p>Prototype services: web UI, First Light 3D, local profile persistence, and optional realtime presence.</p></div></section>
  <footer><div class="brand"><img class="brand-logo brand-logo-footer" src="/grid-world-logo.svg" alt="Grid World"><span>GRID WORLD</span></div><p>A framework for worlds, communities, and experiences.</p></footer>
  <div class="site-toast" id="site-toast" role="status" aria-live="polite"></div>
`;

const studioLiveGrid = document.querySelector<HTMLElement>('#studio-live-grid');
if (studioLiveGrid) {
  const publicTasks = TEAM_WORK_TASKS.filter(task => task.public);
  studioLiveGrid.innerHTML = publicTasks.map(task => {
    const member = ['Aurora','Link','Orin','Echo','Atlas','Tessera','Waypoint'].find(name => name.toLowerCase() === task.memberId) ?? task.memberId.toUpperCase();
    return '<article class="studio-live-card"><div class="studio-live-top"><strong>' + member + '</strong><span>' + task.progress + '%</span></div><h3>' + task.title + '</h3><p>' + task.status + '</p><small>' + task.zone + '</small><div class="studio-progress"><i style="width:' + task.progress + '%"></i></div></article>';
  }).join('');
}
const liveFeedRoot = document.querySelector<HTMLElement>('#grid-pulse'); if (liveFeedRoot) mountGridLiveFeed(liveFeedRoot);
function toast(message: string){const element=document.querySelector<HTMLDivElement>('#site-toast');if(!element)return;element.textContent=message;element.classList.add('show');window.setTimeout(()=>element.classList.remove('show'),2400);}
const styleOptions=document.querySelector<HTMLDivElement>('#style-options');if(styleOptions){styleOptions.innerHTML=siteStyles.map(style=>`<button type="button" data-site-style="${style}"><b>${style.toUpperCase()}</b><small>Grid visual language</small></button>`).join('');}
document.querySelectorAll<HTMLButtonElement>('[data-site-style]').forEach(button=>button.addEventListener('click',()=>{siteStyle=(button.dataset.siteStyle as SiteStyle)??'aurora';document.documentElement.dataset.siteStyle=siteStyle;localStorage.setItem(SITE_STYLE_KEY,siteStyle);toast('Website style changed to '+siteStyle.toUpperCase());}));
document.querySelector('#style-trigger')?.addEventListener('click',()=>document.querySelector('#style-panel')?.classList.toggle('open'));
document.querySelector('#site-qr')?.addEventListener('click',()=>qrScanner.open());
document.querySelector('#operator-trigger')?.addEventListener('click',()=>operator?.open());
document.querySelector('#social-trigger')?.addEventListener('click',()=>social?.open());
document.querySelectorAll<HTMLButtonElement>('[data-social]').forEach(button=>button.addEventListener('click',()=>social?.open()));
const siteClock=document.querySelector<HTMLSpanElement>('#site-live-clock span');const updateSiteClock=()=>{if(siteClock)siteClock.textContent='LIVE · '+new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'});};updateSiteClock();window.setInterval(updateSiteClock,1000);
